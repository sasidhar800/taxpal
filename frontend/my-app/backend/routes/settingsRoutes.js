import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.js";
import Settings from "../models/Settings.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${req.userId}-${Date.now()}${ext || ".jpg"}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }

    return cb(null, true);
  },
});

const allowedFields = [
  "name",
  "email",
  "darkMode",
  "language",
  "startPage",
  "theme",
  "notifications",
  "soundEffects",
  "privacyMode",
  "autoSave",
  "systemNotifications",
  "frequency",
  "profileImage",
];

const pickSettingsPayload = (body = {}) =>
  Object.fromEntries(
    allowedFields
      .filter((field) => body[field] !== undefined && body[field] !== null)
      .map((field) => [field, body[field]])
  );

const getSettingsQuery = (userId) =>
  userId
    ? {
        userId,
      }
    : {
        userId: null,
      };

const getOrCreateSettings = async (userId) => {
  const query = getSettingsQuery(userId);
  let settings = await Settings.findOne(query);

  if (!settings) {
    const user = userId
      ? await User.findById(userId).select("name email profileImage")
      : null;

    settings = await Settings.create({
      ...query,
      ...(user
        ? {
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
          }
        : {}),
    });
  }

  return settings;
};

router.use(optionalAuth);

router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.userId);
    res.json(settings);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to fetch settings",
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.userId);
    const payload = pickSettingsPayload(req.body);

    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.name) {
      payload.name = payload.name.trim();
    }

    Object.assign(settings, payload);
    await settings.save();

    res.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to update settings",
    });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const settings = await getOrCreateSettings(req.userId);

    if (req.userId) {
      const duplicateUser = await User.findOne({
        email,
        _id: {
          $ne: req.userId,
        },
      });

      if (duplicateUser) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      await User.findByIdAndUpdate(
        req.userId,
        {
          name,
          email,
          profileImage: req.body.profileImage || settings.profileImage,
        },
        {
          runValidators: true,
        }
      );
    }

    settings.name = name;
    settings.email = email;
    settings.profileImage = req.body.profileImage || settings.profileImage;

    await settings.save();

    return res.json({
      message: "Profile updated successfully",
      settings,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

router.post(
  "/profile-image",
  requireAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Profile image is required",
        });
      }

      const apiOrigin =
        process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
      const publicPath = `${apiOrigin}/uploads/${req.file.filename}`;
      const settings = await getOrCreateSettings(req.userId);

      settings.profileImage = publicPath;
      await settings.save();

      await User.findByIdAndUpdate(req.userId, {
        profileImage: publicPath,
      });

      return res.json({
        message: "Profile image updated successfully",
        settings,
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: "Profile image upload failed",
      });
    }
  }
);

router.post("/notifications/test", async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.userId);
    const priority = Number(req.body.priority || 50);
    const shouldDeliver =
      settings.notifications && Number(settings.frequency) >= priority;

    settings.lastNotificationAt = new Date();
    await settings.save();

    res.json({
      delivered: shouldDeliver,
      channel: settings.systemNotifications ? "system" : "in-app",
      message: shouldDeliver
        ? "Notification delivered"
        : "Notification skipped by frequency settings",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Notification test failed",
    });
  }
});

export default router;

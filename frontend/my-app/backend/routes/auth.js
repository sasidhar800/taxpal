import crypto from "crypto";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { JWT_SECRET, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const signAppToken = (user) =>
  jwt.sign(
    {
      id: user._id,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  provider: user.provider,
});

router.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "Protected data working",
  });
});

router.post("/signup", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = signAppToken(user);

    res.status(201).json({
      message: "Signup success",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Signup failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = signAppToken(user);

    res.status(200).json({
      message: "Login success",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Login error",
    });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = req.body.name?.trim() || "Google User";
    const profileImage = req.body.photoURL || "";

    if (!email || !req.body.idToken) {
      return res.status(400).json({
        message: "Google account details are required",
      });
    }

    let user = await User.findOne({
      email,
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        profileImage,
        provider: "google",
        password: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10),
      });
    } else {
      user.name = user.name || name;
      user.profileImage = user.profileImage || profileImage;
      user.provider = user.provider || "google";
      await user.save();
    }

    const token = signAppToken(user);

    return res.json({
      message: "Google login success",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
});

router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Password update failed",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found for this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    console.log("Password reset email payload:", {
      to: user.email,
      subject: "Reset your TaxPal password",
      resetUrl,
      expiresAt,
    });

    return res.json({
      message: "Password reset instructions sent",
      resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Password reset request failed",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const {
      token,
      password,
    } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Password reset failed",
    });
  }
});

export default router;

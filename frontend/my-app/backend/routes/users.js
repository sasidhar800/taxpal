import express from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(requireAuth);

const normalizeUserPayload = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim().toLowerCase(),
  role: body.role?.trim() || "User",
});

// ==========================
// GET USERS
// ==========================
router.get("/", async (req, res) => {

  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// ==========================
// ADD USER
// ==========================
router.post("/", async (req, res) => {

  try {

    const {
      name,
      email,
      role,
    } = normalizeUserPayload(req.body);

    const { password } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message:
          "Name, email, and password are required",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const userResponse =
      newUser.toObject();

    delete userResponse.password;

    res.status(201).json(userResponse);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error adding user",
    });
  }
});

// ==========================
// DELETE USER
// ==========================
router.delete("/:id", async (req, res) => {

  try {

    const deletedUser =
      await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {

      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Delete failed",
    });
  }
});

// ==========================
// UPDATE USER
// ==========================
router.put("/:id", async (req, res) => {

  try {

    const {
      name,
      email,
      role,
    } = normalizeUserPayload(req.body);

    if (!name || !email || !role) {

      return res.status(400).json({
        message:
          "Name, email, and role are required",
      });
    }

    const duplicateUser =
      await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });

    if (duplicateUser) {

      return res.status(400).json({
        message: "Email already in use",
      });
    }

    const updateData = {
      name,
      email,
      role,
    };

    if (req.body.password) {

      updateData.password =
        await bcrypt.hash(
          req.body.password,
          10
        );
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!updatedUser) {

      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(updatedUser);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Update failed",
    });
  }
});

export default router;

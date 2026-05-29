import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    name: {
      type: String,
      default: "Sasidhar",
      trim: true,
    },

    email: {
      type: String,
      default: "user@example.com",
      lowercase: true,
      trim: true,
    },

    darkMode: {
      type: Boolean,
      default: true,
    },

    language: {
      type: String,
      enum: ["English", "Tamil", "Hindi"],
      default: "English",
    },

    startPage: {
      type: String,
      enum: [
        "Dashboard",
        "Users",
        "Analytics",
        "Transactions",
        "Budget",
        "Tax",
        "Settings",
      ],
      default: "Dashboard",
    },

    theme: {
      type: String,
      enum: ["Modern Dark", "Midnight Blue", "Elegant Purple"],
      default: "Modern Dark",
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    soundEffects: {
      type: Boolean,
      default: false,
    },

    privacyMode: {
      type: Boolean,
      default: false,
    },

    autoSave: {
      type: Boolean,
      default: true,
    },

    systemNotifications: {
      type: Boolean,
      default: true,
    },

    frequency: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    lastNotificationAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index(
  {
    userId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      userId: {
        $type: "objectId",
      },
    },
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

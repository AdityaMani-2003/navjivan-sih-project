import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    heightCm: { type: Number },
    weightKg: { type: Number },

    // Core profile discriminator — null = not yet completed onboarding
    userType: {
      type: String,
      enum: ["smoker", "non-smoker", null],
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    subscriptionTier: {
      type: String,
      enum: ["free", "premium", "elite"],
      default: "free",
    },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckIn: { type: Date },

    achievements: [
      {
        id: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    fcmToken: { type: String },
    expoPushToken: { type: String },
    consentGivenAt: { type: Date, default: Date.now },

    // Legacy profiles for backward compatibility
    smokerProfile: {
      cigarettesPerDay: { type: Number, default: 10 },
      yearsSmoking: { type: Number, default: 1 },
      triggers: { type: [String], default: [] },
      quitStrategy: { type: String, default: "gradual" },
      costPerPack: { type: Number, default: 200 },
      previousAttempts: { type: Number, default: 0 },
    },
    fitnessProfile: {
      goal: { type: String, default: "general_wellness" },
      level: { type: String, default: "beginner" },
      sport: { type: String, default: null },
      workoutDays: { type: [String], default: [] },
      dietaryPref: { type: String, default: "vegetarian" },
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Performance Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userType: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

import mongoose from "mongoose";

const gamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalXpEarned: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckIn: { type: Date },

    achievements: [
      {
        id: { type: String, required: true },
        title: { type: String },
        description: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now },
        xpValue: { type: Number, default: 50 },
      },
    ],

    activeChallenges: [
      {
        challengeId: { type: String },
        joinedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
      },
    ],

    completedChallenges: [
      {
        challengeId: { type: String },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

gamificationSchema.index({ xp: -1 });

export const Gamification =
  mongoose.models.Gamification ||
  mongoose.model("Gamification", gamificationSchema);

export default Gamification;

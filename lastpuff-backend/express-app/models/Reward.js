import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    xpEarned: { type: Number, required: true },
    source: {
      type: String,
      enum: [
        "day_streak",
        "breathing_exercise",
        "sos_resistance",
        "community_post",
        "game_completion",
        "profile_completion",
        "workout_completed",
        "meal_logged",
        "padyatra_milestone",
        "achievement_unlock",
        "referral",
        "other",
      ],
      default: "other",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Reward", rewardSchema);

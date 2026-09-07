import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true, // Midnight UTC
    },
    tasksCompleted: { type: Number, default: 0 },
    tasksTotal: { type: Number, default: 3 },
    xpEarned: { type: Number, default: 0 },
    stepsCount: { type: Number, default: 0 },
    cigarettesSmoked: { type: Number, default: 0 },
    cigarettesAvoided: { type: Number, default: 0 },
    cravingsLogged: { type: Number, default: 0 },
    cravingsResisted: { type: Number, default: 0 },
    caloriesConsumed: { type: Number, default: 0 },
    waterLitres: { type: Number, default: 0 },
    workoutMinutes: { type: Number, default: 0 },
    mood: { type: Number, min: 1, max: 5, default: 3 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;

import mongoose from "mongoose";

const stepLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    steps: {
      type: Number,
      default: 0,
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    padyatraRoute: {
      type: String,
      default: "dandi_march",
    },
    padyatraKmProgress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

stepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const StepLog =
  mongoose.models.StepLog || mongoose.model("StepLog", stepLogSchema);

export default StepLog;

import mongoose from "mongoose";

const cravingLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    triggerType: {
      type: String,
      default: "general",
    },
    intensity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    resisted: {
      type: Boolean,
      required: true,
    },
    interventionUsed: {
      type: String,
      default: "breathing_478",
    },
    durationMinutes: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

cravingLogSchema.index({ userId: 1, timestamp: -1 });

export const CravingLog =
  mongoose.models.CravingLog || mongoose.model("CravingLog", cravingLogSchema);

export default CravingLog;

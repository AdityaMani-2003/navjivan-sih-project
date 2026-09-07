import mongoose from "mongoose";

const cravingLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now },
    resisted: { type: Boolean, default: true },
    triggerType: {
      type: String,
      enum: ["stress", "social", "boredom", "after_meals", "alcohol", "morning", "other"],
      default: "other",
    },
    interventionUsed: {
      type: String,
      enum: ["breathing", "game", "quitline", "community", "emergency_contact", "none"],
      default: "none",
    },
    intensity: { type: Number, min: 1, max: 10, default: 5 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CravingLog", cravingLogSchema);

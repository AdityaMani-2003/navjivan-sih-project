import mongoose from "mongoose";

const stepLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    steps: { type: Number, default: 0 },
    padyatraRoute: { type: String, default: null }, // e.g. "dandi_march"
    kmProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

stepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("StepLog", stepLogSchema);

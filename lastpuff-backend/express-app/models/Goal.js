import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: "" }, // e.g. "days", "km", "cigs"
    dueDate: { type: Date, default: null },
    aiSuggested: { type: Boolean, default: false },
    aiCommentary: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    category: {
      type: String,
      enum: ["quit", "fitness", "nutrition", "mental", "custom"],
      default: "custom",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);

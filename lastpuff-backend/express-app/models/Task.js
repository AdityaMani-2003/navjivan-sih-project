import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      index: true,
    },
    date: {
      type: Date,
      required: true, // Midnight UTC
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["fitness", "nutrition", "cessation", "mindfulness", "community", "padyatra"],
      default: "cessation",
    },
    duration: {
      type: Number, // in minutes
      default: 5,
    },
    xpReward: {
      type: Number,
      default: 20,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, status: 1 });

export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;

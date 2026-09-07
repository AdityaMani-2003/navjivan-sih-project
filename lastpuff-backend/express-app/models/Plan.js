import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["cold_turkey", "gradual_reduction", "basic", "intermediate", "advanced"],
      required: true,
    },
    userType: {
      type: String,
      enum: ["smoker", "non-smoker"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    durationDays: {
      type: Number,
      default: 30,
    },
    planName: {
      type: String,
      required: true,
    },
    planDescription: {
      type: String,
      default: "",
    },
    goals: [
      {
        id: { type: String },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        type: { type: String, default: "milestone" },
        targetValue: { type: Number },
        unit: { type: String },
        deadline: { type: Number }, // day number
      },
    ],
    weeklyStructure: [
      {
        week: { type: Number, required: true },
        theme: { type: String, required: true },
        focus: { type: String, default: "" },
        tasks: { type: Array, default: [] },
      },
    ],
    aiGeneratedContent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recommendationReasonCodes: {
      type: [String],
      default: [],
    },
    recommendationExplanation: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

planSchema.index({ userId: 1, status: 1 });

export const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
export default Plan;

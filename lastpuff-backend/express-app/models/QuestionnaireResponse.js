import mongoose from "mongoose";

const questionnaireResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["smoker", "non-smoker"],
      required: true,
    },
    rawAnswers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    extractedFeatures: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
  },
  { timestamps: true }
);

questionnaireResponseSchema.index({ userId: 1, createdAt: -1 });

export const QuestionnaireResponse =
  mongoose.models.QuestionnaireResponse ||
  mongoose.model("QuestionnaireResponse", questionnaireResponseSchema);

export default QuestionnaireResponse;

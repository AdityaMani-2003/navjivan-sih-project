import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    time: { type: String, default: "lunch" },
    imageUrl: { type: String },
    aiConfidence: { type: Number, default: 1.0 },
  },
  { _id: true, timestamps: true }
);

const nutritionLogSchema = new mongoose.Schema(
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
    meals: [mealSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    waterLitres: { type: Number, default: 0 },
  },
  { timestamps: true }
);

nutritionLogSchema.index({ userId: 1, date: 1 });

export const NutritionLog =
  mongoose.models.NutritionLog ||
  mongoose.model("NutritionLog", nutritionLogSchema);

export default NutritionLog;

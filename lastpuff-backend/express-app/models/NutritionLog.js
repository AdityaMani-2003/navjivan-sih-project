import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Unnamed Meal" },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      default: "snack",
    },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    imageUrl: { type: String, default: null },
    time: { type: String, default: null }, // HH:MM
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: true }
);

const nutritionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    meals: [mealSchema],
    waterGlasses: { type: Number, default: 0 },
    calorieGoal: { type: Number, default: 2200 },
    proteinGoal: { type: Number, default: 60 },
  },
  { timestamps: true }
);

nutritionLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("NutritionLog", nutritionLogSchema);

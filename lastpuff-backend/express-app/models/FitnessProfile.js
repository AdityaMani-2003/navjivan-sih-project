import mongoose from "mongoose";

const fitnessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    primaryGoal: {
      type: String,
      default: "improve_fitness",
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    activityFrequency: { type: String, default: "1-2" },
    activityDuration: { type: String, default: "15-30" },
    currentActivities: { type: [String], default: ["walking"] },
    preferredActivities: { type: [String], default: ["walking", "yoga"] },
    exerciseLocation: { type: String, default: "home" },
    socialPreference: { type: String, default: "alone" },
    motivation: { type: [String], default: ["better_health"] },
    dietType: {
      type: String,
      enum: ["vegetarian", "non_vegetarian", "vegan", "jain", "halal", "no_restriction"],
      default: "vegetarian",
    },
    mealsPerDay: { type: Number, default: 3 },
    fastFoodFrequency: { type: String, default: "rarely" },
    waterIntakeLitres: { type: Number, default: 2.0 },
    nutritionGoal: { type: String, default: "healthy_eating" },
    foodAvoidances: { type: [String], default: [] },
    sleepHours: { type: Number, default: 7 },
    sleepQuality: { type: String, default: "good" },
    stressLevel: { type: String, default: "moderate" },
    sedentaryHours: { type: String, default: "4-6h" },
    availableExerciseMinutes: { type: Number, default: 30 },
    safetyFlags: { type: [String], default: [] },
    hasSafetyRisk: { type: Boolean, default: false },
    computedBMI: { type: Number, default: 22.5 },
    computedTDEE: { type: Number, default: 2000 },
    computedPlanLevel: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      default: "basic",
    },
  },
  { timestamps: true }
);

export const FitnessProfile =
  mongoose.models.FitnessProfile ||
  mongoose.model("FitnessProfile", fitnessProfileSchema);

export default FitnessProfile;

import mongoose from "mongoose";

const smokingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    tobaccoProduct: { type: [String], default: ["cigarettes"] },
    durationOfUse: { type: String, default: "1_to_3_yrs" },
    frequencyPerDay: { type: Number, default: 10 },
    timeToFirstUse: {
      type: String,
      enum: ["within_5_min", "6_to_30_min", "31_to_60_min", "after_60_min"],
      default: "6_to_30_min",
    },
    nightUse: { type: Boolean, default: false },
    dailySpend: { type: Number, default: 150 },
    cravingFrequency: { type: String, default: "several_times_day" },
    cravingIntensity: { type: Number, min: 1, max: 5, default: 3 },
    cravingResistance: { type: Number, min: 1, max: 5, default: 3 },
    triggers: { type: [String], default: ["stress", "after_meals"] },
    previousQuitAttempts: { type: Number, default: 0 },
    previousQuitMethods: { type: [String], default: [] },
    longestSmokeFreePeriod: { type: String, default: "less_than_1_day" },
    relapseReasons: { type: [String], default: [] },
    motivationScore: { type: Number, min: 0, max: 10, default: 7 },
    confidenceScore: { type: Number, min: 0, max: 10, default: 6 },
    importanceScore: { type: Number, min: 0, max: 10, default: 8 },
    quitTimeline: {
      type: String,
      enum: ["immediately", "within_1_week", "within_1_month", "within_3_months", "not_ready_yet"],
      default: "within_1_week",
    },
    socialSupport: { type: String, enum: ["yes", "no", "not_sure"], default: "yes" },
    smokingEnvironment: { type: String, default: "alone" },
    computedDependenceScore: { type: Number, default: 5 },
    computedReadinessScore: { type: Number, default: 7 },
    fagerstromScore: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export const SmokingProfile =
  mongoose.models.SmokingProfile ||
  mongoose.model("SmokingProfile", smokingProfileSchema);

export default SmokingProfile;

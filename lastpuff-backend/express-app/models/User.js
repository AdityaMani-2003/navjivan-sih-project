import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true },
  cigarettesAvoided: { type: Number, default: 0 },
  moneySaved: { type: Number, default: 0 },
  goalsCompleted: { type: Number, default: 0 },
  cravingsHandled: { type: Number, default: 0 },
});

// ─── Smoker Profile Sub-document ────────────────────────────
const smokerProfileSchema = new mongoose.Schema(
  {
    cigarettesPerDay: { type: Number, default: 10 },
    yearsSmoking: { type: Number, default: 1 },
    triggers: { type: [String], default: [] },
    quitStrategy: {
      type: String,
      enum: ["cold_turkey", "gradual"],
      default: "gradual",
    },
    costPerPack: { type: Number, default: 200 },
    previousAttempts: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Fitness Profile Sub-document ───────────────────────────
const fitnessProfileSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      enum: ["weight_loss", "build_strength", "athlete", "general_wellness"],
      default: "general_wellness",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    sport: { type: String, default: null },
    workoutDays: { type: [String], default: [] },
    dietaryPref: {
      type: String,
      enum: ["vegetarian", "vegan", "nonveg", "jain"],
      default: "vegetarian",
    },
  },
  { _id: false }
);

// ─── Achievement Sub-document ───────────────────────────────
const achievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Emergency Contact Sub-document ─────────────────────────
const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

// ─── Main User Schema ──────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // Profile type — CRITICAL: determines which dashboard/features the user sees
    userType: {
      type: String,
      enum: ["smoker", "non-smoker"],
      default: "smoker",
    },

    age: { type: Number },
    heightCm: { type: Number },
    weightKg: { type: Number },

    // Legacy plan field (backward compat)
    plan: {
      type: String,
      enum: ["gradual", "aggressive", "A"],
      default: "gradual",
    },

    // Profile sub-documents
    smokerProfile: { type: smokerProfileSchema, default: null },
    fitnessProfile: { type: fitnessProfileSchema, default: null },

    // Streak & legacy stats
    streak: { type: Number, default: 0 },
    lastStreakUpdateDate: { type: String, default: null },

    // Gamification
    puffCoins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: { type: [achievementSchema], default: [] },
    healthScore: { type: Number, default: 0 },

    // Subscription
    subscriptionTier: {
      type: String,
      enum: ["free", "premium", "elite"],
      default: "free",
    },

    totalRelapses: { type: Number, default: 0 },

    // Onboarding & habits (legacy — kept for backward compat)
    cigarettesPerDay: { type: Number, default: 10 },
    pricePerPack: { type: Number, default: 200 },
    pricePerCigarette: { type: Number, default: 10 },
    smokingYears: { type: Number, default: 1 },
    quitDate: { type: String, default: null },

    // Push notifications
    expoPushToken: { type: String, default: null },
    fcmToken: { type: String, default: null },

    // Emergency contact (SOS)
    emergencyContact: { type: emergencyContactSchema, default: null },

    // AI Insight cache
    lastAiInsight: { type: String, default: null },
    lastAiInsightDate: { type: String, default: null },

    // Profile image
    profileImageUrl: { type: String, default: null },

    // Onboarding completed flag
    onboardingComplete: { type: Boolean, default: false },

    dailyStats: [dailyStatsSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

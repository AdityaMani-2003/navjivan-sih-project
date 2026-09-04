import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true },
  cigarettesAvoided: { type: Number, default: 0 },
  moneySaved: { type: Number, default: 0 },
  goalsCompleted: { type: Number, default: 0 },
  cravingsHandled: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    age: { type: Number },
    heightCm: { type: Number },
    weightKg: { type: Number },

    plan: { type: String, enum: ["gradual", "aggressive", "A"], default: "gradual" },

    streak: { type: Number, default: 0 },                
    lastStreakUpdateDate: { type: String, default: null }, 

    puffCoins: { type: Number, default: 0 },             
    totalRelapses: { type: Number, default: 0 },         

    // Onboarding & habits
    cigarettesPerDay: { type: Number, default: 10 },
    pricePerPack: { type: Number, default: 200 },
    pricePerCigarette: { type: Number, default: 10 },
    smokingYears: { type: Number, default: 1 },
    quitDate: { type: String, default: null },

    // Push notifications
    expoPushToken: { type: String, default: null },

    // AI Insight cache
    lastAiInsight: { type: String, default: null },
    lastAiInsightDate: { type: String, default: null },

    dailyStats: [dailyStatsSchema],                      
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

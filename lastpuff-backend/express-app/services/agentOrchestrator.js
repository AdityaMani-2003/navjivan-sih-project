import User from "../models/User.js";
import Plan from "../models/Plan.js";
import Progress from "../models/Progress.js";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import { aiService } from "./aiService.js";

export const AGENT_TOOLS = {
  getUserProfile: async (userId) => {
    return await User.findById(userId).select("-passwordHash").lean();
  },

  getCurrentPlan: async (userId) => {
    return await Plan.findOne({ userId, status: "active" }).lean();
  },

  getProgressLast7Days: async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return await Progress.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: 1 })
      .lean();
  },

  getTaskCompletionRate: async (userId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate },
    }).lean();

    if (!tasks.length) return 100;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  },

  createGoal: async (userId, goalData) => {
    return await Goal.create({
      userId,
      ...goalData,
    });
  },

  updatePlanDifficulty: async (planId, adjustment) => {
    const plan = await Plan.findById(planId);
    if (!plan) return null;
    plan.version = (plan.version || 1) + 1;
    if (adjustment === "increase") {
      plan.planDescription = `${plan.planDescription || ""} [Difficulty scaled up for high performance]`;
    } else if (adjustment === "decrease") {
      plan.planDescription = `${plan.planDescription || ""} [Intensity scaled down for recovery]`;
    }
    await plan.save();
    return plan;
  },

  generateMotivationalMessage: async (context) => {
    const prompt = `Generate a 2-sentence empathetic, inspiring message for a user working on wellness. Context: ${JSON.stringify(
      context
    )}`;
    return await aiService.generateText(prompt);
  },
};

export async function runWeeklyAgentReview(userId) {
  try {
    const [profile, plan, progress, completionRate] = await Promise.all([
      AGENT_TOOLS.getUserProfile(userId),
      AGENT_TOOLS.getCurrentPlan(userId),
      AGENT_TOOLS.getProgressLast7Days(userId),
      AGENT_TOOLS.getTaskCompletionRate(userId, 7),
    ]);

    if (!profile) return null;

    const agentPrompt = `
You are an expert AI wellness coach agent for Navjivan. Review this user's past 7 days and provide actionable, encouraging insights.

USER PROFILE:
${JSON.stringify(
  {
    name: profile.name,
    userType: profile.userType,
    streak: profile.streak,
    level: profile.level,
  },
  null,
  2
)}

PAST WEEK PROGRESS ENTRIES:
${JSON.stringify(progress, null, 2)}

TASK COMPLETION RATE: ${completionRate}%
CURRENT PLAN TYPE: ${plan?.planType || "None"}

Analyze this real progress and respond with this EXACT JSON format:
{
  "insights": ["insight 1 based on their data", "insight 2", "insight 3"],
  "adjustments": ["specific adjustment 1", "specific adjustment 2"],
  "nextWeekFocus": "one powerful sentence describing what to focus on next week",
  "motivationalMessage": "2-3 sentence personalized message addressing their real effort",
  "shouldIncreaseDifficulty": boolean,
  "shouldDecreaseDifficulty": boolean,
  "difficultyReason": "brief reason"
}`;

    const review = await aiService.generateJSON(agentPrompt);

    if (review.shouldIncreaseDifficulty && plan) {
      await AGENT_TOOLS.updatePlanDifficulty(plan._id, "increase");
    } else if (review.shouldDecreaseDifficulty && plan) {
      await AGENT_TOOLS.updatePlanDifficulty(plan._id, "decrease");
    }

    return review;
  } catch (err) {
    console.error(`[Agent Review Failed for ${userId}]:`, err.message);
    return {
      insights: ["Maintained steady commitment throughout the week."],
      adjustments: ["Focus on regular hydration and craving logging."],
      nextWeekFocus: "Consolidate your streak and build momentum.",
      motivationalMessage:
        "Every single day of mindful effort creates compounding neurological recovery. Be proud of your journey so far.",
      shouldIncreaseDifficulty: false,
      shouldDecreaseDifficulty: false,
      difficultyReason: "Consistent routine maintained",
    };
  }
}

export default {
  AGENT_TOOLS,
  runWeeklyAgentReview,
};

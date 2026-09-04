import User from "../models/User.js";
import dayjs from "dayjs";

// ===================== DASHBOARD SUMMARY =====================
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs().format("YYYY-MM-DD");

    const todayStats = user.dailyStats?.find((stat) => stat.date === today) || {
      date: today,
      cigarettesAvoided: 0,
      moneySaved: 0,
      goalsCompleted: 0,
      cravingsHandled: 0,
    };

    return res.status(200).json({
      success: true,
      name: user.name,
      streak: user.streak || 0,
      puffCoins: user.puffCoins || 0,
      totalRelapses: user.totalRelapses || 0,
      pricePerCigarette: user.pricePerCigarette || 10,
      pricePerPack: user.pricePerPack || 200,
      cigarettesPerDay: user.cigarettesPerDay || 10,
      plan: user.plan || "gradual",
      todayStats: {
        cigarettesAvoided: todayStats.cigarettesAvoided || 0,
        moneySaved: todayStats.moneySaved || 0,
        goalsCompleted: todayStats.goalsCompleted || 0,
        cravingsHandled: todayStats.cravingsHandled || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ success: false, message: "Server error fetching dashboard summary" });
  }
};

// ===================== GOAL PROGRESS UPDATE =====================
export const updateGoalProgress = async (req, res) => {
  try {
    const goalsCompletedCount = Number(req.body.goalsCompletedToday ?? req.body.goalsCompleted ?? 0);
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs().format("YYYY-MM-DD");
    let existingDay = user.dailyStats.find((stat) => stat.date === today);

    if (existingDay) {
      existingDay.goalsCompleted = goalsCompletedCount;
    } else {
      user.dailyStats.push({
        date: today,
        goalsCompleted: goalsCompletedCount,
        cigarettesAvoided: 0,
        moneySaved: 0,
        cravingsHandled: 0,
      });
    }

    // Streak update logic: If 5 or more goals completed, increment streak if not updated today
    if (goalsCompletedCount >= 5) {
      if (user.lastStreakUpdateDate !== today) {
        user.streak = (user.streak || 0) + 1;
        user.lastStreakUpdateDate = today;
        user.puffCoins = (user.puffCoins || 0) + 2;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      streak: user.streak,
      puffCoins: user.puffCoins,
      goalsCompleted: goalsCompletedCount,
    });
  } catch (err) {
    console.error("Update goals error:", err);
    res.status(500).json({ success: false, message: "Server error updating goal progress" });
  }
};

// ===================== DASHBOARD ANALYTICS =====================
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs();
    const dailyStatsMap = new Map();
    (user.dailyStats || []).forEach((stat) => {
      if (stat.date) {
        dailyStatsMap.set(stat.date, stat);
      }
    });

    // 1. Weekly Data (past 7 days ending today)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = today.subtract(i, "day");
      const dateStr = d.format("YYYY-MM-DD");
      const dayName = dayNames[d.day()];
      const stat = dailyStatsMap.get(dateStr);

      weeklyData.push({
        day: dayName,
        date: dateStr,
        isToday: i === 0,
        cigarettesAvoided: stat?.cigarettesAvoided || 0,
        moneySaved: stat?.moneySaved || 0,
        cravingsHandled: stat?.cravingsHandled || 0,
        goalsCompleted: stat?.goalsCompleted || 0,
      });
    }

    // 2. Monthly Data (past 30 days)
    let monthlyAvoided = 0;
    let monthlySaved = 0;
    let monthlyCravings = 0;
    let monthlyGoals = 0;

    for (let i = 29; i >= 0; i--) {
      const d = today.subtract(i, "day");
      const dateStr = d.format("YYYY-MM-DD");
      const stat = dailyStatsMap.get(dateStr);
      if (stat) {
        monthlyAvoided += stat.cigarettesAvoided || 0;
        monthlySaved += stat.moneySaved || 0;
        monthlyCravings += stat.cravingsHandled || 0;
        monthlyGoals += stat.goalsCompleted || 0;
      }
    }

    // 3. All-time Data
    let totalCigarettesAvoided = 0;
    let totalMoneySaved = 0;
    let totalCravingsHandled = 0;

    (user.dailyStats || []).forEach((stat) => {
      totalCigarettesAvoided += stat.cigarettesAvoided || 0;
      totalMoneySaved += stat.moneySaved || 0;
      totalCravingsHandled += stat.cravingsHandled || 0;
    });

    const streak = user.streak || 0;
    // Health score percent capped at 100
    const healthScorePercent = Math.min(100, Math.max(0, Math.round(streak * 2 + totalCigarettesAvoided * 3)));

    return res.status(200).json({
      success: true,
      name: user.name,
      weeklyData,
      monthly: {
        cigarettesAvoided: monthlyAvoided,
        moneySaved: monthlySaved,
        cravingsHandled: monthlyCravings,
        goalsCompleted: monthlyGoals,
      },
      allTime: {
        streak,
        totalCigarettesAvoided,
        totalMoneySaved,
        totalCravingsHandled,
        healthScorePercent,
      },
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    res.status(500).json({ success: false, message: "Server error fetching dashboard analytics" });
  }
};

// ===================== UPDATE DAILY STATS =====================
export const updateDailyStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs().format("YYYY-MM-DD");
    let entry = user.dailyStats.find((s) => s.date === today);

    if (!entry) {
      entry = {
        date: today,
        cigarettesAvoided: 0,
        moneySaved: 0,
        goalsCompleted: 0,
        cravingsHandled: 0,
      };
      user.dailyStats.push(entry);
      // Re-find entry in mongoose array
      entry = user.dailyStats[user.dailyStats.length - 1];
    }

    const {
      cigarettesAvoided,
      moneySaved,
      cravingsHandled,
      deltaCigarettesAvoided,
      deltaMoneySaved,
      deltaCravingsHandled,
    } = req.body;

    if (deltaCigarettesAvoided !== undefined) {
      entry.cigarettesAvoided = Math.max(0, (entry.cigarettesAvoided || 0) + Number(deltaCigarettesAvoided));
    } else if (cigarettesAvoided !== undefined) {
      entry.cigarettesAvoided = Math.max(0, Number(cigarettesAvoided));
    }

    if (deltaMoneySaved !== undefined) {
      entry.moneySaved = Math.max(0, (entry.moneySaved || 0) + Number(deltaMoneySaved));
    } else if (moneySaved !== undefined) {
      entry.moneySaved = Math.max(0, Number(moneySaved));
    }

    if (deltaCravingsHandled !== undefined) {
      entry.cravingsHandled = Math.max(0, (entry.cravingsHandled || 0) + Number(deltaCravingsHandled));
    } else if (cravingsHandled !== undefined) {
      entry.cravingsHandled = Math.max(0, Number(cravingsHandled));
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Daily stats updated",
      todayStats: {
        cigarettesAvoided: entry.cigarettesAvoided,
        moneySaved: entry.moneySaved,
        goalsCompleted: entry.goalsCompleted,
        cravingsHandled: entry.cravingsHandled,
      },
    });
  } catch (err) {
    console.error("Update daily stats error:", err);
    res.status(500).json({ success: false, message: "Server error updating daily stats" });
  }
};

// ===================== AWARD COINS =====================
export const awardCoins = async (req, res) => {
  try {
    const { coins, reason } = req.body;
    const coinsToAdd = Number(coins || 0);

    if (isNaN(coinsToAdd) || coinsToAdd <= 0) {
      return res.status(400).json({ success: false, message: "Invalid coin amount" });
    }

    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.puffCoins = (user.puffCoins || 0) + coinsToAdd;
    await user.save();

    return res.status(200).json({
      success: true,
      message: reason ? `Awarded ${coinsToAdd} PuffCoins for ${reason}` : `Awarded ${coinsToAdd} PuffCoins`,
      puffCoins: user.puffCoins,
    });
  } catch (err) {
    console.error("Award coins error:", err);
    res.status(500).json({ success: false, message: "Server error awarding coins" });
  }
};

// ===================== AI INSIGHT =====================
const FALLBACK_INSIGHTS = [
  "Day one is the brave start of your smoke-free life. Take three deep slow breaths whenever an urge hits, and drink a tall glass of cold water.",
  "You are actively rewiring your neural pathways and conquering early cravings. Reward yourself today with a nutritious snack and a brisk walk.",
  "A solid streak is building and your lungs are already starting to clear. Celebrate your willpower today by trying 5 minutes of mindful box breathing.",
  "Your blood oxygen and circulation are significantly improving as your body clears toxins. Notice how much lighter your chest feels on every inhale.",
  "Your resilience is inspiring and cementing a lifelong healthy habit. Share your victory in the community today and keep your hands busy with focus games.",
];

export const getAiInsight = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs().format("YYYY-MM-DD");
    const forceRefresh = req.query.force === "true";

    // Return cached insight if already generated today and not forced
    if (!forceRefresh && user.lastAiInsight && user.lastAiInsightDate === today) {
      return res.status(200).json({
        success: true,
        insight: user.lastAiInsight,
        cached: true,
      });
    }

    const todayStats = user.dailyStats?.find((s) => s.date === today) || {
      cigarettesAvoided: 0,
      cravingsHandled: 0,
      goalsCompleted: 0,
    };

    // Calculate cravings handled in the last 7 days
    let weeklyCravings = 0;
    (user.dailyStats || []).forEach((s) => {
      weeklyCravings += s.cravingsHandled || 0;
    });

    let insightText = "";

    // Try Gemini API if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a compassionate, uplifting wellness coach for a smoking cessation mobile app named LastPuff.
User stats:
- Current streak: ${user.streak || 0} days
- Avoided cigarettes today: ${todayStats.cigarettesAvoided || 0}
- Cravings handled: ${weeklyCravings}
- Goals completed today: ${todayStats.goalsCompleted || 0}

Give a single motivational insight (2 sentences max) that is personalized and specific to their progress.
End with one concrete, empowering action tip for today. Do not use quotes or markdown asterisks.`;

        const result = await model.generateContent(prompt);
        insightText = result.response.text()?.trim();
      } catch (aiErr) {
        console.warn("Gemini API call failed, using streak-tailored fallback:", aiErr.message);
      }
    }

    // Fallback if AI call didn't produce text
    if (!insightText) {
      const streak = user.streak || 0;
      if (streak === 0) insightText = FALLBACK_INSIGHTS[0];
      else if (streak <= 3) insightText = FALLBACK_INSIGHTS[1];
      else if (streak <= 7) insightText = FALLBACK_INSIGHTS[2];
      else if (streak <= 14) insightText = FALLBACK_INSIGHTS[3];
      else insightText = FALLBACK_INSIGHTS[4];
    }

    // Save to user cache
    user.lastAiInsight = insightText;
    user.lastAiInsightDate = today;
    await user.save();

    return res.status(200).json({
      success: true,
      insight: insightText,
      cached: false,
    });
  } catch (err) {
    console.error("AI insight error:", err);
    res.status(500).json({ success: false, message: "Server error generating AI insight" });
  }
};

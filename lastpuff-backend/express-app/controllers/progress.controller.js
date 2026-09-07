import Progress from "../models/Progress.js";
import CravingLog from "../models/CravingLog.js";
import User from "../models/User.js";
import SmokingProfile from "../models/SmokingProfile.js";
import Plan from "../models/Plan.js";

function getTodayUtc() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const range = req.query.range || "7d";

    const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await Progress.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .lean();

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

export const dailyCheckIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayUtc();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Check streak logic
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    let newStreak = user.streak || 0;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastCheckIn) {
      newStreak = 1;
    } else {
      const lastCheckDay = new Date(lastCheckIn);
      lastCheckDay.setHours(0, 0, 0, 0);

      if (lastCheckDay.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (lastCheckDay.getTime() === today.getTime()) {
        // already checked in today
      } else {
        newStreak = 1; // streak reset
      }
    }

    const longest = Math.max(user.longestStreak || 0, newStreak);
    const xpBonus = 25;

    user.streak = newStreak;
    user.longestStreak = longest;
    user.lastCheckIn = new Date();
    user.xp = (user.xp || 0) + xpBonus;
    await user.save();

    await Progress.findOneAndUpdate(
      { userId, date: today },
      { $inc: { xpEarned: xpBonus } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        streak: newStreak,
        longestStreak: longest,
        xpEarned: xpBonus,
        message: "Daily check-in completed! +25 XP",
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logCraving = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { triggerType, intensity, resisted, interventionUsed, durationMinutes } = req.body;

    const log = await CravingLog.create({
      userId,
      timestamp: new Date(),
      triggerType: triggerType || "general",
      intensity: Number(intensity || 3),
      resisted: Boolean(resisted),
      interventionUsed: interventionUsed || "breathing_478",
      durationMinutes: Number(durationMinutes || 3),
    });

    const today = getTodayUtc();
    const update = {
      $inc: {
        cravingsLogged: 1,
        ...(resisted ? { cravingsResisted: 1, xpEarned: 100 } : {}),
      },
    };

    await Progress.findOneAndUpdate({ userId, date: today }, update, { upsert: true });

    if (resisted) {
      await User.findByIdAndUpdate(userId, {
        $inc: { xp: 100 },
      });
    }

    res.json({
      success: true,
      data: {
        log,
        xpAwarded: resisted ? 100 : 0,
        message: resisted
          ? "Incredible resilience! Craving defeated (+100 XP)"
          : "Craving logged. Every awareness step strengthens your recovery.",
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logCigarettes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = Number(req.body.count || 1);
    const today = getTodayUtc();

    const prog = await Progress.findOneAndUpdate(
      { userId, date: today },
      { $inc: { cigarettesSmoked: count } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        cigarettesSmokedToday: prog.cigarettesSmoked,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProgressStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const isSmoker = user.userType !== "non-smoker";

    // Calculate days smoke free
    const plan = await Plan.findOne({ userId, status: "active" }).sort({ createdAt: -1 }).lean();
    const startDate = plan?.startDate ? new Date(plan.startDate) : new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysSmokeFree = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Cost calculations
    const smokingProfile = isSmoker ? await SmokingProfile.findOne({ userId }).lean() : null;
    const dailySpend = smokingProfile?.dailySpend || 150;
    const cigsPerDay = smokingProfile?.frequencyPerDay || 10;

    const moneySaved = Math.round(daysSmokeFree * dailySpend);
    const cigsAvoided = Math.round(daysSmokeFree * cigsPerDay);
    const hoursLifeGained = Math.round((cigsAvoided * 11) / 60); // 11 mins per cig avoided

    // 7-day craving activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProgress = await Progress.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: 1 })
      .lean();

    const cravingsThisWeek = recentProgress.reduce((acc, p) => acc + (p.cravingsLogged || 0), 0);
    const resistedThisWeek = recentProgress.reduce((acc, p) => acc + (p.cravingsResisted || 0), 0);
    const totalStepsThisWeek = recentProgress.reduce((acc, p) => acc + (p.stepsCount || 0), 0);

    res.json({
      success: true,
      data: {
        daysSmokeFree,
        moneySaved,
        cigsAvoided,
        hoursLifeGained,
        streak: user.streak || 0,
        longestStreak: user.longestStreak || 0,
        xp: user.xp || 0,
        level: user.level || 1,
        cravingsThisWeek,
        resistedThisWeek,
        totalStepsThisWeek,
        planDurationDays: plan?.durationDays || 30,
        planType: plan?.planType || "cold_turkey",
        planName: plan?.planName || "Navjivan Protocol",
        recentDays: recentProgress,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getProgress,
  dailyCheckIn,
  logCraving,
  logCigarettes,
  getProgressStats,
};

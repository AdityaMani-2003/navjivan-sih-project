import User from "../models/User.js";
import Gamification from "../models/Gamification.js";

export const ACHIEVEMENTS_LIST = [
  { id: "first_dawn", title: "First Dawn", description: "24 hours smoke-free", icon: "🌅", xpValue: 50 },
  { id: "week_warrior", title: "Week Warrior", description: "7-day streak", icon: "🔥", xpValue: 100 },
  { id: "two_weeks_strong", title: "Two Weeks Strong", description: "14-day streak", icon: "💪", xpValue: 150 },
  { id: "monthly_legend", title: "Monthly Legend", description: "30-day streak", icon: "🏆", xpValue: 300 },
  { id: "quarter_year", title: "Quarter Year", description: "90-day streak", icon: "🚭", xpValue: 500 },
  { id: "saver", title: "Saver", description: "₹1,000 saved from tobacco", icon: "💰", xpValue: 50 },
  { id: "big_saver", title: "Big Saver", description: "₹5,000 saved from tobacco", icon: "💎", xpValue: 200 },
  { id: "breathing_easy", title: "Breathing Easy", description: "2 weeks smoke-free lung healing", icon: "🫁", xpValue: 100 },
  { id: "healthy_heart", title: "Healthy Heart", description: "1 month smoke-free cardiovascular reduction", icon: "❤️", xpValue: 150 },
  { id: "crisis_conqueror", title: "Crisis Conqueror", description: "Resist 10 cravings in SOS room", icon: "🆘", xpValue: 150 },
  { id: "craving_crusher", title: "Craving Crusher", description: "Resist 25 cravings", icon: "🦸", xpValue: 250 },
  { id: "community_voice", title: "Community Voice", description: "Publish your first community post", icon: "🗣️", xpValue: 50 },
  { id: "liked", title: "Liked", description: "First post receives 10 likes", icon: "❤️🔥", xpValue: 50 },
  { id: "supporter", title: "Supporter", description: "Like 50 community posts", icon: "🤝", xpValue: 75 },
  { id: "breath_master", title: "Breath Master", description: "Complete 10 breathing exercises", icon: "🧘", xpValue: 100 },
  { id: "gamer", title: "Gamer", description: "Complete 5 distraction games", icon: "🎮", xpValue: 50 },
  { id: "padyatra_starter", title: "Padyatra Starter", description: "Walk 5 km in Padyatra pilgrimage", icon: "🚶", xpValue: 50 },
  { id: "explorer", title: "Explorer", description: "Reach your first Padyatra landmark", icon: "🗺️", xpValue: 100 },
  { id: "pilgrim", title: "Pilgrim", description: "Complete an entire Padyatra route", icon: "🌏", xpValue: 500 },
  { id: "fitness_beginner", title: "Fitness Beginner", description: "Complete your first fitness workout", icon: "🏋️", xpValue: 50 },
  { id: "week_complete", title: "Week Complete", description: "Complete all daily tasks in a week", icon: "💯", xpValue: 200 },
  { id: "streak_starter", title: "Streak Starter", description: "Maintain a 3-day streak", icon: "⭐", xpValue: 50 },
  { id: "data_driven", title: "Data Driven", description: "Log 7 consecutive days of progress", icon: "📊", xpValue: 100 },
  { id: "ai_student", title: "AI Student", description: "Send 10 messages to Navjivan AI", icon: "🤖", xpValue: 50 },
  { id: "squad_leader", title: "Squad Leader", description: "Create or lead a FitSquad", icon: "👥", xpValue: 100 },
];

export const getGamification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let record = await Gamification.findOne({ userId }).lean();

    if (!record) {
      const user = await User.findById(userId).lean();
      record = await Gamification.create({
        userId,
        xp: user?.xp || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
      });
      record = record.toObject();
    }

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find({ xp: { $gt: 0 } })
      .select("name userType xp level streak")
      .sort({ xp: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: topUsers });
  } catch (err) {
    next(err);
  }
};

export const earnXP = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount || 20);
    const reason = req.body.reason || "activity";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const newXP = (user.xp || 0) + amount;
    const oldLevel = user.level || 1;
    const newLevel =
      newXP >= 7500 ? 5 : newXP >= 3500 ? 4 : newXP >= 1500 ? 3 : newXP >= 500 ? 2 : 1;

    const leveledUp = newLevel > oldLevel;
    user.xp = newXP;
    user.level = newLevel;
    await user.save();

    await Gamification.findOneAndUpdate(
      { userId },
      { $inc: { xp: amount, totalXpEarned: amount }, $set: { level: newLevel } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        xpEarned: amount,
        totalXP: newXP,
        level: newLevel,
        leveledUp,
        reason,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    const unlockedIds = new Set((user?.achievements || []).map((a) => a.id));

    const enriched = ACHIEVEMENTS_LIST.map((ach) => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

export default {
  getGamification,
  getLeaderboard,
  earnXP,
  getAchievements,
};

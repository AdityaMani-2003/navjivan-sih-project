import User from "../models/User.js";
import Reward from "../models/Reward.js";

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  { level: 1, name: "Smoke-Free Warrior", minXP: 0 },
  { level: 2, name: "Iron Will", minXP: 500 },
  { level: 3, name: "Health Champion", minXP: 2000 },
  { level: 4, name: "Quit Legend", minXP: 5000 },
  { level: 5, name: "Navjivan Ambassador", minXP: 15000 },
];

// Achievement definitions
const ACHIEVEMENTS = [
  { id: "first_dawn", name: "First Dawn", icon: "🌅", description: "24 hours smoke-free", condition: "streak >= 1" },
  { id: "week_warrior", name: "Week Warrior", icon: "🔥", description: "7-day streak", condition: "streak >= 7" },
  { id: "money_saver", name: "Money Saver", icon: "💰", description: "₹1000 saved", condition: "savings >= 1000" },
  { id: "clean_lungs", name: "Clean Lungs", icon: "🫁", description: "2 weeks clean", condition: "streak >= 14" },
  { id: "community_voice", name: "Community Voice", icon: "👥", description: "First community post", condition: "posts >= 1" },
  { id: "crisis_conqueror", name: "Crisis Conqueror", icon: "🆘", description: "Resisted 10 cravings", condition: "cravingsResisted >= 10" },
  { id: "month_master", name: "Month Master", icon: "📅", description: "30-day streak", condition: "streak >= 30" },
  { id: "century_club", name: "Century Club", icon: "💯", description: "100-day streak", condition: "streak >= 100" },
  { id: "game_player", name: "Game Player", icon: "🎮", description: "Completed 5 distraction games", condition: "games >= 5" },
  { id: "breathing_master", name: "Breathing Master", icon: "🧘", description: "10 breathing exercises", condition: "breathing >= 10" },
  { id: "fitness_starter", name: "Fitness Starter", icon: "🏋️", description: "First workout completed", condition: "workouts >= 1" },
  { id: "step_counter", name: "Step Counter", icon: "👟", description: "10,000 steps in one day", condition: "dailySteps >= 10000" },
  { id: "padyatra_begin", name: "Padyatra Begin", icon: "🚶", description: "Started a Padyatra route", condition: "padyatraStarted" },
  { id: "meal_tracker", name: "Meal Tracker", icon: "🥗", description: "Logged 10 meals", condition: "meals >= 10" },
  { id: "ai_friend", name: "AI Friend", icon: "🤖", description: "10 chatbot conversations", condition: "chats >= 10" },
];

// Rewards store items
const STORE_ITEMS = [
  { id: "avatar_frame", name: "Premium Avatar Frame", xpCost: 500, category: "cosmetic", description: "A golden frame for your profile avatar" },
  { id: "khadi_coupon", name: "Khadi Naturals Coupon", xpCost: 1500, category: "partner", description: "₹100 off on Khadi Naturals products" },
  { id: "amul_coupon", name: "Amul Protein Discount", xpCost: 1500, category: "partner", description: "₹50 off on Amul Protein range" },
  { id: "patanjali_coupon", name: "Patanjali Wellness Coupon", xpCost: 1500, category: "partner", description: "₹75 off on Patanjali nutraceuticals" },
  { id: "yoga_bars_coupon", name: "Yoga Bars Pack", xpCost: 2000, category: "partner", description: "Free sample pack of Yoga Bars" },
  { id: "premium_month", name: "1 Month Premium", xpCost: 5000, category: "subscription", description: "One month of Premium subscription" },
];

function calculateLevel(xp) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXP) currentLevel = threshold;
  }
  return currentLevel;
}

// GET /api/rewards/xp
export const getXP = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const levelInfo = calculateLevel(user.xp || 0);
    const nextLevel = LEVEL_THRESHOLDS.find((t) => t.minXP > (user.xp || 0));

    return res.status(200).json({
      success: true,
      xp: user.xp || 0,
      level: levelInfo.level,
      levelName: levelInfo.name,
      nextLevel: nextLevel || null,
      xpToNext: nextLevel ? nextLevel.minXP - (user.xp || 0) : 0,
    });
  } catch (err) {
    console.error("Get XP error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/rewards/earn
export const earnXP = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { xp, source, description } = req.body;
    const xpAmount = parseInt(xp) || 0;

    if (xpAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid XP amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.xp = (user.xp || 0) + xpAmount;
    const newLevel = calculateLevel(user.xp);
    const leveledUp = newLevel.level > (user.level || 1);
    user.level = newLevel.level;

    await user.save();

    // Log the reward
    await Reward.create({ userId, xpEarned: xpAmount, source: source || "other", description: description || "" });

    return res.status(200).json({
      success: true,
      xpEarned: xpAmount,
      totalXP: user.xp,
      level: newLevel.level,
      levelName: newLevel.name,
      leveledUp,
    });
  } catch (err) {
    console.error("Earn XP error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/rewards/achievements
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const unlockedIds = new Set((user.achievements || []).map((a) => a.id));

    const allAchievements = ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: user.achievements?.find((ua) => ua.id === a.id)?.unlockedAt || null,
    }));

    return res.status(200).json({
      success: true,
      achievements: allAchievements,
      totalUnlocked: unlockedIds.size,
      total: ACHIEVEMENTS.length,
    });
  } catch (err) {
    console.error("Get achievements error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/rewards/store
export const getStore = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).lean();

    const items = STORE_ITEMS.map((item) => ({
      ...item,
      affordable: (user?.xp || 0) >= item.xpCost,
    }));

    return res.status(200).json({ success: true, items, userXP: user?.xp || 0 });
  } catch (err) {
    console.error("Get store error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/rewards/redeem
export const redeemReward = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { itemId } = req.body;

    const item = STORE_ITEMS.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if ((user.xp || 0) < item.xpCost) {
      return res.status(400).json({ success: false, message: "Insufficient XP" });
    }

    user.xp -= item.xpCost;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Redeemed: ${item.name}`,
      remainingXP: user.xp,
      couponCode: `LP-${itemId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

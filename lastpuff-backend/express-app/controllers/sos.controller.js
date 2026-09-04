import User from "../models/User.js";
import dayjs from "dayjs";

/**
 * Log an overcame craving
 * Increments today's cravingsHandled by 1
 */
export const logCraving = async (req, res) => {
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
        cravingsHandled: 1,
      };
      user.dailyStats.push(entry);
      entry = user.dailyStats[user.dailyStats.length - 1];
    } else {
      entry.cravingsHandled = (entry.cravingsHandled || 0) + 1;
    }

    await user.save();

    // Calculate total cravings survived all time
    let totalCravingsSurvived = 0;
    user.dailyStats.forEach((s) => {
      totalCravingsSurvived += s.cravingsHandled || 0;
    });

    return res.status(200).json({
      success: true,
      message: "Craving logged successfully",
      cravingsHandledToday: entry.cravingsHandled,
      totalCravingsSurvived,
    });
  } catch (err) {
    console.error("Log craving error:", err);
    res.status(500).json({ success: false, message: "Server error logging craving" });
  }
};

/**
 * Get survived cravings count
 */
export const getCravingsCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = dayjs().format("YYYY-MM-DD");
    const todayEntry = user.dailyStats.find((s) => s.date === today);

    let totalCravingsSurvived = 0;
    user.dailyStats.forEach((s) => {
      totalCravingsSurvived += s.cravingsHandled || 0;
    });

    return res.status(200).json({
      success: true,
      cravingsHandledToday: todayEntry?.cravingsHandled || 0,
      totalCravingsSurvived,
    });
  } catch (err) {
    console.error("Get cravings count error:", err);
    res.status(500).json({ success: false, message: "Server error getting cravings count" });
  }
};

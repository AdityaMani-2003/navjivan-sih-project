import NutritionLog from "../models/NutritionLog.js";
import dayjs from "dayjs";

// POST /api/nutrition/log
export const logMeal = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, mealType, calories, protein, carbs, fat, fiber, imageUrl, time } = req.body;
    const date = req.body.date || dayjs().format("YYYY-MM-DD");

    let log = await NutritionLog.findOne({ userId, date });
    if (!log) {
      log = await NutritionLog.create({ userId, date, meals: [] });
    }

    log.meals.push({ name, mealType, calories, protein, carbs, fat, fiber, imageUrl, time, aiGenerated: !!req.body.aiGenerated });
    await log.save();

    return res.status(201).json({ success: true, log });
  } catch (err) {
    console.error("Log meal error:", err);
    return res.status(500).json({ success: false, message: "Server error logging meal" });
  }
};

// GET /api/nutrition/history?days=7
export const getHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const days = parseInt(req.query.days) || 7;
    const startDate = dayjs().subtract(days, "day").format("YYYY-MM-DD");

    const logs = await NutritionLog.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: -1 }).lean();

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    console.error("Nutrition history error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/nutrition/summary?date=YYYY-MM-DD
export const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const date = req.query.date || dayjs().format("YYYY-MM-DD");

    const log = await NutritionLog.findOne({ userId, date }).lean();

    const meals = log?.meals || [];
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
        fiber: acc.fiber + (m.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return res.status(200).json({
      success: true,
      date,
      mealsCount: meals.length,
      waterGlasses: log?.waterGlasses || 0,
      totals,
      calorieGoal: log?.calorieGoal || 2200,
      proteinGoal: log?.proteinGoal || 60,
    });
  } catch (err) {
    console.error("Nutrition summary error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

import NutritionLog from "../models/NutritionLog.js";
import dayjs from "dayjs";

function getTodayUtc() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const logMeal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, calories, protein, carbs, fat, fiber, imageUrl, time, waterLitres } = req.body;
    const today = getTodayUtc();

    let log = await NutritionLog.findOne({ userId, date: today });
    if (!log) {
      log = await NutritionLog.create({ userId, date: today, meals: [] });
    }

    if (name) {
      log.meals.push({
        name,
        calories: Number(calories || 0),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
        fiber: Number(fiber || 0),
        time: time || "lunch",
        imageUrl,
      });

      log.totalCalories = log.meals.reduce((acc, m) => acc + (m.calories || 0), 0);
      log.totalProtein = log.meals.reduce((acc, m) => acc + (m.protein || 0), 0);
      log.totalCarbs = log.meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
      log.totalFat = log.meals.reduce((acc, m) => acc + (m.fat || 0), 0);
    }

    if (waterLitres !== undefined) {
      log.waterLitres = Number(waterLitres);
    }

    await log.save();
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const getToday = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayUtc();

    let log = await NutritionLog.findOne({ userId, date: today }).lean();
    if (!log) {
      log = {
        userId,
        date: today,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        waterLitres: 0,
      };
    }

    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await NutritionLog.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: -1 })
      .lean();

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

export default {
  logMeal,
  getToday,
  getHistory,
};

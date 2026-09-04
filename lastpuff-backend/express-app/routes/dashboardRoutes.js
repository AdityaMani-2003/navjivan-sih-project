import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getDashboardSummary,
  updateGoalProgress,
  getDashboardAnalytics,
  updateDailyStats,
  awardCoins,
  getAiInsight,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getDashboardSummary);
router.get("/analytics", authMiddleware, getDashboardAnalytics);
router.post("/update-goals", authMiddleware, updateGoalProgress);
router.post("/update-stats", authMiddleware, updateDailyStats);
router.post("/award-coins", authMiddleware, awardCoins);
router.get("/ai-insight", authMiddleware, getAiInsight);

export default router;

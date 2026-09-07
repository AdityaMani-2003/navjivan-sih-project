import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  suggestQuitPlan,
  analyzeRisk,
  chat,
  generateFitnessPlan,
  generateConfidenceScript,
  analyzeMeal,
  runGoalsAgent,
  getDailyTip,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/quit-plan-suggest", authenticate, suggestQuitPlan);
router.post("/disease-risk", authenticate, analyzeRisk);
router.post("/chat", authenticate, chat);
router.post("/fitness-plan", authenticate, generateFitnessPlan);
router.post("/confidence-script", authenticate, generateConfidenceScript);
router.post("/analyze-meal", authenticate, analyzeMeal);
router.get("/goals-agent", authenticate, runGoalsAgent);
router.get("/daily-tip", authenticate, getDailyTip);

export default router;

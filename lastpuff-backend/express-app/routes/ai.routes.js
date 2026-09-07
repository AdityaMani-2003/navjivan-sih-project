import express from "express";
import {
  suggestQuitPlan,
  analyzeRisk,
  generateFitnessPlan,
  generateConfidenceScript,
  analyzeMeal,
  getDailyTip,
} from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/quit-plan-suggest", suggestQuitPlan);
router.post("/disease-risk", analyzeRisk);
router.post("/fitness-plan", generateFitnessPlan);
router.post("/confidence-script", generateConfidenceScript);
router.post("/analyze-meal", analyzeMeal);
router.get("/daily-tip", getDailyTip);
router.get("/weekly-summary", (req, res) => {
  res.json({
    success: true,
    data: {
      summary: "Steady progress logged across habit reduction, hydration, and daily movement.",
    },
  });
});

export default router;

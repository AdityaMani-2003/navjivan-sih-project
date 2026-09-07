import express from "express";
import {
  getCurrentPlan,
  updatePlan,
  getPlanHistory,
} from "../controllers/plan.controller.js";
import { generateRecommendation } from "../controllers/recommendation.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", generateRecommendation);
router.get("/current", getCurrentPlan);
router.put("/:id", updatePlan);
router.get("/history", getPlanHistory);

export default router;

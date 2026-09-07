import express from "express";
import {
  generateRecommendation,
  getCurrentRecommendation,
} from "../controllers/recommendation.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", generateRecommendation);
router.get("/current", getCurrentRecommendation);

export default router;

import express from "express";
import {
  logMeal,
  getToday,
  getHistory,
} from "../controllers/nutritionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/log", logMeal);
router.get("/today", getToday);
router.get("/history", getHistory);

export default router;

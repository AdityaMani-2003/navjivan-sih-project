import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { logMeal, getHistory, getSummary } from "../controllers/nutritionController.js";

const router = express.Router();

router.post("/log", authenticate, logMeal);
router.get("/history", authenticate, getHistory);
router.get("/summary", authenticate, getSummary);

export default router;

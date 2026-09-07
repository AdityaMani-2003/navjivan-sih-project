import express from "express";
import {
  getProgress,
  dailyCheckIn,
  logCraving,
  logCigarettes,
  getProgressStats,
} from "../controllers/progress.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProgress);
router.post("/checkin", dailyCheckIn);
router.post("/log-craving", logCraving);
router.post("/log-cigarettes", logCigarettes);
router.get("/stats", getProgressStats);

export default router;

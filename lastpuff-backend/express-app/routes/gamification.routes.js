import express from "express";
import {
  getGamification,
  getLeaderboard,
  earnXP,
  getAchievements,
} from "../controllers/gamification.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getGamification);
router.get("/leaderboard", getLeaderboard);
router.post("/earn-xp", earnXP);
router.get("/achievements", getAchievements);

export default router;

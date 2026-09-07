import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getXP, earnXP, getAchievements, getStore, redeemReward } from "../controllers/rewardsController.js";

const router = express.Router();

router.get("/xp", authenticate, getXP);
router.post("/earn", authenticate, earnXP);
router.get("/achievements", authenticate, getAchievements);
router.get("/store", authenticate, getStore);
router.post("/redeem", authenticate, redeemReward);

export default router;

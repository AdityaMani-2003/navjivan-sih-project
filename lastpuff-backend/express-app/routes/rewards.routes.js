import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getXP, earnXP, getAchievements, getStore, redeemReward } from "../controllers/rewardsController.js";

const router = express.Router();

router.use(authenticate);

router.get("/xp", getXP);
router.post("/earn", earnXP);
router.get("/achievements", getAchievements);
router.get("/store", getStore);
router.post("/redeem", redeemReward);

export default router;

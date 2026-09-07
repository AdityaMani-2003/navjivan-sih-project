import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createGoal, getMyGoals, updateGoal, deleteGoal, runGoalsAgent } from "../controllers/goalsController.js";

const router = express.Router();

router.post("/create", authenticate, createGoal);
router.get("/mine", authenticate, getMyGoals);
router.post("/agent", authenticate, runGoalsAgent);
router.post("/ai-generate", authenticate, runGoalsAgent);
router.put("/:id", authenticate, updateGoal);
router.delete("/:id", authenticate, deleteGoal);

export default router;

import express from "express";
import {
  createGoal,
  getMyGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goalsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/create", createGoal);
router.get("/mine", getMyGoals);
router.get("/my-goals", getMyGoals); // alias
router.put("/:id", updateGoal);
router.patch("/:id", updateGoal); // alias
router.delete("/:id", deleteGoal);

export default router;

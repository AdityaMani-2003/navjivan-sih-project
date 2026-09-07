import express from "express";
import {
  getTasksToday,
  getTasksWeek,
  completeTask,
  skipTask,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/today", getTasksToday);
router.get("/week", getTasksWeek);
router.put("/:id/complete", completeTask);
router.put("/:id/skip", skipTask);

export default router;

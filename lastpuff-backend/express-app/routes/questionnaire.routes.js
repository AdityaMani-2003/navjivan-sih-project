import express from "express";
import {
  submitQuestionnaire,
  getQuestionnaire,
} from "../controllers/questionnaire.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/submit", submitQuestionnaire);
router.get("/", getQuestionnaire);

export default router;

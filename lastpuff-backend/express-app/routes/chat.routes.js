import express from "express";
import {
  sendMessage,
  getHistory,
  clearHistory,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.delete("/history", clearHistory);

export default router;

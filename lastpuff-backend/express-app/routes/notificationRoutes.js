import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { registerToken, sendNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/register-token", authenticate, registerToken);
router.post("/send", authenticate, sendNotification);

export default router;

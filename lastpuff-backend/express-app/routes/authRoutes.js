import express from "express";
import { signup, login, updateProfile, refreshToken, deleteAccount } from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/profile", authenticate, updateProfile);
router.post("/refresh-token", refreshToken);
router.delete("/account", authenticate, deleteAccount);

export default router;


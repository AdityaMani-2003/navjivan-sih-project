import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  refreshToken,
  logout,
} from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public auth endpoints
router.post("/register", signup);
router.post("/signup", signup); // alias
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected endpoints
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout || ((req, res) => res.json({ success: true, message: "Logged out" })));
router.put("/profile", authMiddleware, updateProfile);

export default router;

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { logCraving, getCravingsCount } from "../controllers/sos.controller.js";

const router = express.Router();

router.post("/log-craving", authMiddleware, logCraving);
router.get("/cravings-count", authMiddleware, getCravingsCount);

export default router;

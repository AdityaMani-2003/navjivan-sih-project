import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { syncSteps, getPadyatraProgress } from "../controllers/stepsController.js";

const router = express.Router();

router.post("/sync", authenticate, syncSteps);
router.get("/padyatra", authenticate, getPadyatraProgress);

export default router;

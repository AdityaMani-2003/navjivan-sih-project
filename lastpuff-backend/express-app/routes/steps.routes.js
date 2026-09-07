import express from "express";
import { syncSteps, getPadyatra } from "../controllers/stepsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/sync", syncSteps);
router.get("/padyatra", getPadyatra);

export default router;

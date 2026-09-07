import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getNearbyHotspots, addHotspot } from "../controllers/geofencingController.js";

const router = express.Router();

router.get("/hotspots", authenticate, getNearbyHotspots);
router.post("/hotspots", authenticate, addHotspot);

export default router;

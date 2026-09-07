import express from "express";
import {
  getNearbyHotspots,
  addHotspot,
  checkEntry,
} from "../controllers/geofencingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Allow both GET and POST for nearby query
router.post("/hotspots", getNearbyHotspots);
router.get("/hotspots", getNearbyHotspots);

router.post("/add-hotspot", authMiddleware, addHotspot);
router.post("/check-entry", authMiddleware, checkEntry);

export default router;

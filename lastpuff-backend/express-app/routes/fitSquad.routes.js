import express from "express";
import {
  getPublicSquads,
  createSquad,
  joinSquad,
  getSquadById,
} from "../controllers/fitSquad.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPublicSquads);
router.post("/create", createSquad);
router.post("/:id/join", joinSquad);
router.get("/:id", getSquadById);

export default router;

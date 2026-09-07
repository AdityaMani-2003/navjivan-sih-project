import express from "express";
import {
  getProfile,
  updateProfile,
  setUserType,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/usertype", setUserType);

export default router;

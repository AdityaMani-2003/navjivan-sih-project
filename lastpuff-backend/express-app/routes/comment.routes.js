import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// Create comment
router.post("/:postId", authMiddleware, createComment);

// Get comments for a post
router.get("/:postId", authMiddleware, getComments);

// Delete a comment
router.delete("/delete/:commentId", authMiddleware, deleteComment);

export default router;

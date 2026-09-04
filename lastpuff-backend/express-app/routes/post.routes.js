// routes/post.routes.js
import express from "express";
import {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  toggleLike,
  deletePost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create post (auth required)
router.post("/", authMiddleware, upload.array("images", 5), createPost);

// Feed
router.get("/feed", authMiddleware, getFeed);

// Single post
router.get("/:id", authMiddleware, getPostById);

// User posts
router.get("/user/:userId", authMiddleware, getUserPosts);

// Like / unlike
router.post("/:id/like", authMiddleware, toggleLike);

// Delete post
router.delete("/:id", authMiddleware, deletePost);

export default router;
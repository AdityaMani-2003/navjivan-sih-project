import express from "express";
import {
  createPost,
  getFeed,
  toggleLike,
  deletePost,
} from "../controllers/post.controller.js";
import { createComment, getComments } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Feed & Post Creation
router.get("/posts", getFeed);
router.post("/posts", createPost);
router.delete("/posts/:id", deletePost);

// Interactions
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/comments", createComment);
router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/report", (req, res) => {
  res.json({ success: true, message: "Post reported for moderator review" });
});

export default router;

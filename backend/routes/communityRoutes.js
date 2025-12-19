import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  likeComment,
  deleteComment,
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/comments", protect, addComment);
router.post("/:postId/comments/:commentId/like", protect, likeComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

export default router;
import express from "express";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  likeResource,
  incrementViews,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllResources);
router.get("/:id", getResourceById);
router.post("/:id/view", incrementViews);

// Protected routes
router.post("/", protect, createResource);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);
router.post("/:id/like", protect, likeResource);

export default router;
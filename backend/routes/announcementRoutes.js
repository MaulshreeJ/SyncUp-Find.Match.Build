import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveAnnouncements);

// Protected routes
router.get("/", protect, getAllAnnouncements);

// Admin routes
router.post("/", protect, adminMiddleware, createAnnouncement);
router.put("/:id", protect, adminMiddleware, updateAnnouncement);
router.delete("/:id", protect, adminMiddleware, deleteAnnouncement);

export default router;

// routes/hackathonRoutes.js
import express from "express";
import {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  joinHackathon,
  getHackathonParticipants, // <-- new
} from "../controllers/hackathonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/hackathons
 * @desc    Create a new hackathon (Admin only)
 * @access  Private/Admin
 */
router.post("/", protect, adminMiddleware, createHackathon);

/**
 * @route   GET /api/hackathons
 * @desc    Get all hackathons
 * @access  Public
 */
router.get("/", getAllHackathons);

/**
 * @route   GET /api/hackathons/:id
 * @desc    Get a single hackathon
 * @access  Public
 */
router.get("/:id", getHackathonById);

/**
 * @route   POST /api/hackathons/:id/join
 * @desc    Join a hackathon (User)
 * @access  Private
 */
router.post("/:id/join", protect, joinHackathon);

/**
 * @route   GET /api/hackathons/:id/participants
 * @desc    Get all teams & members for a hackathon (Admin only)
 * @access  Private/Admin
 */
router.get("/:id/participants", protect, adminMiddleware, getHackathonParticipants);

export default router;

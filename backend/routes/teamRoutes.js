import express from "express";
import {
  joinHackathonAsLeader,
  inviteTeamMember,
  respondToInvite,
  getTeamDetails,
  getTeamRequests
} from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/team/join
 * @desc    Join hackathon as team leader
 * @access  Private
 */
router.post("/join", protect, joinHackathonAsLeader);

/**
 * @route   POST /api/team/invite
 * @desc    Invite team member by email
 * @access  Private
 */
router.post("/invite", protect, inviteTeamMember);

/**
 * @route   POST /api/team/respond
 * @desc    Accept or reject team invitation
 * @access  Private
 */
router.post("/respond", protect, respondToInvite);

/**
 * @route   GET /api/team/:userId
 * @desc    Get team details for a user
 * @access  Private
 */
router.get("/:userId", protect, getTeamDetails);

/**
 * @route   GET /api/team/requests/pending
 * @desc    Get pending team requests for current user
 * @access  Private
 */
router.get("/requests/pending", protect, getTeamRequests);

export default router;
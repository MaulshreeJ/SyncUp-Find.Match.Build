import express from "express";
import {
  registerForHackathon,
  createTeam,
  joinTeam,
  leaveTeam,
  removeMember,
  transferLeadership,
  deleteTeam,
  getMyRegistration,
  getHackathonTeams,
  getTeamById,
} from "../controllers/hackathonTeamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration routes
router.post("/:hackathonId/register", protect, registerForHackathon);
router.get("/:hackathonId/my-registration", protect, getMyRegistration);

// Team management routes
router.post("/:hackathonId/team/create", protect, createTeam);
router.post("/:hackathonId/team/join", protect, joinTeam);
router.post("/:hackathonId/team/leave", protect, leaveTeam);
router.post("/:hackathonId/team/remove-member", protect, removeMember);
router.post("/:hackathonId/team/transfer-leadership", protect, transferLeadership);
router.delete("/:hackathonId/team/delete", protect, deleteTeam);

// Public team viewing routes
router.get("/:hackathonId/teams", getHackathonTeams);
router.get("/:hackathonId/team/:teamId", getTeamById);

export default router;

import express from "express";
import {
  getUserProfile,
  getUserProjects,
  getUserHackathons,
  getUserConnections,
  getUserSkills,
  getAllUsers,
  searchUsers
} from "../controllers/agentToolsController.js";

const router = express.Router();

// User profile
router.get("/user/:userId", getUserProfile);

// User projects
router.get("/projects/:userId", getUserProjects);

// User hackathons
router.get("/hackathons/:userId", getUserHackathons);

// User connections
router.get("/connections/:userId", getUserConnections);

// User skills
router.get("/skills/:userId", getUserSkills);

// All users
router.get("/users", getAllUsers);

// Search users
router.post("/search-users", searchUsers);

export default router;
import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllHackathons,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getAllTeams,
  getTeamDetails,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminMiddleware);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

// Hackathon management
router.get("/hackathons", getAllHackathons);
router.post("/hackathons", createHackathon);
router.put("/hackathons/:id", updateHackathon);
router.delete("/hackathons/:id", deleteHackathon);

// Team management
router.get("/teams", getAllTeams);
router.get("/teams/:id", getTeamDetails);

export default router;
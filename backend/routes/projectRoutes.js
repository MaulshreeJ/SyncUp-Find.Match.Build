import express from "express";
import {
  getUserProjects,
  getProjectDetails,
  addOrUpdateProject,
  getUserHackathons,
  saveProjectCode
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware - log all requests
router.use((req, res, next) => {
  console.log('🔍 [ProjectRoutes] Incoming request:', {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    path: req.path
  });
  next();
});

// All project routes require authentication
router.use(protect);

// Add or update project (POST routes first)
router.post("/add", addOrUpdateProject);

// Save shared code (PUT route)
router.put("/:projectId/code", saveProjectCode);

// Get user's joined hackathons (specific routes before dynamic params)
router.get("/hackathons/:userId", getUserHackathons);

// Get specific project details (more specific route before general)
router.get("/:userId/:hackathonId", getProjectDetails);

// Get all projects for a user (most general route last)
router.get("/:userId", getUserProjects);

export default router;
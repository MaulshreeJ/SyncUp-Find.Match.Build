
import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/", getAllUsers); // public access

// Profile routes MUST come before /:userId to avoid conflicts
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Dynamic routes come last
router.get("/:userId", protect, getUserById); // get single user

export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWorkspaceFiles,
  saveWorkspaceFile,
  deleteWorkspaceFile,
  updateActiveUser
} from "../controllers/workspaceController.js";

const router = express.Router();

// All routes are protected
router.get("/:projectId", protect, getWorkspaceFiles);
router.put("/:projectId/file", protect, saveWorkspaceFile);
router.delete("/:projectId/file/:fileName", protect, deleteWorkspaceFile);
router.post("/:projectId/active", protect, updateActiveUser);

export default router;

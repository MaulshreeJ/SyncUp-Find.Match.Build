import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getKanbanBoard,
  updateKanbanBoard,
  addTask
} from "../controllers/kanbanController.js";

const router = express.Router();

router.get("/:hackathonId", protect, getKanbanBoard);
router.put("/:hackathonId", protect, updateKanbanBoard);
router.post("/:hackathonId/task", protect, addTask);

export default router;

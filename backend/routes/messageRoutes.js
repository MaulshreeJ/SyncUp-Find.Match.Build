import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation
} from "../controllers/messageController.js";

const router = express.Router();

// All routes are protected
router.get("/", protect, getConversations);
router.get("/:userId", protect, getMessages);
router.post("/:userId", protect, sendMessage);
router.delete("/:userId", protect, deleteConversation);

export default router;

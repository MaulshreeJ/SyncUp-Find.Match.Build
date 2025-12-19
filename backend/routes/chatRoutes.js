import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChatMessages,
  sendChatMessage,
  deleteChatMessage
} from "../controllers/chatController.js";

const router = express.Router();

// All routes are protected
router.get("/:hackathonId", protect, getChatMessages);
router.post("/:hackathonId", protect, sendChatMessage);
router.delete("/:hackathonId/:messageId", protect, deleteChatMessage);

export default router;

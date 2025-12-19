import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotesAndLinks,
  addNote,
  addLink,
  deleteNote,
  deleteLink
} from "../controllers/notesController.js";

const router = express.Router();

router.get("/:hackathonId", protect, getNotesAndLinks);
router.post("/:hackathonId/note", protect, addNote);
router.post("/:hackathonId/link", protect, addLink);
router.delete("/:hackathonId/note/:noteId", protect, deleteNote);
router.delete("/:hackathonId/link/:linkId", protect, deleteLink);

export default router;

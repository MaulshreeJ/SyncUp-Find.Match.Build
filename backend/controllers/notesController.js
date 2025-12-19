import Hackathon from "../models/Hackathon.js";
import asyncHandler from "express-async-handler";

// @desc    Get notes and links for a hackathon
// @route   GET /api/notes/:hackathonId
// @access  Private
export const getNotesAndLinks = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    res.json({ 
      notes: hackathon.notes || [],
      links: hackathon.links || []
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Add a note
// @route   POST /api/notes/:hackathonId/note
// @access  Private
export const addNote = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const newNote = {
      title,
      content,
      createdBy: req.user.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!hackathon.notes) {
      hackathon.notes = [];
    }

    hackathon.notes.push(newNote);
    await hackathon.save();

    res.json({ message: "Note added successfully", note: newNote, success: true });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Add a link
// @route   POST /api/notes/:hackathonId/link
// @access  Private
export const addLink = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { title, url, description } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const newLink = {
      title,
      url,
      description: description || "",
      addedBy: req.user.name,
      addedAt: new Date()
    };

    if (!hackathon.links) {
      hackathon.links = [];
    }

    hackathon.links.push(newLink);
    await hackathon.save();

    res.json({ message: "Link added successfully", link: newLink, success: true });
  } catch (error) {
    console.error("Error adding link:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:hackathonId/note/:noteId
// @access  Private
export const deleteNote = asyncHandler(async (req, res) => {
  try {
    const { hackathonId, noteId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    hackathon.notes = hackathon.notes.filter(note => note._id.toString() !== noteId);
    await hackathon.save();

    res.json({ message: "Note deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete a link
// @route   DELETE /api/notes/:hackathonId/link/:linkId
// @access  Private
export const deleteLink = asyncHandler(async (req, res) => {
  try {
    const { hackathonId, linkId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    hackathon.links = hackathon.links.filter(link => link._id.toString() !== linkId);
    await hackathon.save();

    res.json({ message: "Link deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

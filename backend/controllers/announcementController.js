import asyncHandler from "express-async-handler";
import Announcement from "../models/Announcement.js";

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 * @access  Private/Admin
 */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, type, priority, expiresAt } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    type,
    priority,
    author: req.user._id,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  const populatedAnnouncement = await Announcement.findById(announcement._id)
    .populate("author", "name email");

  res.status(201).json(populatedAnnouncement);
});

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Private
 */
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const announcements = await Announcement.find()
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Announcement.countDocuments();

  res.json({
    announcements,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Get active announcements
 * @route   GET /api/announcements/active
 * @access  Public
 */
export const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const announcements = await Announcement.find({
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  })
    .populate("author", "name")
    .sort({ priority: -1, createdAt: -1 })
    .limit(10);

  res.json(announcements);
});

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Private/Admin
 */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("author", "name email");

  res.json(updatedAnnouncement);
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private/Admin
 */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.json({ message: "Announcement deleted successfully" });
});
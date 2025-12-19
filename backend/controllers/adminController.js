import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import Team from "../models/Team.js";
import Post from "../models/Post.js";
import Resource from "../models/Resource.js";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalHackathons = await Hackathon.countDocuments();
  const totalTeams = await Team.countDocuments();
  const totalPosts = await Post.countDocuments();
  const totalResources = await Resource.countDocuments();

  const activeUsers = await User.countDocuments({ isActive: true });
  const ongoingHackathons = await Hackathon.countDocuments({
    date: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  // Recent activity (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: weekAgo }
  });

  const newHackathonsThisWeek = await Hackathon.countDocuments({
    createdAt: { $gte: weekAgo }
  });

  res.json({
    stats: {
      totalUsers,
      totalHackathons,
      totalTeams,
      totalPosts,
      totalResources,
      activeUsers,
      ongoingHackathons,
      newUsersThisWeek,
      newHackathonsThisWeek,
    }
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", status = "all" } = req.query;

  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (status !== "all") {
    query.isActive = status === "active";
  }

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive
    }
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin users");
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ message: "User deleted successfully" });
});

/**
 * @desc    Get all hackathons for admin
 * @route   GET /api/admin/hackathons
 * @access  Private/Admin
 */
export const getAllHackathons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const hackathons = await Hackathon.find()
    .populate("participants", "name")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Hackathon.countDocuments();

  res.json({
    hackathons,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Create hackathon
 * @route   POST /api/admin/hackathons
 * @access  Private/Admin
 */
export const createHackathon = asyncHandler(async (req, res) => {
  const {
    name,
    date,
    endDate,
    location,
    type,
    theme,
    participantsLimit,
    prize,
    difficulty,
    description,
    organizer,
    tags
  } = req.body;

  const hackathon = await Hackathon.create({
    name,
    date,
    endDate,
    location,
    type,
    theme,
    participantsLimit,
    prize,
    difficulty,
    description,
    organizer,
    tags
  });

  res.status(201).json(hackathon);
});

/**
 * @desc    Update hackathon
 * @route   PUT /api/admin/hackathons/:id
 * @access  Private/Admin
 */
export const updateHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);

  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  const updatedHackathon = await Hackathon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedHackathon);
});

/**
 * @desc    Delete hackathon
 * @route   DELETE /api/admin/hackathons/:id
 * @access  Private/Admin
 */
export const deleteHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);

  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  await Hackathon.findByIdAndDelete(req.params.id);

  res.json({ message: "Hackathon deleted successfully" });
});

/**
 * @desc    Get all teams
 * @route   GET /api/admin/teams
 * @access  Private/Admin
 */
export const getAllTeams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const teams = await Team.find()
    .populate("members", "name email")
    .populate("hackathon", "name")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Team.countDocuments();

  res.json({
    teams,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Get team details
 * @route   GET /api/admin/teams/:id
 * @access  Private/Admin
 */
export const getTeamDetails = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate("members", "name email skills")
    .populate("hackathon", "name date endDate");

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  res.json(team);
});
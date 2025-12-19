import asyncHandler from "express-async-handler";
import Resource from "../models/Resource.js";

/**
 * @desc    Create new resource
 * @route   POST /api/resources
 * @access  Private
 */
export const createResource = asyncHandler(async (req, res) => {
  const { title, description, category, type, url, difficulty, tags } = req.body;

  const resource = await Resource.create({
    title,
    description,
    category,
    type,
    url,
    difficulty,
    tags: tags || [],
    author: req.user._id,
  });

  const populatedResource = await Resource.findById(resource._id)
    .populate("author", "name email");

  res.status(201).json(populatedResource);
});

/**
 * @desc    Get all resources
 * @route   GET /api/resources
 * @access  Public
 */
export const getAllResources = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    category = "all", 
    type = "all", 
    difficulty = "all",
    search = "" 
  } = req.query;

  const query = { isApproved: true };
  
  if (category !== "all") {
    query.category = category;
  }

  if (type !== "all") {
    query.type = type;
  }

  if (difficulty !== "all") {
    query.difficulty = difficulty;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } }
    ];
  }

  const resources = await Resource.find(query)
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Resource.countDocuments(query);

  res.json({
    resources,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Get single resource
 * @route   GET /api/resources/:id
 * @access  Public
 */
export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate("author", "name email");

  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  res.json(resource);
});

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Private
 */
export const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  // Check if user owns the resource or is admin
  if (resource.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this resource");
  }

  const updatedResource = await Resource.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("author", "name email");

  res.json(updatedResource);
});

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  // Check if user owns the resource or is admin
  if (resource.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this resource");
  }

  await Resource.findByIdAndDelete(req.params.id);

  res.json({ message: "Resource deleted successfully" });
});

/**
 * @desc    Like/unlike resource
 * @route   POST /api/resources/:id/like
 * @access  Private
 */
export const likeResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  const isLiked = resource.likes.includes(req.user._id);

  if (isLiked) {
    // Unlike
    resource.likes = resource.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    // Like
    resource.likes.push(req.user._id);
  }

  await resource.save();

  res.json({
    message: isLiked ? "Resource unliked" : "Resource liked",
    likes: resource.likes.length,
    isLiked: !isLiked
  });
});

/**
 * @desc    Increment resource views
 * @route   POST /api/resources/:id/view
 * @access  Public
 */
export const incrementViews = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  resource.views += 1;
  await resource.save();

  res.json({ views: resource.views });
});
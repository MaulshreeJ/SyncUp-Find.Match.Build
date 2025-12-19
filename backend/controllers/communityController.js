import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

/**
 * @desc    Create new post
 * @route   POST /api/community
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const post = await Post.create({
    title,
    content,
    category,
    tags: tags || [],
    author: req.user._id,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("author", "name email avatar");

  res.status(201).json(populatedPost);
});

/**
 * @desc    Get all posts
 * @route   GET /api/community
 * @access  Public
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category = "all", search = "" } = req.query;

  const query = { isApproved: true };
  
  if (category !== "all") {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } }
    ];
  }

  const posts = await Post.find(query)
    .populate("author", "name email avatar")
    .populate("comments.author", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Post.countDocuments(query);

  res.json({
    posts,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Get single post
 * @route   GET /api/community/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name email avatar")
    .populate("comments.author", "name email avatar");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json(post);
});

/**
 * @desc    Update post
 * @route   PUT /api/community/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check if user owns the post or is admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this post");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("author", "name email avatar");

  res.json(updatedPost);
});

/**
 * @desc    Delete post
 * @route   DELETE /api/community/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check if user owns the post or is admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this post");
  }

  await Post.findByIdAndDelete(req.params.id);

  res.json({ message: "Post deleted successfully" });
});

/**
 * @desc    Like/unlike post
 * @route   POST /api/community/:id/like
 * @access  Private
 */
export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    // Unlike
    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    // Like
    post.likes.push(req.user._id);
  }

  await post.save();

  res.json({
    message: isLiked ? "Post unliked" : "Post liked",
    likes: post.likes.length,
    isLiked: !isLiked
  });
});

/**
 * @desc    Add comment to post
 * @route   POST /api/community/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = {
    content,
    author: req.user._id,
  };

  post.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("comments.author", "name email avatar");

  const newComment = updatedPost.comments[updatedPost.comments.length - 1];

  res.status(201).json(newComment);
});

/**
 * @desc    Like/unlike comment
 * @route   POST /api/community/:postId/comments/:commentId/like
 * @access  Private
 */
export const likeComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const isLiked = comment.likes.includes(req.user._id);

  if (isLiked) {
    // Unlike
    comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    // Like
    comment.likes.push(req.user._id);
  }

  await post.save();

  res.json({
    message: isLiked ? "Comment unliked" : "Comment liked",
    likes: comment.likes.length,
    isLiked: !isLiked
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/community/:postId/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Check if user owns the comment or is admin
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  post.comments.pull(req.params.commentId);
  await post.save();

  res.json({ message: "Comment deleted successfully" });
});
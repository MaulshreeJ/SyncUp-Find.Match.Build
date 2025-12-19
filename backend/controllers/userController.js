
// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust path/casing to your file
// Note: do NOT import bcrypt here — user model will hash passwords in pre-save

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user — the model pre('save') will hash the password
  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password, // plain, model will hash
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user profile (current user)
// @route   GET /api/users/profile
// @access  Private
// export const getProfile = asyncHandler(async (req, res) => {
//   const userId = req.user && (req.user.id || req.user._id);
//   if (!userId) {
//     res.status(401);
//     throw new Error("Not authorized");
//   }

//   const user = await User.findById(userId).select(
//     "-password -__v -tokens -resetPasswordToken -emailVerificationToken"
//   );

//   if (!user) {
//     res.status(404);
//     throw new Error("User not found");
//   }

//   res.json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     title: user.title || "",
//     bio: user.bio || "",
//     avatar: user.avatar || "",
//     location: user.location || "",
//     skills: user.skills || [],
//     preferredRoles: user.preferredRoles || [],
//     availability: user.availability || "Available",
//     joinedAt: user.joinedAt || user.createdAt,
//     role: user.role || "user",
//     isAdmin: !!user.isAdmin,
//     isActive: !!user.isActive,
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt
//   });
// });

// @desc    Get user profile (current user)
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user && (req.user.id || req.user._id);
  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId)
    .select("-password -__v -tokens -resetPasswordToken -emailVerificationToken");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    title: user.title || "",
    bio: user.bio || "",
    avatar: user.avatar || "",
    location: user.location || "",
    skills: user.skills || [],
    preferredRoles: user.preferredRoles || [],
    availability: user.availability || "Available",
    joinedAt: user.joinedAt || user.createdAt,
    role: user.role || "user",
    isActive: !!user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hackathonsJoined: user.hackathonsJoined || [],
  });
});

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
// export const updateProfile = asyncHandler(async (req, res) => {
//   const userId = req.user && (req.user.id || req.user._id);
//   if (!userId) {
//     res.status(401);
//     throw new Error("Not authorized");
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     res.status(404);
//     throw new Error("User not found");
//   }

//   // allowlist fields that can be updated by user
//   const allowed = [
//     "name",
//     "title",
//     "bio",
//     "avatar",
//     "location",
//     "skills",
//     "preferredRoles",
//     "availability",
//   ];

//   for (const field of allowed) {
//     if (Object.prototype.hasOwnProperty.call(req.body, field)) {
//       // sanitize arrays
//       if ((field === "skills" || field === "preferredRoles") && Array.isArray(req.body[field])) {
//         user[field] = req.body[field].map((s) => String(s).trim()).filter(Boolean);
//       } else {
//         user[field] = req.body[field];
//       }
//     }
//   }

//   // Optional: allow password change via profile if provided (recommended: separate endpoint)
//   if (req.body.password) {
//     user.password = req.body.password; // will be hashed by pre-save hook
//   }

//   await user.save();

//   const updated = await User.findById(userId).select(
//     "-password -__v -tokens -resetPasswordToken -emailVerificationToken"
//   );

//   res.json({
//     _id: updated._id,
//     name: updated.name,
//     email: updated.email,
//     title: updated.title || "",
//     bio: updated.bio || "",
//     avatar: updated.avatar || "",
//     location: updated.location || "",
//     skills: updated.skills || [],
//     preferredRoles: updated.preferredRoles || [],
//     availability: updated.availability || "Available",
//     joinedAt: updated.joinedAt || updated.createdAt,
//     role: updated.role || "user",
//     isAdmin: !!updated.isAdmin,
//     isActive: !!updated.isActive,
//     createdAt: updated.createdAt,
//     updatedAt: updated.updatedAt
//   });
// });

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user && (req.user.id || req.user._id);
  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // allowlist fields that can be updated by user
  const allowed = [
    "name",
    "title",
    "bio",
    "avatar",
    "location",
    "skills",
    "preferredRoles",
    "availability",
  ];

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      // sanitize arrays
      if ((field === "skills" || field === "preferredRoles") && Array.isArray(req.body[field])) {
        user[field] = req.body[field].map((s) => String(s).trim()).filter(Boolean);
      } else {
        user[field] = req.body[field];
      }
    }
  }

  // Optional: allow password change via profile if provided (recommended: separate endpoint)
  if (req.body.password) {
    user.password = req.body.password; // will be hashed by pre-save hook
  }

  await user.save();

  const updated = await User.findById(userId)
    .select("-password -__v -tokens -resetPasswordToken -emailVerificationToken");

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    title: updated.title || "",
    bio: updated.bio || "",
    avatar: updated.avatar || "",
    location: updated.location || "",
    skills: updated.skills || [],
    preferredRoles: updated.preferredRoles || [],
    availability: updated.availability || "Available",
    joinedAt: updated.joinedAt || updated.createdAt,
    role: updated.role || "user",
    isActive: !!updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    hackathonsJoined: updated.hackathonsJoined || [],
  });
});

// // controllers/userController.js (add near other exports)
// import asyncHandler from "express-async-handler";
// import User from "../models/User.js"; // adjust path if needed

// @desc    Get all users (safe fields only)
// @route   GET /api/users
// @access  Private (protected)
// export const getAllUsers = asyncHandler(async (req, res) => {
//   // (Optional) allow only admins to call this:
//   // if (!req.user || !req.user.isAdmin) {
//   //   res.status(403);
//   //   throw new Error("Forbidden: admin only");
//   // }

//   // Fetch all users but strip sensitive fields
//   const users = await User.find({})
//     .select(
//       "-password -__v -tokens -resetPasswordToken -emailVerificationToken"
//     )
//     .lean();

//   // Normalize missing fields and limit fields returned
//   const safeUsers = users.map((u) => ({
//     _id: u._id,
//     name: u.name,
//     email: u.email,
//     avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u._id)}`,
//     title: u.title || "",
//     bio: u.bio || "",
//     location: u.location || "",
//     skills: Array.isArray(u.skills) ? u.skills : (u.skills ? (String(u.skills).split(",").map(s => s.trim())) : []),
//     joinedAt: u.joinedAt || u.createdAt,
//     isActive: !!u.isActive,
//   }));

//   res.json(safeUsers);
// });

// controllers/userController.js
// import asyncHandler from "express-async-handler";
// import User from "../models/User.js";

// @desc    Get all users (Public)
// @route   GET /api/users
// @access  Public
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password -__v")
    .lean();

  const safeUsers = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u._id)}`,
    title: u.title || "",
    bio: u.bio || "",
    location: u.location || "",
    skills: Array.isArray(u.skills)
      ? u.skills
      : u.skills
      ? String(u.skills).split(",").map((s) => s.trim())
      : [],
    joinedAt: u.joinedAt || u.createdAt,
  }));

  res.json(safeUsers);
});

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  console.log('🔍 getUserById called with userId:', userId);
  
  if (!userId || userId === 'undefined' || userId === 'null') {
    res.status(400);
    throw new Error("Invalid user ID");
  }
  
  const user = await User.findById(userId).select("-password -__v");
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user._id)}`,
    title: user.title || "",
    bio: user.bio || "",
    location: user.location || "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    preferredRoles: Array.isArray(user.preferredRoles) ? user.preferredRoles : [],
    availability: user.availability || "Available",
    joinedAt: user.joinedAt || user.createdAt
  };

  res.json(safeUser);
});


// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    // Helpful debug - remove/disable in production
    console.log("POST /api/register body:", req.body);

    const { name, email, password, skills } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
      joinedAt: new Date(),
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get profile
// @route   GET /api/profile
// @access  Private (protect middleware should set req.user)
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

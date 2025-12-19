import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import Team from "../models/Team.js";

/**
 * @desc    Get user profile for AI agents
 * @route   GET /api/agent-tools/user/:userId
 * @access  Public (used by Python AI service)
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        skills: user.skills || [],
        bio: user.bio || "",
        experience: user.experience || "",
        interests: user.interests || [],
        github: user.github || "",
        resume: user.resume || "",
        targetRole: user.targetRole || "Software Engineer",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

/**
 * @desc    Get user's projects for AI agents
 * @route   GET /api/agent-tools/projects/:userId
 * @access  Public (used by Python AI service)
 */
export const getUserProjects = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find teams where user is a member
    const teams = await Team.find({
      $or: [
        { leader: userId },
        { members: userId }
      ]
    }).populate('hackathon', 'name theme description prize difficulty location date endDate');

    const projects = teams.map(team => ({
      id: team._id.toString(),
      name: team.name,
      hackathon: {
        id: team.hackathon._id.toString(),
        name: team.hackathon.name,
        theme: team.hackathon.theme,
        description: team.hackathon.description,
        prize: team.hackathon.prize,
        difficulty: team.hackathon.difficulty,
        location: team.hackathon.location,
        date: team.hackathon.date,
        endDate: team.hackathon.endDate
      },
      role: team.leader.toString() === userId ? "leader" : "member",
      teamSize: team.members.length,
      maxMembers: team.maxMembers,
      inviteCode: team.inviteCode,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    }));

    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Failed to get user projects" });
  }
});

/**
 * @desc    Get user's hackathons for AI agents
 * @route   GET /api/agent-tools/hackathons/:userId
 * @access  Public (used by Python AI service)
 */
export const getUserHackathons = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find teams where user is a member, then get hackathons
    const teams = await Team.find({
      $or: [
        { leader: userId },
        { members: userId }
      ]
    }).populate('hackathon');

    const hackathons = teams.map(team => ({
      id: team.hackathon._id.toString(),
      name: team.hackathon.name,
      theme: team.hackathon.theme,
      description: team.hackathon.description,
      date: team.hackathon.date,
      endDate: team.hackathon.endDate,
      location: team.hackathon.location,
      type: team.hackathon.type,
      prize: team.hackathon.prize,
      difficulty: team.hackathon.difficulty,
      organizer: team.hackathon.organizer,
      tags: team.hackathon.tags,
      team: {
        id: team._id.toString(),
        name: team.name,
        role: team.leader.toString() === userId ? "leader" : "member",
        teamSize: team.members.length
      },
      joinedAt: team.createdAt
    }));

    res.json({
      success: true,
      hackathons,
      count: hackathons.length
    });
  } catch (error) {
    console.error("Error getting user hackathons:", error);
    res.status(500).json({ error: "Failed to get user hackathons" });
  }
});

/**
 * @desc    Get user's connections for AI agents
 * @route   GET /api/agent-tools/connections/:userId
 * @access  Public (used by Python AI service)
 */
export const getUserConnections = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // For now, return team members as connections
    const teams = await Team.find({
      $or: [
        { leader: userId },
        { members: userId }
      ]
    }).populate('members leader', 'name email skills bio experience');

    const connections = [];
    const seenUsers = new Set([userId]);

    teams.forEach(team => {
      // Add leader if not current user
      if (team.leader._id.toString() !== userId && !seenUsers.has(team.leader._id.toString())) {
        connections.push({
          id: team.leader._id.toString(),
          name: team.leader.name,
          email: team.leader.email,
          skills: team.leader.skills || [],
          bio: team.leader.bio || "",
          experience: team.leader.experience || "",
          connectionType: "teammate",
          teamName: team.name
        });
        seenUsers.add(team.leader._id.toString());
      }

      // Add members if not current user
      team.members.forEach(member => {
        if (member._id.toString() !== userId && !seenUsers.has(member._id.toString())) {
          connections.push({
            id: member._id.toString(),
            name: member.name,
            email: member.email,
            skills: member.skills || [],
            bio: member.bio || "",
            experience: member.experience || "",
            connectionType: "teammate",
            teamName: team.name
          });
          seenUsers.add(member._id.toString());
        }
      });
    });

    res.json({
      success: true,
      connections,
      count: connections.length
    });
  } catch (error) {
    console.error("Error getting user connections:", error);
    res.status(500).json({ error: "Failed to get user connections" });
  }
});

/**
 * @desc    Get user's skills for AI agents
 * @route   GET /api/agent-tools/skills/:userId
 * @access  Public (used by Python AI service)
 */
export const getUserSkills = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("skills");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      skills: user.skills || []
    });
  } catch (error) {
    console.error("Error getting user skills:", error);
    res.status(500).json({ error: "Failed to get user skills" });
  }
});

/**
 * @desc    Get all users for AI agents
 * @route   GET /api/agent-tools/users
 * @access  Public (used by Python AI service)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { skills, interests, excludeId } = req.query;

  try {
    let query = {};
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    if (interests) {
      const interestsArray = interests.split(',');
      query.interests = { $in: interestsArray };
    }

    const users = await User.find(query)
      .select("-password")
      .limit(50);

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: user.skills || [],
      bio: user.bio || "",
      experience: user.experience || "",
      interests: user.interests || []
    }));

    res.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

/**
 * @desc    Search users for AI agents
 * @route   POST /api/agent-tools/search-users
 * @access  Public (used by Python AI service)
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { skills, interests, excludeId, limit = 20 } = req.body;

  try {
    let query = {};
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    if (interests && interests.length > 0) {
      query.interests = { $in: interests };
    }

    const users = await User.find(query)
      .select("-password")
      .limit(parseInt(limit));

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: user.skills || [],
      bio: user.bio || "",
      experience: user.experience || "",
      interests: user.interests || []
    }));

    res.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});
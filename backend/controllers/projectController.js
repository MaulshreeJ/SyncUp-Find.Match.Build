import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import asyncHandler from "express-async-handler";

// @desc    Get all projects for a user
// @route   GET /api/projects/:userId
// @access  Private
export const getUserProjects = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📊 [getUserProjects] Called with userId:', userId);
    console.log('📊 [getUserProjects] Full URL:', req.originalUrl);
    console.log('📊 [getUserProjects] Params:', req.params);
    
    // Find user and populate hackathon details
    const user = await User.findById(userId).populate('hackathonsJoined.hackathonId');
    
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User found, hackathons joined:', user.hackathonsJoined?.length || 0);

    // Return empty array if no hackathons joined
    if (!user.hackathonsJoined || user.hackathonsJoined.length === 0) {
      return res.json({ projects: [] });
    }

    // Format projects data for frontend
    const projects = user.hackathonsJoined
      .filter(hackathon => hackathon.hackathonId) // Filter out null/undefined hackathons
      .map(hackathon => ({
        id: hackathon.hackathonId._id,
        hackathonId: hackathon.hackathonId._id,
        hackathonName: hackathon.hackathonName,
        teamName: hackathon.teamName,
        projectName: hackathon.projectName || `${hackathon.teamName} Project`,
        isTeamLeader: hackathon.isTeamLeader,
        teamMembers: hackathon.teamMembers,
        project: hackathon.project || {
          description: "",
          techStack: [],
          githubLink: "",
          deploymentLink: "",
          status: "Planning",
          createdAt: hackathon.joinedAt,
          updatedAt: hackathon.joinedAt
        },
        joinedAt: hackathon.joinedAt
      }));

    console.log('✅ Returning projects:', projects.length);
    res.json({ projects });
  } catch (error) {
    console.error("❌ Error fetching user projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get specific project details
// @route   GET /api/projects/:userId/:hackathonId
// @access  Private
export const getProjectDetails = asyncHandler(async (req, res) => {
  try {
    const { userId, hackathonId } = req.params;
    
    console.log('📋 [getProjectDetails] Called with:', { userId, hackathonId });
    console.log('📋 [getProjectDetails] Full URL:', req.originalUrl);
    console.log('📋 [getProjectDetails] Params:', req.params);
    
    const user = await User.findById(userId).populate('hackathonsJoined.hackathonId');
    
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hackathonsJoined || user.hackathonsJoined.length === 0) {
      console.log('❌ User has no hackathons joined');
      return res.status(404).json({ message: "No hackathons found for this user" });
    }

    const hackathonEntry = user.hackathonsJoined.find(
      h => h.hackathonId && h.hackathonId._id.toString() === hackathonId
    );

    if (!hackathonEntry) {
      console.log('❌ Project not found for hackathon:', hackathonId);
      return res.status(404).json({ message: "Project not found for this hackathon" });
    }

    const projectDetails = {
      id: hackathonEntry.hackathonId._id,
      hackathonId: hackathonEntry.hackathonId._id,
      hackathonName: hackathonEntry.hackathonName,
      hackathonDetails: hackathonEntry.hackathonId,
      teamName: hackathonEntry.teamName,
      projectName: hackathonEntry.projectName || `${hackathonEntry.teamName} Project`,
      isTeamLeader: hackathonEntry.isTeamLeader,
      teamMembers: hackathonEntry.teamMembers,
      project: hackathonEntry.project || {
        description: "",
        techStack: [],
        githubLink: "",
        deploymentLink: "",
        status: "Planning",
        createdAt: hackathonEntry.joinedAt,
        updatedAt: hackathonEntry.joinedAt
      },
      joinedAt: hackathonEntry.joinedAt
    };

    console.log('✅ Returning project details');
    res.json(projectDetails);
  } catch (error) {
    console.error("❌ Error fetching project details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Add or update project for a hackathon
// @route   POST /api/projects/add
// @access  Private
export const addOrUpdateProject = asyncHandler(async (req, res) => {
  try {
    const { 
      hackathonId, 
      projectName, 
      description, 
      techStack, 
      githubLink, 
      deploymentLink, 
      status 
    } = req.body;
    
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the hackathon entry
    const hackathonIndex = user.hackathonsJoined.findIndex(
      h => h.hackathonId.toString() === hackathonId
    );

    if (hackathonIndex === -1) {
      return res.status(404).json({ 
        message: "You are not part of this hackathon" 
      });
    }

    // Update the project details
    const hackathonEntry = user.hackathonsJoined[hackathonIndex];
    
    // Update project name if provided
    if (projectName) {
      hackathonEntry.projectName = projectName;
    }

    // Update or create project object
    hackathonEntry.project = {
      description: description || hackathonEntry.project?.description || "",
      techStack: techStack || hackathonEntry.project?.techStack || [],
      githubLink: githubLink || hackathonEntry.project?.githubLink || "",
      deploymentLink: deploymentLink || hackathonEntry.project?.deploymentLink || "",
      status: status || hackathonEntry.project?.status || "Planning",
      createdAt: hackathonEntry.project?.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Save the updated user
    await user.save();

    res.json({ 
      message: "Project updated successfully",
      project: {
        hackathonId,
        projectName: hackathonEntry.projectName,
        project: hackathonEntry.project
      }
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get user's joined hackathons (for project creation dropdown)
// @route   GET /api/projects/hackathons/:userId
// @access  Private
export const getUserHackathons = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('hackathonsJoined.hackathonId');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hackathons = user.hackathonsJoined.map(h => ({
      id: h.hackathonId._id,
      name: h.hackathonName,
      teamName: h.teamName,
      isTeamLeader: h.isTeamLeader,
      hasProject: !!h.projectName
    }));

    res.json({ hackathons });
  } catch (error) {
    console.error("Error fetching user hackathons:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Save shared code for a project
// @route   PUT /api/projects/:projectId/code
// @access  Private
export const saveProjectCode = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.params;
    const { code } = req.body;
    
    console.log('💾 [saveProjectCode] Saving code for project:', projectId);
    
    // Find user and update the project code
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the hackathon entry
    const hackathonIndex = user.hackathonsJoined.findIndex(
      h => h.hackathonId.toString() === projectId
    );

    if (hackathonIndex === -1) {
      return res.status(404).json({ 
        message: "Project not found" 
      });
    }

    // Update the shared code
    if (!user.hackathonsJoined[hackathonIndex].project) {
      user.hackathonsJoined[hackathonIndex].project = {};
    }
    
    user.hackathonsJoined[hackathonIndex].project.sharedCode = code;
    user.hackathonsJoined[hackathonIndex].project.updatedAt = new Date();

    await user.save();

    console.log('✅ Code saved successfully');
    res.json({ 
      message: "Code saved successfully",
      success: true
    });
  } catch (error) {
    console.error("❌ Error saving project code:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
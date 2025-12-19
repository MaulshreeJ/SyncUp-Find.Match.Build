import asyncHandler from "express-async-handler";
import {
  callCareerCoach,
  callMatcherAgent,
  analyzeResume,
  analyzeGitHub,
  runFullWorkflow,
  runHackathonWorkflow,
  checkServiceHealth,
  extractPdfText as extractPdfService,
  analyzeResumePdf as analyzeResumePdfService
} from "../services/agentService.js";

/**
 * @desc    Handle Career Coach chat requests
 * @route   POST /api/ai/coach
 * @access  Protected
 */
export const handleCareerCoach = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  try {
    // Build user context from authenticated user
    const userContext = {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      skills: req.user.skills || [],
      bio: req.user.bio || "",
      experience: req.user.experience || "",
      interests: req.user.interests || [],
      github_username: req.user.github || "",
      resume_text: req.user.resume || "",
      target_role: req.user.targetRole || "Software Engineer"
    };

    // Call Python FastAPI service
    const result = await callCareerCoach(message, userContext);

    console.log("Career Coach Result:", JSON.stringify(result, null, 2));

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Career Coach Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to get AI response");
  }
});

/**
 * @desc    Handle Matcher Agent requests (skill analysis, team matching)
 * @route   POST /api/ai/matcher
 * @access  Protected
 */
export const handleMatcher = asyncHandler(async (req, res) => {
  const { action, targetRole, projectType, goal } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  try {
    // Build user profile from authenticated user
    const userProfile = {
      user_id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      skills: req.user.skills || [],
      desired_skills: req.user.desiredSkills || [],
      bio: req.user.bio || "",
      experience: req.user.experience || "",
      interests: req.user.interests || [],
      goal: goal || targetRole || "Find teammates for hackathon",
      message: req.body.message || ""
    };

    // Call Python FastAPI service
    const result = await callMatcherAgent(userProfile, null, action || "matchmake");

    res.json({
      success: true,
      ...result,
      action: action || "matchmake",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Matcher Agent Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to process matcher request");
  }
});

/**
 * @desc    Analyze resume with ATS scoring
 * @route   POST /api/ai/resume/analyze
 * @access  Protected
 */
export const handleResumeAnalysis = asyncHandler(async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText) {
    res.status(400);
    throw new Error("Resume text is required");
  }

  try {
    const result = await analyzeResume(
      resumeText,
      targetRole || "Software Engineer",
      req.user._id.toString()
    );

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to analyze resume");
  }
});

/**
 * @desc    Analyze GitHub profile
 * @route   POST /api/ai/github/analyze
 * @access  Protected
 */
export const handleGitHubAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    res.status(400);
    throw new Error("GitHub username is required");
  }

  try {
    const result = await analyzeGitHub(username);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("GitHub Analysis Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to analyze GitHub profile");
  }
});

/**
 * @desc    Run full career development workflow
 * @route   POST /api/ai/workflow/full
 * @access  Protected
 */
export const handleFullWorkflow = asyncHandler(async (req, res) => {
  const { inputData, inputType, targetRole } = req.body;

  if (!inputData || !inputType) {
    res.status(400);
    throw new Error("Input data and type are required");
  }

  try {
    const result = await runFullWorkflow(
      inputData,
      inputType,
      targetRole || "Software Engineer",
      req.user._id.toString()
    );

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Full Workflow Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to run full workflow");
  }
});

/**
 * @desc    Run hackathon workflow
 * @route   POST /api/ai/hackathon/workflow
 * @access  Protected
 */
export const handleHackathonWorkflow = asyncHandler(async (req, res) => {
  const { duration, userSkills, requiredSkills, goal, maxIterations } = req.body;

  if (!duration || !goal) {
    res.status(400);
    throw new Error("Duration and goal are required");
  }

  try {
    const result = await runHackathonWorkflow({
      duration,
      user_skills: userSkills || req.user.skills || [],
      required_skills: requiredSkills || [],
      goal,
      max_iterations: maxIterations || 5
    });

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Hackathon Workflow Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to run hackathon workflow");
  }
});

/**
 * @desc    Check Python service health
 * @route   GET /api/ai/health
 * @access  Public
 */
export const checkHealth = asyncHandler(async (req, res) => {
  try {
    const isHealthy = await checkServiceHealth();

    res.json({
      success: true,
      pythonService: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500);
    throw new Error("Health check failed");
  }
});

/**
 * @desc    Extract text from PDF file
 * @route   POST /api/ai/pdf/extract
 * @access  Protected
 */
export const handlePdfExtraction = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("PDF file is required");
  }

  try {
    const result = await extractPdfService(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to extract PDF text");
  }
});

/**
 * @desc    Analyze PDF resume (extraction + analysis)
 * @route   POST /api/ai/resume/analyze-pdf
 * @access  Protected
 */
export const handlePdfResumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("PDF file is required");
  }

  const targetRole = req.body.target_role || req.body.targetRole || "Software Engineer";

  try {
    const result = await analyzeResumePdfService(
      req.file.buffer,
      req.file.originalname,
      targetRole
    );

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("PDF Resume Analysis Error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to analyze PDF resume");
  }
});

import express from "express";
import multer from "multer";
import {
  handleCareerCoach,
  handleMatcher,
  handleResumeAnalysis,
  handleGitHubAnalysis,
  handleFullWorkflow,
  handleHackathonWorkflow,
  checkHealth,
  handlePdfExtraction,
  handlePdfResumeAnalysis
} from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @route   GET /api/ai/health
 * @desc    Check Python service health
 * @access  Public
 */
router.get("/health", checkHealth);

/**
 * @route   POST /api/ai/coach
 * @desc    Chat with Career Coach AI (uses full Python workflow)
 * @access  Protected
 */
router.post("/coach", protect, handleCareerCoach);

/**
 * @route   POST /api/ai/matcher
 * @desc    Team matching and mentor recommendations
 * @access  Protected
 */
router.post("/matcher", protect, handleMatcher);

/**
 * @route   POST /api/ai/resume/analyze
 * @desc    Analyze resume with ATS scoring
 * @access  Protected
 */
router.post("/resume/analyze", protect, handleResumeAnalysis);

/**
 * @route   POST /api/ai/github/analyze
 * @desc    Analyze GitHub profile
 * @access  Protected
 */
router.post("/github/analyze", protect, handleGitHubAnalysis);

/**
 * @route   POST /api/ai/workflow/full
 * @desc    Run complete career development workflow
 * @access  Protected
 */
router.post("/workflow/full", protect, handleFullWorkflow);

/**
 * @route   POST /api/ai/hackathon/workflow
 * @desc    Run complete hackathon workflow
 * @access  Protected
 */
router.post("/hackathon/workflow", protect, handleHackathonWorkflow);

/**
 * @route   POST /api/ai/pdf/extract
 * @desc    Extract text from PDF file
 * @access  Protected
 */
router.post("/pdf/extract", protect, upload.single('file'), handlePdfExtraction);

/**
 * @route   POST /api/ai/resume/analyze-pdf
 * @desc    Analyze PDF resume (extraction + analysis in one call)
 * @access  Protected
 */
router.post("/resume/analyze-pdf", protect, upload.single('file'), handlePdfResumeAnalysis);

export default router;

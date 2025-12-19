/**
 * Agent Service - Calls Python FastAPI microservice for AI agent workflows
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// Increase timeout for long-running AI operations (5 minutes)
const AI_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Call Career Coach Agent
 * @param {string} message - User's message
 * @param {Object} userContext - User profile data
 * @returns {Promise<Object>} - Agent response
 */
export const callCareerCoach = async (message, userContext) => {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        user: userContext,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Career coach request failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AI analysis took too long (>5 minutes)');
    }
    console.error("Career Coach Service Error:", error);
    throw new Error(`Failed to call career coach: ${error.message}`);
  }
};

/**
 * Call Matcher Agent
 * @param {Object} userProfile - User profile with skills
 * @param {Array} candidates - Optional list of candidates
 * @param {string} action - Action type: matchmake, mentor, chat
 * @returns {Promise<Object>} - Matcher results
 */
export const callMatcherAgent = async (userProfile, candidates = null, action = "matchmake") => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/matcher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_profile: userProfile,
        candidates,
        action,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Matcher agent request failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Matcher Agent Service Error:", error);
    throw new Error(`Failed to call matcher agent: ${error.message}`);
  }
};

/**
 * Analyze Resume with ATS scoring
 * @param {string} resumeText - Resume content
 * @param {string} targetRole - Target job role
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Resume analysis results
 */
export const analyzeResume = async (resumeText, targetRole = "Software Engineer", userId = "default") => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/resume/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Resume analysis failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Resume Analysis Service Error:", error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
};

/**
 * Analyze GitHub Profile
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - GitHub analysis results
 */
export const analyzeGitHub = async (username) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/github/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "GitHub analysis failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("GitHub Analysis Service Error:", error);
    throw new Error(`Failed to analyze GitHub: ${error.message}`);
  }
};

/**
 * Run Full Career Development Workflow
 * @param {string} inputData - Resume text or GitHub username
 * @param {string} inputType - "resume" or "github"
 * @param {string} targetRole - Target career role
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Complete workflow results
 */
export const runFullWorkflow = async (inputData, inputType, targetRole, userId = "default") => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/workflow/full`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_data: inputData,
        input_type: inputType,
        target_role: targetRole,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Full workflow failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Full Workflow Service Error:", error);
    throw new Error(`Failed to run full workflow: ${error.message}`);
  }
};

/**
 * Run Hackathon Workflow
 * @param {Object} hackathonData - Hackathon parameters
 * @returns {Promise<Object>} - Hackathon workflow results
 */
export const runHackathonWorkflow = async (hackathonData) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/hackathon/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hackathonData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Hackathon workflow failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Hackathon Workflow Service Error:", error);
    throw new Error(`Failed to run hackathon workflow: ${error.message}`);
  }
};

/**
 * Extract text from PDF file
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} - Extracted text and metadata
 */
export const extractPdfText = async (fileBuffer, filename) => {
  try {
    // Convert buffer to base64
    const pdfBase64 = fileBuffer.toString('base64');

    const response = await fetch(`${PYTHON_SERVICE_URL}/api/agent/pdf/extract-base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdf_base64: pdfBase64,
        filename: filename
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "PDF extraction failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("PDF Extraction Service Error:", error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

/**
 * Analyze PDF resume directly (extraction + analysis)
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} filename - Original filename
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Resume analysis results
 */
export const analyzeResumePdf = async (fileBuffer, filename, targetRole = "Software Engineer") => {
  try {
    // First extract the text using base64 method
    const extractionResult = await extractPdfText(fileBuffer, filename);
    
    if (!extractionResult.success || !extractionResult.text) {
      throw new Error("Failed to extract text from PDF");
    }

    // Then analyze the extracted text
    const analysisResult = await analyzeResume(
      extractionResult.text,
      targetRole,
      "default"
    );

    return {
      success: true,
      filename: filename,
      page_count: extractionResult.page_count,
      text_length: extractionResult.text.length,
      analysis: analysisResult
    };
  } catch (error) {
    console.error("PDF Resume Analysis Service Error:", error);
    throw new Error(`Failed to analyze PDF resume: ${error.message}`);
  }
};

/**
 * Check Python service health
 * @returns {Promise<boolean>} - Service health status
 */
export const checkServiceHealth = async () => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: "GET",
    });

    return response.ok;
  } catch (error) {
    console.error("Python service health check failed:", error);
    return false;
  }
};

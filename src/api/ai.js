const API_BASE = "http://localhost:5000/api/ai";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("syncup_token");
};

/**
 * Get auth headers with token
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Ask Career Coach AI a question
 * @param {string} message - User's message/question
 * @returns {Promise<Object>} - AI response
 */
export const askCareerCoach = async (message) => {
  try {
    // Create abort controller for 5 minute timeout (AI can take 2-3 mins)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes

    const response = await fetch(`${API_BASE}/coach`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to get AI response");
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI analysis is taking longer than expected. Please try again.');
    }
    console.error("Career Coach API Error:", error);
    throw error;
  }
};

/**
 * Get team matching and mentor recommendations from Matcher Agent
 * @param {string} action - Action type: "matchmake", "mentor", "chat"
 * @param {Object} options - Additional options (goal, targetRole, etc.)
 * @returns {Promise<Object>} - Matcher results
 */
export const askMatcherAgent = async (action = "matchmake", options = {}) => {
  try {
    const response = await fetch(`${API_BASE}/matcher`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action,
        ...options
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to get matcher results");
    }

    return data;
  } catch (error) {
    console.error("Matcher Agent API Error:", error);
    throw error;
  }
};

/**
 * Analyze resume with ATS scoring
 * @param {string} resumeText - Resume content
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Resume analysis
 */
export const analyzeResume = async (resumeText, targetRole = "Software Engineer") => {
  try {
    const response = await fetch(`${API_BASE}/resume/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        resumeText,
        targetRole
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to analyze resume");
    }

    return data;
  } catch (error) {
    console.error("Resume Analysis API Error:", error);
    throw error;
  }
};

/**
 * Extract text from PDF file
 * @param {File} file - PDF file object
 * @returns {Promise<Object>} - Extracted text and metadata
 */
export const extractPdfText = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/pdf/extract`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to extract PDF text");
    }

    return data;
  } catch (error) {
    console.error("PDF Extraction API Error:", error);
    throw error;
  }
};

/**
 * Analyze PDF resume directly (extraction + analysis in one call)
 * @param {File} file - PDF file object
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Resume analysis
 */
export const analyzeResumePdf = async (file, targetRole = "Software Engineer") => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', targetRole);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/resume/analyze-pdf`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to analyze PDF resume");
    }

    return data;
  } catch (error) {
    console.error("PDF Resume Analysis API Error:", error);
    throw error;
  }
};

/**
 * Analyze GitHub profile
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - GitHub analysis
 */
export const analyzeGitHub = async (username) => {
  try {
    const response = await fetch(`${API_BASE}/github/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to analyze GitHub");
    }

    return data;
  } catch (error) {
    console.error("GitHub Analysis API Error:", error);
    throw error;
  }
};

/**
 * Run full career development workflow
 * @param {string} inputData - Resume text or GitHub username
 * @param {string} inputType - "resume" or "github"
 * @param {string} targetRole - Target career role
 * @returns {Promise<Object>} - Complete workflow results
 */
export const runFullWorkflow = async (inputData, inputType, targetRole = "Software Engineer") => {
  try {
    const response = await fetch(`${API_BASE}/workflow/full`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        inputData,
        inputType,
        targetRole
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to run workflow");
    }

    return data;
  } catch (error) {
    console.error("Full Workflow API Error:", error);
    throw error;
  }
};

/**
 * Run hackathon workflow
 * @param {Object} hackathonData - Hackathon parameters
 * @returns {Promise<Object>} - Hackathon workflow results
 */
export const runHackathonWorkflow = async (hackathonData) => {
  try {
    const response = await fetch(`${API_BASE}/hackathon/workflow`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(hackathonData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to run hackathon workflow");
    }

    return data;
  } catch (error) {
    console.error("Hackathon Workflow API Error:", error);
    throw error;
  }
};

/**
 * Get personalized project ideas
 * @returns {Promise<Object>} - Project ideas
 */
export const getProjectIdeas = async () => {
  try {
    const response = await fetch(`${API_BASE}/project-ideas`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to get project ideas");
    }

    return data;
  } catch (error) {
    console.error("Project Ideas API Error:", error);
    throw error;
  }
};

/**
 * Get team strategy advice
 * @returns {Promise<Object>} - Team strategy recommendations
 */
export const getTeamStrategy = async () => {
  try {
    const response = await fetch(`${API_BASE}/team-strategy`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to get team strategy");
    }

    return data;
  } catch (error) {
    console.error("Team Strategy API Error:", error);
    throw error;
  }
};

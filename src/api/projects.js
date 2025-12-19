import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('syncup_token') || localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Get all projects for a user
 */
export const getUserProjects = async (userId) => {
  try {
    console.log('📊 API: Fetching user projects', { userId });
    
    const response = await axios.get(
      `${API_BASE}/api/projects/${userId}`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully fetched projects', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to fetch projects', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects');
  }
};

/**
 * Get specific project details
 */
export const getProjectDetails = async (userId, hackathonId) => {
  try {
    console.log('📋 API: Fetching project details', { userId, hackathonId });
    
    const response = await axios.get(
      `${API_BASE}/api/projects/${userId}/${hackathonId}`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully fetched project details', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to fetch project details', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project details');
  }
};

/**
 * Add or update project
 */
export const addOrUpdateProject = async (projectData) => {
  try {
    console.log('💾 API: Adding/updating project', projectData);
    
    const response = await axios.post(
      `${API_BASE}/api/projects/add`,
      projectData,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully updated project', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to update project', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update project');
  }
};

/**
 * Get user's joined hackathons (for project creation)
 */
export const getUserHackathons = async (userId) => {
  try {
    console.log('🎯 API: Fetching user hackathons', { userId });
    
    const response = await axios.get(
      `${API_BASE}/api/projects/hackathons/${userId}`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully fetched hackathons', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to fetch hackathons', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch hackathons');
  }
};

/**
 * Get project code
 */
export const getProjectCode = async (userId, projectId) => {
  try {
    console.log('📝 API: Fetching project code', { userId, projectId });
    
    const response = await axios.get(
      `${API_BASE}/api/projects/${userId}/${projectId}`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully fetched project code');
    return response.data.project?.sharedCode || "// Start coding with your teammates!";
  } catch (error) {
    console.error('❌ API: Failed to fetch project code', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project code');
  }
};

/**
 * Save project code
 */
export const saveProjectCode = async (projectId, code) => {
  try {
    console.log('💾 API: Saving project code', { projectId });
    
    const response = await axios.put(
      `${API_BASE}/api/projects/${projectId}/code`,
      { code },
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully saved project code', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to save project code', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to save project code');
  }
};
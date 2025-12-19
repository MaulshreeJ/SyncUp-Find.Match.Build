import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Get all workspace files
export const getWorkspaceFiles = async (projectId) => {
  try {
    console.log('📂 API: Fetching workspace files', { projectId });
    const response = await axios.get(
      `${API_URL}/api/workspace/${projectId}`,
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully fetched workspace files');
    return response.data.files;
  } catch (error) {
    console.error('❌ API: Failed to fetch workspace files:', error.response?.data || error.message);
    throw error;
  }
};

// Save a file
export const saveWorkspaceFile = async (projectId, fileName, content, language) => {
  try {
    console.log('💾 API: Saving workspace file', { projectId, fileName });
    const response = await axios.put(
      `${API_URL}/api/workspace/${projectId}/file`,
      { fileName, content, language },
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully saved file');
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to save file:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a file
export const deleteWorkspaceFile = async (projectId, fileName) => {
  try {
    console.log('🗑️ API: Deleting workspace file', { projectId, fileName });
    const response = await axios.delete(
      `${API_URL}/api/workspace/${projectId}/file/${encodeURIComponent(fileName)}`,
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully deleted file');
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to delete file:', error.response?.data || error.message);
    throw error;
  }
};

// Update active user status
export const updateActiveUser = async (projectId, currentFile) => {
  try {
    console.log('👤 API: Updating active user', { projectId, currentFile });
    const response = await axios.post(
      `${API_URL}/api/workspace/${projectId}/active`,
      { currentFile },
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully updated active user');
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to update active user:', error.response?.data || error.message);
    throw error;
  }
};

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
 * Join hackathon as team leader
 */
export const joinHackathonAsLeader = async (hackathonId, teamName, projectName = '') => {
  try {
    console.log('🚀 API: Joining hackathon as leader', { hackathonId, teamName, projectName });
    
    const response = await axios.post(
      `${API_BASE}/api/team/join`,
      { hackathonId, teamName, projectName },
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully joined as leader', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to join hackathon as leader', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to join hackathon');
  }
};

/**
 * Invite team member by email
 */
export const inviteTeamMember = async (email, hackathonId) => {
  try {
    console.log('📧 API: Inviting team member', { email, hackathonId });
    
    const response = await axios.post(
      `${API_BASE}/api/team/invite`,
      { email, hackathonId },
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully sent invitation', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to send invitation', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send invitation');
  }
};

/**
 * Respond to team invitation
 */
export const respondToInvite = async (leaderEmail, hackathonId, response) => {
  try {
    console.log('🤝 API: Responding to invite', { leaderEmail, hackathonId, response });
    
    const apiResponse = await axios.post(
      `${API_BASE}/api/team/respond`,
      { leaderEmail, hackathonId, response },
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully responded to invite', apiResponse.data);
    return apiResponse.data;
  } catch (error) {
    console.error('❌ API: Failed to respond to invite', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to respond to invitation');
  }
};

/**
 * Get team details for a user
 */
export const getTeamDetails = async (userId) => {
  try {
    console.log('👥 API: Getting team details', { userId });
    
    const response = await axios.get(
      `${API_BASE}/api/team/${userId}`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully got team details', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to get team details', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get team details');
  }
};

/**
 * Get pending team requests
 */
export const getPendingTeamRequests = async () => {
  try {
    console.log('📋 API: Getting pending team requests');
    
    const response = await axios.get(
      `${API_BASE}/api/team/requests/pending`,
      { headers: createAuthHeaders() }
    );
    
    console.log('✅ API: Successfully got pending requests', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to get pending requests', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get pending requests');
  }
};
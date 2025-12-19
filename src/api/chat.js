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

// Get all chat messages
export const getChatMessages = async (hackathonId) => {
  try {
    console.log('💬 API: Fetching chat messages', { hackathonId });
    const response = await axios.get(
      `${API_URL}/api/chat/${hackathonId}`,
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully fetched chat messages');
    return response.data.messages;
  } catch (error) {
    console.error('❌ API: Failed to fetch chat messages:', error.response?.data || error.message);
    throw error;
  }
};

// Send a chat message
export const sendChatMessage = async (hackathonId, message) => {
  try {
    console.log('💬 API: Sending chat message', { hackathonId });
    const response = await axios.post(
      `${API_URL}/api/chat/${hackathonId}`,
      { message },
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully sent chat message');
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to send chat message:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a chat message
export const deleteChatMessage = async (hackathonId, messageId) => {
  try {
    console.log('💬 API: Deleting chat message', { hackathonId, messageId });
    const response = await axios.delete(
      `${API_URL}/api/chat/${hackathonId}/${messageId}`,
      { headers: createAuthHeaders() }
    );
    console.log('✅ API: Successfully deleted chat message');
    return response.data;
  } catch (error) {
    console.error('❌ API: Failed to delete chat message:', error.response?.data || error.message);
    throw error;
  }
};

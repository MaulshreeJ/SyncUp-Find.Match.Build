import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  return localStorage.getItem('syncup_token') || localStorage.getItem('token');
};

const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Get all conversations
export const getConversations = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages`,
      { headers: createAuthHeaders() }
    );
    return response.data.conversations;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
};

// Get messages with a specific user
export const getMessages = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/${userId}`,
      { headers: createAuthHeaders() }
    );
    return response.data.messages;
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
};

// Send a message to a user
export const sendMessage = async (userId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/messages/${userId}`,
      { message },
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (userId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/messages/${userId}`,
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
};

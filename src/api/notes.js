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

export const getNotesAndLinks = async (hackathonId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/notes/${hackathonId}`,
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    throw error;
  }
};

export const addNote = async (hackathonId, title, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/notes/${hackathonId}/note`,
      { title, content },
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add note:', error);
    throw error;
  }
};

export const addLink = async (hackathonId, title, url, description) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/notes/${hackathonId}/link`,
      { title, url, description },
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add link:', error);
    throw error;
  }
};

export const deleteNote = async (hackathonId, noteId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notes/${hackathonId}/note/${noteId}`,
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
};

export const deleteLink = async (hackathonId, linkId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notes/${hackathonId}/link/${linkId}`,
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to delete link:', error);
    throw error;
  }
};

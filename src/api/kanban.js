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

export const getKanbanBoard = async (hackathonId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/kanban/${hackathonId}`,
      { headers: createAuthHeaders() }
    );
    return response.data.kanban;
  } catch (error) {
    console.error('Failed to fetch kanban:', error);
    throw error;
  }
};

export const updateKanbanBoard = async (hackathonId, kanbanData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/kanban/${hackathonId}`,
      kanbanData,
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update kanban:', error);
    throw error;
  }
};

export const addTask = async (hackathonId, columnId, content, assignee) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/kanban/${hackathonId}/task`,
      { columnId, content, assignee },
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add task:', error);
    throw error;
  }
};

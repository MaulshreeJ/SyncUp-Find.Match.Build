import axios from "axios";

const API_URL = "http://localhost:5000/api/connections";

// Send a connection request
export const sendConnection = async (senderId, receiverId) => {
  try {
    const response = await axios.post(
      `${API_URL}/send`,
      { senderId, receiverId },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("✅ Connection request sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Connection request failed:", error.response?.data || error);
    throw error;
  }
};

// Accept a connection request
export const acceptConnection = async (requestId) => {
  try {
    const response = await axios.post(`${API_URL}/accept`, { requestId });
    return response.data;
  } catch (error) {
    console.error("❌ Error accepting connection:", error.response?.data || error);
    throw error;
  }
};

//Fetch all accepted (connected) teammates
export const getAcceptedConnections = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/accepted/${userId}`);
    console.log("👥 Accepted connections fetched:", response.data);
    return response.data.connections;
  } catch (error) {
    console.error("❌ Error fetching accepted connections:", error.response?.data || error);
    throw error;
  }
};

// Reject a connection request
export const rejectConnection = async (requestId) => {
  try {
    const response = await axios.post(`${API_URL}/reject`, { requestId });
    return response.data;
  } catch (error) {
    console.error("❌ Error rejecting connection:", error.response?.data || error);
    throw error;
  }
};

// Fetch all received (pending) connection requests for the current user
export const getReceivedConnections = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/received/${userId}`);
    console.log("📬 Received requests fetched:", response.data);
    return response.data.requests;
  } catch (error) {
    console.error("❌ Error fetching received requests:", error.response?.data || error);
    throw error;
  }
};
// Get all pending connection requests for a user
export const getPendingRequests = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/requests/${userId}`);
    console.log("📩 Pending requests fetched:", response.data);
    return response.data.requests; // adjust if backend returns differently
  } catch (error) {
    console.error("❌ Error fetching pending requests:", error.response?.data || error);
    throw error;
  }
};

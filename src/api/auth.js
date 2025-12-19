// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // Your backend base URL
// });

// // Register API
// export const registerUser = async (userData) => {
//   const { data } = await API.post("/register", userData);
//   return data;
// };

// // Login API
// export const loginUser = async (userData) => {
//   const { data } = await API.post("/login", userData);
//   return data;
// };

// import axios from "axios";
// import { loginUser, registerUser } from "../api/auth.js";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// // Register API
// export const registerUser = async (userData) => {
//   const { data } = await API.post("/register", userData);
//   return data;
// };

// // Login API
// export const loginUser = async (userData) => {
//   const { data } = await API.post("/login", userData);
//   return data;
// };

// src/api/auth.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users",
});

// ✅ Register User
export const registerUser = async (userData) => {
  try {
    const { data } = await API.post("/register", userData);
    return data;
  } catch (err) {
    console.error("Register error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// ✅ Login User
export const loginUser = async (userData) => {
  try {
    const { data } = await API.post("/login", userData);
    return data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// ✅ Get Profile
export const getProfile = async (token) => {
  try {
    const { data } = await API.get("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err) {
    console.error("Get profile error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Update profile (authenticated)
export const updateProfile = async (token, updates) => {
  const { data } = await API.put("/profile", updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
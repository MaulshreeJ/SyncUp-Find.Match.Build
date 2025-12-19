
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("syncup_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // IMPORTANT: backend routes are mounted under /api/users
  const API_BASE = "http://localhost:5000/api/users";

  // ------------------------------------------------------------
  // Load token / user from localStorage (and fetch profile if needed)
  // ------------------------------------------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem("syncup_token");
    const storedUser = localStorage.getItem("syncup_user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
      setLoading(false);
    } else if (storedToken) {
      // token exists but no cached user -> fetch profile
      fetchProfile(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------
  // Fetch Profile (using token) -> GET /profile
  // ------------------------------------------------------------
  const fetchProfile = async (token) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("syncup_user", JSON.stringify(data));
        return data;
      } else {
        // token might be invalid/expired — clear it
        console.error("Failed to fetch profile:", data.error || data.message || data);
        localStorage.removeItem("syncup_token");
        localStorage.removeItem("syncup_user");
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // on network errors we don't wipe the token automatically here
      return null;
    }
  };

  // ------------------------------------------------------------
  // Login request (email + password → token then fetch profile)
  // POST /login
  // ------------------------------------------------------------
  const loginRequest = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      // must be token in response
      if (!data.token) {
        throw new Error("No token returned from login");
      }

      // Store token
      localStorage.setItem("syncup_token", data.token);

      // Fetch full profile using token (server returns full user at /profile)
      const profile = await fetchProfile(data.token);
      // if profile fetching failed, still return the login response
      return profile || data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ------------------------------------------------------------
  // Register request (name, email, password, skills)
  // POST /register
  // ------------------------------------------------------------
  const register = async (name, email, password, skills = "") => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, skills }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Registration failed");

      if (!data.token) {
        // some servers return token, others might not — handle both cases
        console.warn("Register succeeded but no token returned.");
        return data;
      }

      // store token then fetch profile
      localStorage.setItem("syncup_token", data.token);
      const profile = await fetchProfile(data.token);
      return profile || data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // ------------------------------------------------------------
  // Helper to set user directly (keeps token in localStorage)
  // Accepts an object that includes token optionally
  // ------------------------------------------------------------
  const login = (userData) => {
    // If the passed object has a token, store it
    if (userData?.token) {
      localStorage.setItem("syncup_token", userData.token);
    }
    setUser(userData);
    try {
      localStorage.setItem("syncup_user", JSON.stringify(userData));
    } catch {}
  };

  // ------------------------------------------------------------
  // Update profile (PUT /profile) - returns updated user
  // ------------------------------------------------------------
  const updateProfile = async (updatedData) => {
    const token = localStorage.getItem("syncup_token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("syncup_user", JSON.stringify(data));
        return data;
      } else {
        console.error("Profile update failed:", data.error || data.message || data);
        throw new Error(data.error || data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // alias used by Profile.jsx
  const updateUser = updateProfile;

  // ------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem("syncup_user");
    localStorage.removeItem("syncup_token");
  };

  // ------------------------------------------------------------
  // Expose context
  // ------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginRequest,
        register,
        updateProfile,
        updateUser, // alias
        logout,
        fetchProfile, // exported in case you want to re-fetch manually
        setUser, // useful for small UI-only changes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

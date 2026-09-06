import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (authToken) {
      try {
        const decodedUser = jwtDecode(authToken);
        console.log("✅ Decoded Token:", decodedUser);

        if (!decodedUser.name) {
          console.warn("⚠️ Name is missing in token!");
        }

        if (decodedUser.exp * 1000 < Date.now()) {
          console.warn("🔴 Session expired! Logging out...");
          logout();
          return;
        }

        setUser(decodedUser);
      } catch (error) {
        console.error("⚠️ Invalid token:", error);
        logout();
      }
    }
  }, [authToken]);

  const login = (token) => {
    console.log("🔹 Received Token:", token);

    if (!token) {
      console.error("❌ No token received!");
      alert("Authentication failed. Please try again.");
      return;
    }

    try {
      const decodedUser = jwtDecode(token);
      console.log("✅ Decoded Token:", decodedUser);

      if (decodedUser.exp * 1000 < Date.now()) {
        alert("Session expired! Please log in again.");
        return;
      }

      setUser(decodedUser);
      setAuthToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("⚠️ Login failed: Invalid token", error);
      alert("Invalid session. Please try again.");
    }
  };

  const logout = () => {
    console.log("🔴 Logging out...");
    setUser(null);
    setAuthToken("");
    localStorage.removeItem("token");
    alert("Session expired! Please log in again.");
  };

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

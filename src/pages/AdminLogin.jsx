import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {jwtDecode} from "jwt-decode"; // ✅ Make sure to install: npm install jwt-decode
import "../styles/Auth.css"; 

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); 
  const navigate = useNavigate();

  // 📌 Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.includes("@")) {
      setError("❌ Please enter a valid email.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("❌ Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("🔍 Server Response:", response.data); // ✅ Debugging

      if (!response.data.token) {
        setError("❌ Login failed: No token received.");
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(response.data.token); // Validate JWT
        console.log("🔑 Decoded Token:", decodedToken);

        if (!decodedToken.is_admin) {
          setError("❌ Access denied. Only admins can log in here.");
          setLoading(false);
          return;
        }

        // 🎟️ Save JWT token in AuthContext
        login(response.data.token); // ✅ Pass only the token here

        // ✅ Redirect ONLY if the user is an admin
        navigate("/admin/dashboard"); 

      } catch (tokenError) {
        setError("❌ Invalid token received. Please try again.");
        console.error("⚠️ Token Decoding Error:", tokenError);
      }

    } catch (err) {
      console.error("❌ Admin Login Request Failed:", err);
      setError("❌ Login failed. Please check your credentials.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <div className="auth-image-overlay">
          <h2 className="auth-image-title">Admin Portal</h2>
          <p className="auth-image-text">
            Secure access for authorized administrators only.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h1 className="auth-title">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Not an admin? <a href="/login">Go to User Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

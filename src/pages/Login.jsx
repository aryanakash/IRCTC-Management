import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css"; // Ensure this file contains proper styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✅ Use login function from AuthContext
  const navigate = useNavigate();

  // 📌 Handle Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 🚨 Basic validation before sending request
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

      console.log("🔹 Response Data:", response.data);

      if (response.data.token) {
        login(response.data.token); // ✅ Save JWT token in AuthContext
        
        const decodedUser = JSON.parse(atob(response.data.token.split(".")[1])); // Decode JWT
        console.log("👤 Decoded User:", decodedUser);

        // 🚀 Redirect Based on User Role
        if (decodedUser.is_admin) {
          navigate("/admin/dashboard"); // ✅ Redirect Admins
        } else {
          navigate("/"); // ✅ Redirect Normal Users
        }
      } else {
        setError("❌ Unexpected error. Please try again.");
      }

    } catch (err) {
      console.error("🚨 Login Error:", err);

      if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError("❌ Server error. Please try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <div className="auth-image-overlay">
          <h2 className="auth-image-title">Welcome Back!</h2>
          <p className="auth-image-text">
            Login to book train tickets and explore India's rail network.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h1 className="auth-title">Login</h1>
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
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

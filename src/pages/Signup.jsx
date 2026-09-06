import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Debugging: Track OTP field visibility
  useEffect(() => {
    console.log("OTP Field State:", showOtpField);
  }, [showOtpField]);

  // 📌 Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
      });

      console.log("Signup Response:", response.data);
      setSuccess("OTP sent to your email!");
      setShowOtpField(true); // Show OTP input field
      setLoading(false);
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
    }
  };

  // 📌 Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      if (response.data.message) {
        setSuccess("✅ Email verified successfully!");
        // Wait for 2 seconds before redirecting to login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("❌ Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("❌ OTP verification failed.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <div className="auth-image-overlay">
          <h2 className="auth-image-title">Join Us!</h2>
          <p className="auth-image-text">
            Sign up to book train tickets and explore India's rail network.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h1 className="auth-title">{showOtpField ? "Verify OTP" : "Sign Up"}</h1>

          {!showOtpField ? (
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

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

              <div className="input-group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

require("dotenv").config();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/email");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 📌 Generate OTP (6-digit)
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// 📌 User Registration with OTP Verification
const registerUser = async (req, res) => {
  const { name, email, password, is_admin = false } = req.body;

  try {
    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered. Please login." });
      }

      // 🔒 Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🔢 Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL format

      console.log(`✅ OTP Generated: ${otp} for ${email}`);

      // 🔄 Insert into DB
      const sql = `
        INSERT INTO users (name, email, password, is_admin, otp, otp_expiry, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `;

      db.query(sql, [name, email, hashedPassword, is_admin ? 1 : 0, otp, otpExpiry], async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 📧 Send OTP Email
        await sendVerificationEmail(email, { name, otp });

        res.status(201).json({ message: "User registered. Please verify your email with OTP." });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Verify OTP
const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = results[0];

    console.log(`🔍 Checking OTP for ${email}`);
    console.log(`➡️ Received OTP: ${otp}`);
    console.log(`✅ Stored OTP: ${user.otp}`);
    console.log(`⏳ OTP Expiry: ${user.otp_expiry}`);

    // Check OTP & expiry
    if (user.otp !== otp || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // ✅ Update verification status
    db.query("UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?", [email], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Email verified successfully. You can now log in." });
    });
  });
};

// 📌 User Login (Requires Email Verification)
const loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // 🔒 Check email verification
    if (!user.is_verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }

    // 🔒 Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🛠️ Admin check
    const isAdmin = user.is_admin === 1;

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, is_admin: isAdmin },
      JWT_SECRET,
      { expiresIn: "2h" } // Extended expiry time
    );

    res.json({ message: "Login successful", token, is_admin: isAdmin });
  });
};

// 📌 Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 📌 Middleware for Admin Routes
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { registerUser, verifyOTP, loginUser, verifyToken, verifyAdmin };

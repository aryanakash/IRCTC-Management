const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const router = express.Router();

// ✅ Temporary OTP Storage (Use Redis for production)
const otpCache = new Map();

// ✅ Email Transporter Setup (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * 📝 **Step 1: Signup & OTP Generation**
 * - Generates an OTP for email verification
 * - Reactivates soft-deleted accounts and auto-verifies them
 */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const emailLower = email.toLowerCase().trim();

  try {
    // 🔍 Check if email already exists
    const [existingUser] = await pool.promise().query("SELECT * FROM users WHERE LOWER(email) = ?", [emailLower]);

    if (existingUser.length > 0) {
      const user = existingUser[0];

      // 🛠 If user was deleted, **reactivate & auto-verify**
      if (user.is_deleted) {
        await pool.promise().query("UPDATE users SET is_deleted = 0, is_verified = 1 WHERE email = ?", [emailLower]);
        return res.status(200).json({ message: "✅ Your account was reactivated! Please log in." });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    // 🔢 Generate 6-digit OTP (For new users)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // 📝 Store OTP in memory (not DB)
    otpCache.set(emailLower, { otp, otpExpiry, name, password });

    console.log("✅ OTP generated:", otp);

    // 📧 Send OTP Email
    await transporter.sendMail({
      from: `"IRCTC Support" <${process.env.EMAIL}>`,
      to: emailLower,
      subject: "Your OTP for IRCTC Signup",
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });

    console.log(`✅ OTP sent successfully to: ${emailLower}`);
    res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🛡 **Step 2: OTP Verification**
 * - Saves user in DB only after successful OTP verification
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const emailLower = email.toLowerCase().trim();

  try {
    // 🔍 Check if OTP exists
    const userData = otpCache.get(emailLower);
    if (!userData) {
      return res.status(400).json({ message: "OTP expired. Please sign up again." });
    }

    const { otp: storedOtp, otpExpiry, name, password } = userData;

    // ⏳ Check OTP expiry
    if (Date.now() > otpExpiry) {
      otpCache.delete(emailLower);
      return res.status(400).json({ message: "OTP expired. Please sign up again." });
    }

    // 🔑 Validate OTP
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user in DB
    await pool.promise().query(
      `INSERT INTO users (name, email, password, is_verified, is_deleted) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE is_verified = 1, is_deleted = 0`,
      [name, emailLower, hashedPassword, 1, 0]
    );

    console.log("✅ User verified & saved:", emailLower);

    // 🗑️ Remove OTP data after successful verification
    otpCache.delete(emailLower);

    res.status(200).json({ message: "Account verified successfully!" });

  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔐 **Step 3: Login**
 * - Ensures users can only log in if verified
 * - Prevents login for soft-deleted accounts
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const emailLower = email.toLowerCase().trim();

  try {
    // 🔍 Fetch user
    const [user] = await pool.promise().query("SELECT * FROM users WHERE LOWER(email) = ?", [emailLower]);
    if (user.length === 0) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    const { id, name, password: hashedPassword, is_verified, is_admin, is_deleted } = user[0];

    // 🛑 Check if account is deleted
    if (is_deleted) {
      return res.status(403).json({ message: "Your account was deleted. Please contact support." });
    }

    // 🛑 Check if account is verified
    if (!is_verified) {
      return res.status(403).json({ message: "Account not verified. Please verify via OTP." });
    }

    // 🔑 Validate password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 🎟️ Generate JWT Token with name included
    const token = jwt.sign(
      { 
        id, 
        email: emailLower, 
        name,  // Add name to token
        is_admin: !!is_admin 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful:", emailLower);
    res.status(200).json({ message: "Login successful", token, is_admin: !!is_admin });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

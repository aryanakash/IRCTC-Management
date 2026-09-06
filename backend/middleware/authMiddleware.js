const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure you have a .env file with JWT_SECRET

// 🛠 **Middleware to Protect Routes (User Must Be Logged In)**
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// 🛠 **Middleware for Admin Access**
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Access Denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };

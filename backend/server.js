const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db"); // MySQL Database Connection

const authRoutes = require("./routes/authRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminroutes");
const paymentRoutes = require("./routes/paymentRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration (Allow Specific Origins if needed)
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// ✅ Middleware
app.use(express.json()); // Body parsing for JSON requests

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes); // Add this line
app.use("/api/payments", paymentRoutes);

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚄 IRCTC Clone Backend Running!");
});

// ✅ 404 Not Found Middleware (Handles unknown routes)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Global Error Handler (Improved for better debugging)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server only if DB connects successfully
db.promise()
  .query("SELECT 1") // Simple test query
  .then(() => {
    console.log("✅ Database connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Exit process if DB fails
  });

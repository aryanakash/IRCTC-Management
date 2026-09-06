const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");

// ✅ Middleware to validate and sanitize query parameters
const validateTrainSearch = (req, res, next) => {
  let { from, to, date } = req.query;

  // Trim and normalize input
  from = from?.trim();
  to = to?.trim();
  date = date?.trim();

  if (!from || !to || !date) {
    return res.status(400).json({ error: "Missing 'from', 'to', or 'date' parameters" });
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  req.query = { from, to, date }; // Update request with sanitized values
  next();
};

// 🔎 **Search Trains** (GET /api/trains/search?from=Delhi&to=Mumbai&date=YYYY-MM-DD)
router.get("/search", validateTrainSearch, trainController.searchTrains);

// 🚆 **Get Train Details by ID** (GET /api/trains/:id)
router.get("/:id", trainController.getTrainById);

module.exports = router;

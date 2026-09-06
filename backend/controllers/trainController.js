const db = require("../db");

// 🔎 **Search Trains Without Date Filter**
exports.searchTrains = (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Please provide 'from' and 'to' parameters" });
  }

  const query = `
    SELECT * FROM trains 
    WHERE source_station COLLATE utf8mb4_general_ci = ? 
      AND destination_station COLLATE utf8mb4_general_ci = ? 
      AND available_seats > 0  -- ✅ Ensures only trains with seats are shown
    ORDER BY travel_date ASC  -- 📅 Sort results by earliest travel date first
  `;

  console.log("🔎 Searching for trains with:", { from, to });

  db.query(query, [from, to], (err, results) => {
    if (err) {
      console.error("🚨 Train search error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No trains found for the given route." });
    }

    res.json({ trains: results });
  });
};

// ✅ **Get Train by ID**
exports.getTrainById = (req, res) => {
  const trainId = req.params.id;

  if (!trainId) {
    return res.status(400).json({ error: "Train ID is required" });
  }

  const query = "SELECT * FROM trains WHERE id = ?";

  db.query(query, [trainId], (err, results) => {
    if (err) {
      console.error("🚨 Error fetching train:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Train not found" });
    }

    // ✅ Convert travel_date to YYYY-MM-DD format
    const train = results[0];
    train.travel_date = new Date(train.travel_date).toISOString().split("T")[0];

    res.json(train);
  });
};

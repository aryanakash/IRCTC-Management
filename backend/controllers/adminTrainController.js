const db = require('../db');

// ✅ Add a New Train
exports.addTrain = (req, res) => {
  const { train_name, source_station, destination_station, departure_time, arrival_time, travel_date, price, total_seats } = req.body;

  if (!train_name || !source_station || !destination_station || !departure_time || !arrival_time || !travel_date || !price || !total_seats) {
    return res.status(400).json({ error: "All train details are required" });
  }

  const query = `INSERT INTO trains (train_name, source_station, destination_station, departure_time, arrival_time, travel_date, price, total_seats, available_seats)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`; 

  db.query(query, [train_name, source_station, destination_station, departure_time, arrival_time, travel_date, price, total_seats, total_seats], (err, result) => {
    if (err) {
      console.error("🚨 Error adding train:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "🚆 Train added successfully", trainId: result.insertId });
  });
};

// ✅ Update Train Details with Existence Check
exports.updateTrain = (req, res) => {
  const { id } = req.params;
  const { train_name, source_station, destination_station, departure_time, arrival_time, travel_date, price, total_seats } = req.body;

  const checkQuery = `SELECT id FROM trains WHERE id = ?`;
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("🚨 Error checking train existence:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Train not found" });
    }

    const query = `UPDATE trains 
                   SET train_name=?, source_station=?, destination_station=?, departure_time=?, arrival_time=?, travel_date=?, price=?, total_seats=?
                   WHERE id=?`;

    db.query(query, [train_name, source_station, destination_station, departure_time, arrival_time, travel_date, price, total_seats, id], (err) => {
      if (err) {
        console.error("🚨 Error updating train:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "✏️ Train updated successfully" });
    });
  });
};

// ✅ Delete Train with Existence Check
exports.deleteTrain = (req, res) => {
  const { id } = req.params;

  const checkQuery = `SELECT id FROM trains WHERE id = ?`;
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("🚨 Error checking train existence:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Train not found" });
    }

    const query = `DELETE FROM trains WHERE id=?`;
    db.query(query, [id], (err) => {
      if (err) {
        console.error("🚨 Error deleting train:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "❌ Train deleted successfully" });
    });
  });
};

// ✅ Modify Available Seats, Not Total Seats
exports.updateSeats = (req, res) => {
  const { id } = req.params;
  const { available_seats } = req.body;

  if (!available_seats || isNaN(available_seats)) {
    return res.status(400).json({ error: "Valid available_seats value is required" });
  }

  const query = `UPDATE trains SET available_seats=? WHERE id=?`;

  db.query(query, [available_seats, id], (err) => {
    if (err) {
      console.error("🚨 Error updating seats:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "🎟 Seat availability updated" });
  });
};

// ✅ Get All Trains for Admin Dashboard
exports.getAllTrains = (req, res) => {
  const query = `SELECT * FROM trains ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("🚨 Error fetching trains:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

const express = require("express");
const pool = require("../db");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const {
  getAllBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
  confirmBooking,  // ✅ Added Confirm Booking
} = require("../controllers/adminBookingControllers");

const {
  addTrain,
  updateTrain,
  deleteTrain,
  updateSeats,
  getAllTrains,
} = require("../controllers/adminTrainController");

const router = express.Router();

/**
 * 🏢 **Admin User Management**
 */
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await pool
      .promise()
      .query("SELECT id, name, email, is_admin, is_verified FROM users WHERE is_deleted = 0");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-user/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.promise().getConnection();
    await conn.beginTransaction();

    const [user] = await conn.query("SELECT id, is_admin, is_deleted FROM users WHERE id = ?", [id]);

    if (user.length === 0) {
      await conn.release();
      return res.status(404).json({ message: "User not found." });
    }

    if (user[0].is_deleted) {
      await conn.release();
      return res.status(400).json({ message: "User is already deleted." });
    }

    if (user[0].is_admin) {
      await conn.release();
      return res.status(403).json({ message: "You cannot delete another admin." });
    }

    if (req.user.id === parseInt(id)) {
      await conn.release();
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    await conn.query("UPDATE users SET is_deleted = 1 WHERE id = ?", [id]);

    await conn.commit();
    await conn.release();

    res.status(200).json({ message: "User deleted successfully (soft delete)." });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🚆 **Admin Train Management**
 */
router.get("/trains", authMiddleware, adminMiddleware, getAllTrains);
router.post("/trains", authMiddleware, adminMiddleware, addTrain);
router.put("/trains/:id", authMiddleware, adminMiddleware, updateTrain);
router.delete("/trains/:id", authMiddleware, adminMiddleware, deleteTrain);
router.patch("/trains/:id/seats", authMiddleware, adminMiddleware, updateSeats);

/**
 * 🎟️ **Admin Booking Management**
 */
// ✅ Get All Bookings (Optional: Filter by status)
router.get("/bookings", authMiddleware, adminMiddleware, getAllBookings);

// ✅ Modify Booking (Update passenger details)
router.put("/bookings/:id", authMiddleware, adminMiddleware, updateBooking);

// ✅ Delete Booking (Admin Only)
router.delete("/bookings/:id", authMiddleware, adminMiddleware, deleteBooking);

// ✅ Cancel Booking (Mark as Cancelled)
router.put("/bookings/cancel/:id", authMiddleware, adminMiddleware, cancelBooking);

// ✅ Confirm Booking (Mark as Confirmed) 🚀 **(New)**
router.put("/bookings/confirm/:id", authMiddleware, adminMiddleware, confirmBooking);

module.exports = router;

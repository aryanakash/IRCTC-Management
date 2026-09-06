const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// 🎟️ Create a new booking
router.post('/', bookingController.createBooking);

// 📜 Get all bookings for a user
router.get('/:userId', bookingController.getUserBookings);

// ❌ Cancel booking using ticket_number
router.delete('/cancel/:ticketNumber', bookingController.cancelBookingByTicket);

module.exports = router;

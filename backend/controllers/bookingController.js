const db = require('../db');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { processPaymentMock, processRefundMock } = require('../utils/payment');
const { sendBookingEmail, sendCancellationEmail } = require('../utils/email');

// 🎟️ Create a new booking
exports.createBooking = async (req, res) => {
  const { userId, trainId, passengerName, passengerAge, travelDate, email } = req.body;

  if (!userId || !trainId || !passengerName || !passengerAge || !travelDate || !email) {
    return res.status(400).json({ error: 'All fields are required, including email.' });
  }

  try {
    const seatQuery = `SELECT train_name, price, total_seats, source_station, destination_station FROM trains WHERE id = ?`;
    db.query(seatQuery, [trainId], async (trainErr, trainResults) => {
      if (trainErr || trainResults.length === 0) {
        return res.status(400).json({ error: 'Invalid train ID.' });
      }

      const { train_name: trainName, price, total_seats: availableSeats, source_station, destination_station } = trainResults[0];

      if (availableSeats <= 0) {
        return res.status(400).json({ error: 'No seats available on this train.' });
      }

      const paymentSuccess = processPaymentMock(price);
      if (!paymentSuccess) {
        return res.status(402).json({ error: 'Payment failed. Please try again.' });
      }

      const ticketNumber = generateTicketNumber();
      const insertQuery = `
        INSERT INTO bookings (user_id, train_id, passenger_name, passenger_age, travel_date, ticket_number, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [userId, trainId, passengerName, passengerAge, travelDate, ticketNumber, email],
        async (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error while booking.' });
          }

          const updateSeatsQuery = `UPDATE trains SET total_seats = total_seats - 1 WHERE id = ?`;
          db.query(updateSeatsQuery, [trainId]);

          try {
            await sendBookingEmail(email, {
              ticketNumber,
              passengerName,
              trainName,
              travelDate,
              fromStation: source_station,
              toStation: destination_station
            });
            console.log("📩 Booking email sent successfully:", email);
          } catch (emailErr) {
            console.error("🚨 Booking email failed:", emailErr);
          }

          res.status(201).json({
            message: 'Booking successful!',
            bookingId: result.insertId,
            ticketNumber
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong during booking.' });
  }
};

// 📜 Fetch user bookings
exports.getUserBookings = (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) AS total FROM bookings WHERE user_id = ?`;
  db.query(countQuery, [userId], (countErr, countResult) => {
    if (countErr) {
      return res.status(500).json({ error: 'Failed to fetch booking count.' });
    }

    const totalBookings = countResult[0].total;
    const totalPages = Math.ceil(totalBookings / limit);

    const query = `
      SELECT b.id, b.travel_date, b.passenger_name, b.passenger_age, b.ticket_number,
             t.train_name, t.source_station AS from_station, t.destination_station AS to_station, t.price
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.travel_date DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [userId, limit, offset], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings.' });
      }

      const formattedResults = results.map(booking => ({
        ...booking,
        travel_date: booking.travel_date.toISOString().split('T')[0],
        status: 'Confirmed'
      }));

      res.json({
        page,
        limit,
        totalPages,
        count: totalBookings,
        bookings: formattedResults
      });
    });
  });
};

// ❌ Cancel Booking by Ticket Number
exports.cancelBookingByTicket = (req, res) => {
  const ticketNumber = req.params.ticketNumber;

  const selectQuery = `
    SELECT b.id, b.passenger_name, b.ticket_number, b.travel_date, b.train_id, b.email, t.train_name, t.price
    FROM bookings b
    JOIN trains t ON b.train_id = t.id
    WHERE b.ticket_number = ?
  `;

  db.query(selectQuery, [ticketNumber], async (selectErr, bookingResults) => {
    if (selectErr || bookingResults.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = bookingResults[0];
    const formattedDate = new Date(booking.travel_date).toISOString().split('T')[0];

    console.log(`💰 Attempting refund for ₹${booking.price}...`);
    const refundSuccess = processRefundMock(booking.price);
    
    if (!refundSuccess) {
      console.error('🚨 Refund Failed for Ticket:', ticketNumber);
      return res.status(500).json({ error: 'Refund failed. Please contact support.' });
    }

    const deleteQuery = `DELETE FROM bookings WHERE ticket_number = ?`;
    db.query(deleteQuery, [ticketNumber], async (deleteErr, result) => {
      if (deleteErr || result.affectedRows === 0) {
        return res.status(500).json({ error: 'Failed to cancel booking.' });
      }

      console.log('✅ Booking deleted successfully:', ticketNumber);

      const updateSeatsQuery = `UPDATE trains SET total_seats = total_seats + 1 WHERE id = ?`;
      db.query(updateSeatsQuery, [booking.train_id]);

      try {
        await sendCancellationEmail(booking.email, {
          ticketNumber: booking.ticket_number,
          passengerName: booking.passenger_name,
          trainName: booking.train_name,
          travelDate: formattedDate
        });
      } catch (emailErr) {
        console.error("🚨 Email sending failed:", emailErr);
      }

      res.json({ message: 'Booking canceled successfully & refund processed.', refundAmount: booking.price });
    });
  });
};

// 🔐 Admin API: Fetch all bookings
exports.getAllBookings = (req, res) => {
  const query = `
    SELECT b.id, b.travel_date, b.passenger_name, b.passenger_age, b.ticket_number,
           b.email, t.train_name, t.source_station, t.destination_station, t.price
    FROM bookings b
    JOIN trains t ON b.train_id = t.id
    ORDER BY b.travel_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch all bookings.' });
    }

    const formattedResults = results.map(booking => ({
      ...booking,
      travel_date: booking.travel_date.toISOString().split('T')[0],
      status: 'Confirmed'
    }));

    res.json({ count: formattedResults.length, bookings: formattedResults });
  });
};

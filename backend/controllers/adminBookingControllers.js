const db = require("../db"); // MySQL connection
const jwt = require("jsonwebtoken");
const { sendBookingEmail, sendCancellationEmail } = require("../utils/email");

// Middleware to check admin
const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

// **1. Get All Bookings (With Train Name, Price, Age & Email)**
exports.getAllBookings = (req, res) => {
    const { status } = req.query; // Optional filter by status

    let sql = `
        SELECT b.id, b.passenger_name, b.passenger_age, b.email, b.ticket_number, b.travel_date, 
               t.price, b.booking_status, COALESCE(t.train_name, 'Train Not Available') AS train_name
        FROM bookings b
        LEFT JOIN trains t ON b.train_id = t.id
    `;

    const values = [];
    if (status) {
        sql += " WHERE b.booking_status = ?";
        values.push(status);
    }

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// **2. Update Booking (Modify Passenger Details)**
exports.updateBooking = (req, res) => {
    const { id } = req.params;
    const { passenger_name, passenger_age, travel_date } = req.body;

    db.query("SELECT booking_status FROM bookings WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Booking not found" });
        if (result[0].booking_status === "Cancelled") {
            return res.status(400).json({ message: "Cannot modify a cancelled booking" });
        }

        const sql = "UPDATE bookings SET passenger_name = ?, passenger_age = ?, travel_date = ? WHERE id = ?";
        db.query(sql, [passenger_name, passenger_age, travel_date, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Booking updated successfully" });
        });
    });
};

// **3. Delete Booking (Admin Only)**
exports.deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const conn = await db.promise().getConnection();
        await conn.beginTransaction();

        const [booking] = await conn.query("SELECT id FROM bookings WHERE id = ?", [id]);
        if (booking.length === 0) {
            await conn.release();
            return res.status(404).json({ message: "Booking not found" });
        }

        await conn.query("DELETE FROM bookings WHERE id = ?", [id]);

        await conn.commit();
        await conn.release();

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting booking:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// **4. Cancel Booking (With Email Notification)**
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const conn = await db.promise().getConnection();
        await conn.beginTransaction();

        const [booking] = await conn.query(
            `SELECT b.id, b.passenger_name, b.passenger_age, b.email, b.ticket_number, b.travel_date, 
                    COALESCE(t.train_name, 'Train Not Available') AS train_name
             FROM bookings b
             LEFT JOIN trains t ON b.train_id = t.id
             WHERE b.id = ?`,
            [id]
        );

        if (booking.length === 0) {
            await conn.release();
            return res.status(404).json({ message: "Booking not found" });
        }

        await conn.query("UPDATE bookings SET booking_status = 'Cancelled' WHERE id = ?", [id]);

        await conn.commit();
        await conn.release();

        await sendCancellationEmail(booking[0].email, {
            ticketNumber: booking[0].ticket_number,
            passengerName: booking[0].passenger_name,
            passengerAge: booking[0].passenger_age,
            trainName: booking[0].train_name,
            travelDate: booking[0].travel_date,
        });

        res.json({ message: "Booking cancelled successfully, email sent." });

    } catch (error) {
        console.error("❌ Error cancelling booking:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// **5. Confirm Booking (With Email Notification)**
exports.confirmBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const conn = await db.promise().getConnection();
        await conn.beginTransaction();

        const [booking] = await conn.query(
            `SELECT b.id, b.passenger_name, b.passenger_age, b.email, b.ticket_number, b.travel_date, 
                    COALESCE(t.train_name, 'Train Not Available') AS train_name
             FROM bookings b
             LEFT JOIN trains t ON b.train_id = t.id
             WHERE b.id = ?`,
            [id]
        );

        if (booking.length === 0) {
            await conn.release();
            return res.status(404).json({ message: "Booking not found" });
        }

        await conn.query("UPDATE bookings SET booking_status = 'Confirmed' WHERE id = ?", [id]);

        await conn.commit();
        await conn.release();

        await sendBookingEmail(booking[0].email, {
            ticketNumber: booking[0].ticket_number,
            passengerName: booking[0].passenger_name,
            passengerAge: booking[0].passenger_age,
            trainName: booking[0].train_name,
            travelDate: booking[0].travel_date,
        });

        res.json({ message: "Booking confirmed successfully, email sent." });

    } catch (error) {
        console.error("❌ Error confirming booking:", error);
        res.status(500).json({ message: "Server error" });
    }
};

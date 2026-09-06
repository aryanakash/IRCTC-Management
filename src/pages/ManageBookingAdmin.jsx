import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth
import { toast } from "react-toastify"; // ✅ Import Toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Toast CSS
import "../styles/ManageBookingAdmin.css";

// Initialize Toast Notifications
toast.configure();

const ManageBookingAdmin = () => {
  const { authToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!authToken) {
        setError("Unauthorized: Please login again.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/admin/bookings", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error.response?.data);
        setError(error.response?.data?.message || "Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [authToken]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookings(bookings.filter((booking) => booking.id !== id));
      toast.success("Booking deleted successfully! 🗑️", { autoClose: 3000 }); // ✅ Toast on delete
    } catch (error) {
      console.error("Error deleting booking:", error.response?.data);
      setError("Failed to delete booking.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookings(bookings.map((b) => (b.id === id ? { ...b, booking_status: "Cancelled" } : b)));
      toast.warn("Booking canceled! ❌", { autoClose: 3000 }); // ✅ Toast on cancel
    } catch (error) {
      console.error("Error canceling booking:", error.response?.data);
      setError("Failed to cancel booking.");
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/confirm/${id}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookings(bookings.map((b) => (b.id === id ? { ...b, booking_status: "Confirmed" } : b)));
      toast.success("Booking confirmed! ✅", { autoClose: 3000 }); // ✅ Toast on confirm
    } catch (error) {
      console.error("Error confirming booking:", error.response?.data);
      setError("Failed to confirm booking.");
    }
  };

  return (
    <div className="manage-bookings-container">
      <div className="bookings-header">
        <h2 className="bookings-title">Manage Bookings</h2>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search bookings..."
            className="search-bar"
          />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Passenger</th>
              <th>Age</th>
              <th>Email</th>
              <th>Train</th>
              <th>Ticket</th>
              <th>Date</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.passenger_name}</td>
                <td>{booking.passenger_age || "N/A"}</td>
                <td>{booking.email || "No Email"}</td>
                <td>{booking.train_name || "Unknown Train"}</td>
                <td>{booking.ticket_number}</td>
                <td>{booking.travel_date}</td>
                <td>₹{booking.price}</td>
                <td>{booking.booking_status}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleConfirm(booking.id)} className="action-btn btn-confirm">
                      Confirm
                    </button>
                    <button onClick={() => handleCancel(booking.id)} className="action-btn btn-cancel">
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(booking.id)} className="action-btn btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageBookingAdmin;

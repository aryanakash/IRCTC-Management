import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/MyBookings.css';

const BOOKINGS_PER_PAGE = 5;

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelingTicket, setCancelingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ✅ Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    if (!user || !user.id) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bookings/${user.id}?page=${page}&limit=${BOOKINGS_PER_PAGE}`
      );

      console.log("📌 API Response:", res.data); // Debugging API response

      if (res.data.bookings) {
        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages || 1);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error("🚨 API Error:", err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ✅ Cancel booking using ticket_number
  const handleCancel = async () => {
    if (!selectedBooking) return;
    setCancelingTicket(selectedBooking.ticket_number);
    try {
      await axios.delete(`http://localhost:5000/api/bookings/cancel/${selectedBooking.ticket_number}`);
      toast.success('Booking cancelled');
      setModalOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error('Cancellation failed');
    } finally {
      setCancelingTicket(null);
    }
  };

  // ✅ Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) =>
      booking.train_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.travel_date.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOption === 'priceAsc') return a.price - b.price;
      if (sortOption === 'priceDesc') return b.price - a.price;
      if (sortOption === 'dateAsc') return a.travel_date.localeCompare(b.travel_date);
      return b.travel_date.localeCompare(a.travel_date);
    });

  return (
    <div className="booking-container">
      <h1 className="booking-title">My Bookings</h1>

      {/* ✅ Search and Sort Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by train or date"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="dateDesc">Date ↓</option>
          <option value="dateAsc">Date ↑</option>
          <option value="priceAsc">Price ↑</option>
          <option value="priceDesc">Price ↓</option>
        </select>
      </div>

      {/* ✅ Show Bookings */}
      {loading ? (
        <div className="spinner"></div>
      ) : filteredBookings.length === 0 ? (
        <p className="center-text">
          <span role="img" aria-label="folder">🗂️</span> No bookings found.
        </p>
      ) : (
        <div>
          <div className="booking-list">
            {filteredBookings.map((booking) => (
              <div key={booking.ticket_number} className="booking-card">
                <h2>{booking.train_name}</h2>
                <p>Ticket #: {booking.ticket_number}</p>

                {/* ✅ Ensure from_station and to_station are not missing */}
                <p>From: {booking.from_station || 'N/A'} ➡️ To: {booking.to_station || 'N/A'}</p>

                <p>Date: {booking.travel_date}</p>
                <p>Passenger: {booking.passenger_name} (Age: {booking.passenger_age})</p>
                <p>Price: ₹{booking.price}</p>
                <p>Status: <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span></p>
                
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setModalOpen(true);
                  }}
                  disabled={cancelingTicket === booking.ticket_number}
                >
                  {cancelingTicket === booking.ticket_number ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      )}

      {/* ✅ Cancellation Modal */}
      {modalOpen && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cancel Booking?</h2>
            <p>Train: {selectedBooking.train_name}</p>
            <p>Ticket #: {selectedBooking.ticket_number}</p>
            <p>Date: {selectedBooking.travel_date}</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleCancel}>Yes, Cancel</button>
              <button className="cancel-modal-btn" onClick={() => setModalOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

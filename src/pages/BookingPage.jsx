import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/BookingPage.css";

const BookingPage = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authToken } = useAuth();

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [journeyDate, setJourneyDate] = useState(location.state?.date || "");
  const [email, setEmail] = useState(user?.email || "");

  // 🚆 Fetch Train Data
  const fetchTrain = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/trains/${trainId}`);
      setTrain(response.data);
    } catch (err) {
      console.error("🚨 Error fetching train:", err);
      setError("Failed to load train details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [trainId]);

  useEffect(() => {
    fetchTrain();
  }, [fetchTrain]);

  // 🎟️ Handle Booking
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Authentication error! Please log in again.");
      navigate("/login");
      return;
    }

    if (!name || !age || !journeyDate || !email) {
      alert("All fields are required.");
      return;
    }

    const bookingDetails = {
      userId: user.id,
      trainId,
      passengerName: name,
      passengerAge: age,
      travelDate: journeyDate,
      email,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/bookings", bookingDetails, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("📩 Booking Response:", response.data); // ✅ Debugging Log

      // 🛠 Fix: Corrected ticketNumber field
      if (response.status === 201 && response.data.ticketNumber) {
        navigate("/confirmation", { 
          state: { 
            ...bookingDetails, 
            ticketNumber: response.data.ticketNumber, // ✅ Corrected
            trainName: train?.train_name // ✅ Passing train name for confirmation
          } 
        });
      } else {
        alert(response.data.error || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("🚨 Booking error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading train details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!train) return <div className="p-4">Train not found.</div>;

  return (
    <div className="booking-page">
      <h1 className="booking-header">Book Your Train Ticket</h1>
      <div className="train-info">
        <h2 className="train-name">{train.train_name}</h2>
        <div className="train-details">
          <p><strong>From:</strong> {train.source_station}</p>
          <p><strong>To:</strong> {train.destination_station}</p>
          <p><strong>Departure:</strong> {train.departure_time}</p>
          <p><strong>Price:</strong> ₹{train.price}</p>
        </div>
      </div>

      <form onSubmit={handleBooking} className="booking-form">
        <div className="form-group">
          <label>Passenger Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="1" max="120" required />
        </div>
        <div className="form-group">
          <label>Journey Date</label>
          <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="submit-btn">Confirm Booking</button>
      </form>
    </div>
  );
};

export default BookingPage;

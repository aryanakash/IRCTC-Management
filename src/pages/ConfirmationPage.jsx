import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/ConfirmationPage.css";

const ConfirmationPage = () => {
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [trainData, setTrainData] = useState(null);

  useEffect(() => {
    let data = location.state;
    console.log("🚀 Received location.state:", data);

    if (!data) {
      try {
        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        if (bookings.length > 0) data = bookings[bookings.length - 1];
      } catch (error) {
        console.error("❌ Error loading from localStorage:", error);
      }
    }

    console.log("✅ Final Booking Data:", data);
    if (data) {
      setBookingData(data);
      fetchTrainDetails(data.trainId);
    }
  }, [location.state]);

  const fetchTrainDetails = async (trainId) => {
    if (!trainId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/trains/${trainId}`);
      setTrainData(response.data);
    } catch (error) {
      console.error("🚨 Error fetching train details:", error);
    }
  };

  if (!bookingData) {
    return (
      <div className="no-data-container">
        <p>Loading booking details...</p>
      </div>
    );
  }

  // ✅ Ensuring `ticketNumber` exists
  const {
    passengerName,
    passengerAge,
    travelDate,
    ticketNumber = "N/A", // 👈 Default value to avoid "undefined"
  } = bookingData;

  const {
    train_name = "Unknown Train",
    source_station = "Unknown",
    destination_station = "Unknown",
    price = "N/A",
  } = trainData || {}; // 👈 Handle case where train data is missing

  return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h1 className="confirmation-title">Booking Confirmed! <span role="img" aria-label="checkmark">✅</span></h1>
        <div className="confirmation-details">
          <p><strong>Train:</strong> {train_name}</p>
          <p><strong>From:</strong> {source_station}</p>
          <p><strong>To:</strong> {destination_station}</p>
          <p><strong>Date:</strong> {travelDate}</p>
          <p><strong>Passenger:</strong> {passengerName} ({passengerAge} yrs)</p>
          <p><strong>Price:</strong> ₹{price}</p>
          <p><strong>Ticket Number:</strong> {ticketNumber}</p>
        </div>
        <div className="confirmation-btns">
          <Link to="/" className="confirmation-btn">Book Another Train</Link>
          <button onClick={() => window.print()} className="confirmation-btn print-btn">
            Print Ticket <span role="img" aria-label="printer">🖨️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;

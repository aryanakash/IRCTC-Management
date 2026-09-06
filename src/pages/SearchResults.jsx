import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchResults.css';
import { toast } from 'react-toastify';

const SearchResults = () => {
  const location = useLocation();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extract query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get('from');
  const to = queryParams.get('to');
  const date = queryParams.get('date');

  useEffect(() => {
    if (!from || !to || !date) {
      toast.error('Missing search parameters.');
      return;
    }

    const fetchTrains = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/trains/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
        );

        if (res.data.trains && res.data.trains.length > 0) {
          setTrains(res.data.trains);
        } else {
          toast.info('No trains found for your search.');
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        toast.error('Failed to fetch trains.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [from, to, date, setTrains]); // ✅ Ensure proper dependency handling

  return (
    <div className="results-container">
      <h1 className="results-title">
        Trains from <span className="highlight">{from}</span> ➡️ 
        <span className="highlight">{to}</span> on <span className="highlight">{date}</span>
      </h1>

      {loading ? (
        <div className="spinner"></div>
      ) : trains.length === 0 ? (
        <p className="no-results">No trains found.</p>
      ) : (
        <div className="train-list">
          {trains.map((train) => (
            <div key={train.id} className="train-card">
              <h2>{train.train_name}</h2>
              <p><strong>Departure:</strong> {train.departure_time}</p>
              <p><strong>Arrival:</strong> {train.arrival_time}</p>
              <p><strong>Price:</strong> ₹{train.price}</p>

              <Link to={`/book/${train.id}?date=${encodeURIComponent(date)}`}>
                <button className="book-btn">Book Now</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

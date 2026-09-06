import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchTrains.css';
import { toast } from 'react-toastify';

const stationList = ["Station A", "Station B", "Station C", "Station D"]; // Example stations

const SearchTrains = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim input to remove accidental spaces
    const formattedSource = source.trim();
    const formattedDestination = destination.trim();

    if (!formattedSource || !formattedDestination || !travelDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (formattedSource.toLowerCase() === formattedDestination.toLowerCase()) {
      toast.error('Source and Destination cannot be the same');
      return;
    }

    // ✅ Debugging log
    console.log(`Navigating to: /search?from=${formattedSource}&to=${formattedDestination}&date=${travelDate}`);

    // Navigate to search results page
    navigate(`/search?from=${encodeURIComponent(formattedSource)}&to=${encodeURIComponent(formattedDestination)}&date=${travelDate}`);
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Search Trains</h1>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label></label>
          <input
            type="text"
            list="stations"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Enter source station"
            spellCheck="true"
            autoComplete="off"
          />
          <datalist id="stations">
            {stationList.map((station, index) => (
              <option key={index} value={station} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label></label>
          <input
            type="text"
            list="stations"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination station"
            spellCheck="true"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label></label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Disable past dates
          />
        </div>

        <button type="submit" className="search-btn">Search Trains</button>
      </form>
    </div>
  );
};

export default SearchTrains;

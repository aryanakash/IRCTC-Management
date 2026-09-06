import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Home.css';

const popularRoutes = [
  {
    id: 1,
    name: 'Delhi to Mumbai',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    from: 'Delhi',
    to: 'Mumbai',
    duration: '15h 30m',
    price: 1200,
    trains: ['Rajdhani Express', 'Duronto Express']
  },
  {
    id: 2,
    name: 'Bangalore to Chennai',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    from: 'Bangalore',
    to: 'Chennai',
    duration: '6h 30m',
    price: 800,
    trains: ['Shatabdi Express', 'Double Decker']
  },
  {
    id: 3,
    name: 'Kolkata to Delhi',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    from: 'Kolkata',
    to: 'Delhi',
    duration: '17h 00m',
    price: 1500,
    trains: ['Howrah Rajdhani', 'Duronto Express']
  }
];

const Home = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to Search Results with query parameters
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Indian Railways</h1>
        <p className="hero-subtitle">
          Connecting India with comfort, safety, and punctuality
        </p>
      </section>

      <section className="search-section">
        <div className="search-box">
          <h2 className="search-title">Plan Your Journey</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="input-group">
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                  id="from"
                />
                <label htmlFor="from">From</label>
              </div>
              
              <div className="swap-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  id="to"
                />
                <label htmlFor="to">To</label>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group date-group">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  id="date"
                />
                <label htmlFor="date">Journey Date</label>
              </div>

              <button type="submit" className="search-btn">
                Search Trains <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="popular-routes">
        <h2 className="routes-title">Popular Routes</h2>
        <div className="routes-grid">
          {popularRoutes.map(route => (
            <div key={route.id} className="route-card">
              <img src={route.image} alt={route.name} className="route-image" />
              <div className="route-content">
                <h3 className="route-name">{route.name}</h3>
                <p className="route-details">
                  <i className="fas fa-clock"></i> {route.duration}<br />
                  <i className="fas fa-train"></i> {route.trains.join(', ')}
                </p>
                <p className="route-price">
                  From ₹{route.price}
                </p>
                <Link 
                  to={`/search?from=${route.from}&to=${route.to}&date=${new Date().toISOString().split('T')[0]}`}
                  className="book-now-btn"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="features-section">
        <div className="feature-card">
          <i className="fas fa-ticket-alt feature-icon"></i>
          <h3 className="feature-title">Easy Booking</h3>
          <p className="feature-text">Book your tickets with just a few clicks</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-clock feature-icon"></i>
          <h3 className="feature-title">24/7 Service</h3>
          <p className="feature-text">Round the clock customer support</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-shield-alt feature-icon"></i>
          <h3 className="feature-title">Secure Payments</h3>
          <p className="feature-text">Safe and secure payment options</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

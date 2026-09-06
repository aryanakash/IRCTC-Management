import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { FiMenu, FiX, FiUser, FiSettings } from "react-icons/fi"; 
import "../styles/Navbar.css"; 
import logo from "../assets/IRCTC LOGO.png";  
import {jwtDecode} from "jwt-decode";

const Navbar = () => {
  const { user, logout, authToken } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        setUserName(decoded.name);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [authToken]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ✅ IRCTC Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="IRCTC Logo" className="logo-img" />
          IRCTC
        </Link>

        {/* ✅ Mobile Menu Icon */}
        <button className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* ✅ Navbar Links */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/search-trains" className="nav-link">Search Trains</NavLink>
          <NavLink to="/my-bookings" className="nav-link">My Bookings</NavLink>

          {user ? (
            user.is_admin ? (
              <>
                <NavLink to="/admin/dashboard" className="nav-link">
                  <FiSettings className="admin-icon" /> Admin Dashboard
                </NavLink>
                <button onClick={handleLogout} className="nav-link logout">Logout</button>
              </>
            ) : (
              <div className="dropdown">
                <button className="dropdown-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FiUser className="user-icon" />
                  <span>{userName || "User"}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiUser className="menu-icon" /> Profile
                    </NavLink>
                    <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                  </div>
                )}
              </div>
            )
          ) : (
            <>
              <NavLink to="/signup" className="nav-link">Signup</NavLink>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/admin/login" className="nav-link">Admin</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

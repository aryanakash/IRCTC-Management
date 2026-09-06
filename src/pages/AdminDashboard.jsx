import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TrainAdmin from "./TrainAdmin";
import ManageBookingAdmin from "./ManageBookingAdmin"; // ✅ Import ManageBookingAdmin
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { user, authToken, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [activeView, setActiveView] = useState("users"); // "users", "trains", "bookings"

  // ✅ Redirect if not admin or not logged in
  useEffect(() => {
    if (!authToken) {
      logout();
      navigate("/login");
    } else if (user && !user.is_admin) {
      navigate("/");
    }
  }, [user, authToken, navigate, logout]);

  // ✅ Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(res.data);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setError("Failed to fetch users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, logout, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ❌ Prevent Admin from Deleting Themselves
  const handleDeleteUser = async (id, name) => {
    if (id === user.id) {
      setError("🚨 You cannot delete your own account!");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // ✅ Remove deleted user from state instead of refetching
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
      setError("");
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2>IRCTC Admin</h2>
        <button 
          className={`nav-btn ${activeView === "users" ? "active" : ""}`} 
          onClick={() => setActiveView("users")}
        >
          <span role="img" aria-label="User">👤</span> Manage Users
        </button>
        <button 
          className={`nav-btn ${activeView === "trains" ? "active" : ""}`} 
          onClick={() => setActiveView("trains")}
        >
          <span role="img" aria-label="Train">🚆</span> Manage Trains
        </button>
        <button 
          className={`nav-btn ${activeView === "bookings" ? "active" : ""}`} 
          onClick={() => setActiveView("bookings")}
        >
          <span role="img" aria-label="Ticket">🎟️</span> Manage Bookings
        </button>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>Admin Dashboard</h1>
          {user && <p className="admin-email">Logged in as: {user.email}</p>}
        </div>

        {/* Display Errors if Any */}
        {error && <p className="error-message">{error}</p>}

        {/* Conditional Rendering based on activeView */}
        {activeView === "users" ? (
          <>
            {/* Dashboard Cards */}
            <div className="dashboard-cards">
              <div className="card">
                <h3>Total Users</h3>
                <p>{loading ? "Loading..." : users.length}</p>
              </div>
            </div>

            {/* User List Collapsible */}
            <div className="user-list">
              <h2 onClick={() => setShowUsers(!showUsers)} className="collapsible-header">
                User List {showUsers ? "▼" : "▶"}
              </h2>
              {showUsers && (
                <>
                  {loading ? (
                    <p>Loading users...</p>
                  ) : users.length === 0 ? (
                    <p>No users found.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="delete-btn"
                                disabled={u.id === user.id}
                                title={u.id === user.id ? "You cannot delete your own account!" : ""}
                              >
                                <span role="img" aria-label="delete">❌</span> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </>
        ) : activeView === "trains" ? (
          <div className="train-management-container">
            <TrainAdmin />
          </div>
        ) : (
          <div className="booking-management-container">
            <ManageBookingAdmin />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

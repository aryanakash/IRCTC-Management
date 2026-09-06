import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';
import SearchResults from './pages/SearchResults';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import SearchTrains from './pages/SearchTrains';
import AdminLogin from './pages/AdminLogin';  // ✅ Imported AdminLogin
import AdminDashboard from './pages/AdminDashboard';  // ✅ Imported AdminDashboard
import TrainAdmin from './pages/TrainAdmin';  // ✅ Import TrainAdmin component
import Profile from './pages/Profile';  // ✅ Import Profile component
import Navbar from './components/Navbar';  // ✅ Import Navbar component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './App.css';

const App = () => {
  return (
    <div className="app">
      <Navbar /> {/* ✅ Add Navbar component */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/book/:trainId" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/search-trains" element={<SearchTrains />} />
          
          {/* ✅ Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/trains" element={<TrainAdmin />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

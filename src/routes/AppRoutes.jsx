import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import MyBookings from '../pages/MyBookings';
import SearchResults from '../pages/SearchResults';
import BookingPage from '../pages/BookingPage';
import ConfirmationPage from '../pages/ConfirmationPage';
import SearchTrains from '../pages/SearchTrains';
import AdminLogin from '../pages/AdminLogin';  
import AdminDashboard from '../pages/AdminDashboard'; 
import TrainAdmin from '../pages/TrainAdmin'; 
import ManageBookingAdmin from "../pages/ManageBookingAdmin";
import Profile from '../pages/Profile';


const AppRoutes = () => (
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
    <Route path="/admin/train-admin" element={<TrainAdmin />} />
    <Route path="/admin/manage-bookings" element={<ManageBookingAdmin />} />
  </Routes>
);

export default AppRoutes;

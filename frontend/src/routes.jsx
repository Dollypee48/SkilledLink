import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
// import AdminDashboard from '../pages/admin/Dashboard';
// import ServiceSearch from './pages/ServiceSearch';
// import Booking from './pages/Booking';
// import Profile from './pages/Profile';
import useAuth from './hooks/useAuth';
import MyProfile from './pages/customer/Profile';
import FindArtisans from './pages/customer/FindArtisans';
import Bookings from './pages/customer/Bookings';
import Reviews from './pages/customer/ReviewsAndRatings';
import ReportIssue from './pages/customer/ReportIssue';
import MyJobs from './pages/artisan/MyJobs';
import ArtisanReviews from './pages/artisan/Reviews';
import ArtisanRequests from './pages/artisan/JobRequests';
import ArtisanProfileSettings from './pages/artisan/Profile';
import ArtisanReport from './pages/artisan/ReportIssues';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Login />;
  return children;
};

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
      <Route path="/browseArtisans" element={<ProtectedRoute><FindArtisans /></ProtectedRoute>} />
      <Route path="/my-booking" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/Review-Ratings" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/reportIssue" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
      <Route path="/artisan-dashboard" element={<ProtectedRoute><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/myJobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
      <Route path="/myReview" element={<ProtectedRoute><ArtisanReviews /></ProtectedRoute>} />
      <Route path="/jobRequest" element={<ProtectedRoute><ArtisanRequests /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ArtisanProfileSettings /></ProtectedRoute>} />
      <Route path="/artisan-report" element={<ProtectedRoute><ArtisanReport /></ProtectedRoute>} />
      {/* <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} /> */}
      {/* <Route path="/search" element={<ServiceSearch />} /> */}
      {/* <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
     */}
      {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
    </Routes>
  );
};

export default RoutesComponent;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ArtisanProvider } from "./context/ArtisanContext";
import { BookingProvider } from "./context/BookingContext";
import { IssueProvider } from "./context/IssueContext";

// Hooks
import useAuth from './hooks/useAuth';

// Public/Customer Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import FindArtisans from './pages/customer/FindArtisans';
import ArtisanDetail from './pages/customer/ArtisanDetail';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/Bookings'; 
import CustomerProfile from './pages/customer/Profile'; 
import CustomerReport from './pages/customer/ReportIssue';

// Artisan Pages
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import MyJobs from './pages/artisan/MyJobs';
import JobRequests from './pages/artisan/JobRequests';
import ArtisanMessages from './pages/artisan/Messages';
import ArtisanReviews from './pages/artisan/Reviews';
import ArtisanProfile from './pages/artisan/Profile'; 
import Subscription from './pages/artisan/Subscription'; 
import ArtisanReport from './pages/artisan/ReportIssues';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArtisans from './pages/admin/ManageArtisans';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import ManageReviews from './pages/admin/ManageReviews';
import ManageReports from './pages/admin/ManageReports';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

const RoutesComponent = () => {
  return (
    <Router>
      <AuthProvider>
        <ArtisanProvider>
          <BookingProvider>
            <IssueProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/artisans" element={<FindArtisans />} />
                <Route path="/artisan/:id" element={<ArtisanDetail />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/customer-bookings" element={<CustomerBookings />} />
                <Route path="/customer-profile" element={<CustomerProfile />} />
                <Route path="/customer-report" element={<CustomerReport />} />

                {/* Artisan Routes (Protected) */}
                <Route
                  path="/artisan-dashboard"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/myJobs"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <MyJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobRequest"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <JobRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/messages"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/myReview"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanProfile /> {/* Corrected to ArtisanProfile */}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <Subscription />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan-report"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanReport />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes (Protected) */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-artisans"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageArtisans />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-bookings"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-reviews"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageReports />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </IssueProvider>
          </BookingProvider>
        </ArtisanProvider>
      </AuthProvider>
    </Router>
  );
};

export default RoutesComponent;
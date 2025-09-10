// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Hooks
import { useAuth } from './context/AuthContext'; // Corrected import path

// Public/Customer Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyCode from './pages/auth/VerifyCode';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import FindArtisans from './pages/customer/FindArtisans';
import AllArtisans from './pages/AllArtisans';
import ArtisanDetail from './pages/customer/ArtisanDetail';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/Bookings';
import CustomerProfile from './pages/customer/Profile';
import CustomerReport from './pages/customer/ReportIssue';
import CustomerReviews from './pages/customer/ReviewsAndRatings'; 
import Services from './pages/Services'; // New: Import Services page
import HowItWorks from './pages/HowItWorks'; // New: Import HowItWorks page
import AboutUs from './pages/AboutUs'; // New: Import AboutUs page
import CustomerSettings from './pages/customer/SettingsPage'; // Updated: Import SettingsPage
import MessagesPage from './pages/MessagesPage'; // New: Import MessagesPage

// Artisan Pages
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import MyJobs from './pages/artisan/MyJobs';
import JobRequests from './pages/artisan/JobRequests';
import ArtisanReviews from './pages/artisan/Reviews';
import ArtisanProfile from './pages/artisan/Profile';
import ArtisanSettings from './pages/artisan/SettingsPage'; // Updated: Import SettingsPage
import Subscription from './pages/artisan/Subscription';
import ArtisanReport from './pages/artisan/ReportIssues';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArtisans from './pages/admin/ManageArtisans';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import ManageReviews from './pages/admin/ManageReviews';
import ManageReports from './pages/admin/ManageReports';
import KYCVerification from './pages/admin/KYCVerification'; // New: Import KYCVerification
import KYCPage from './pages/KYCPage'; // Import the new KYCPage

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/find-artisans" element={<AllArtisans />} />
      <Route path="/artisans" element={<FindArtisans />} /> {/* New: Add /artisans route for compatibility */}
      <Route path="/artisan/:id" element={<ArtisanDetail />} />
      <Route path="/services" element={<Services />} /> {/* New: Services page */}
      <Route path="/how-it-works" element={<HowItWorks />} /> {/* New: How It Works page */}
      <Route path="/about" element={<AboutUs />} /> {/* New: About Us page */}
      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      <Route path="/customer-bookings" element={<CustomerBookings />} />
      <Route
        path="/customer-profile"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-settings"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerSettings />
          </ProtectedRoute>
        }
      />
      <Route path="/customer-reviews" element={<CustomerReviews />} />
      <Route path="/customer-report" element={<CustomerReport />} />

      {/* Customer Messages Page Route */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute requiredRole="customer">
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      {/* Dynamic route for individual conversations - Customer */}
      <Route
        path="/messages/:otherUserId"
        element={
          <ProtectedRoute requiredRole="customer">
            <MessagesPage />
          </ProtectedRoute>
        }
      />

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
        path="/artisan-messages"
        element={
          <ProtectedRoute requiredRole="artisan">
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      {/* Dynamic route for individual conversations - Artisan */}
      <Route
        path="/artisan-messages/:otherUserId"
        element={
          <ProtectedRoute requiredRole="artisan">
            <MessagesPage />
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
        path="/artisan-profile"
        element={
          <ProtectedRoute requiredRole="artisan">
            <ArtisanProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan-settings"
        element={
          <ProtectedRoute requiredRole="artisan">
            <ArtisanSettings />
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
      <Route
        path="/admin/kyc-verification"
        element={
          <ProtectedRoute requiredRole="admin">
            <KYCVerification />
          </ProtectedRoute>
        }
      />

      {/* New KYC Page Route */}
      <Route
        path="/kyc-verification"
        element={
          <ProtectedRoute requiredRoles={['customer', 'artisan']}>
            <KYCPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default RoutesComponent;

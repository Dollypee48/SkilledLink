// frontend/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Assuming useAuth exists

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>; // Or a spinner/loader component
  }

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User is authenticated but doesn't have the required role, redirect to unauthorized page or home
    // For now, redirect to home. You might want a dedicated unauthorized page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React, { Component } from "react";
import RoutesComponent from "./routes";  // ✅ fixed import
import KYCReminderModal from "./components/KYCReminderModal"; // Import the KYC Reminder Modal
import Navbar from './components/common/Navbar';
import { useAuth } from './context/AuthContext'; // Import useAuth hook
import { useLocation } from 'react-router-dom'; // Import useLocation hook
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

// Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-500">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { isAuthenticated } = useAuth(); // Get authentication status
  const location = useLocation(); // Get current location
  const shouldShowNavbar = [
    '/',
    '/services',
    '/how-it-works',
    '/about',
  ].includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8FAFC]">
        {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar on specific public pages */}
        <RoutesComponent />  {/* ✅ use renamed component */}
      </div>
      <KYCReminderModal /> {/* Render the KYC Reminder Modal globally */}
      <ToastContainer /> {/* Toast notifications container */}
    </ErrorBoundary>
  );
};

export default App;

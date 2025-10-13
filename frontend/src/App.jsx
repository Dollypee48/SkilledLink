import React, { Component } from "react";
import RoutesComponent from "./routes";  // ✅ fixed import
import ProfileCompletionNotification from "./components/common/ProfileCompletionNotification"; // Import Profile Completion Notification
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
  const { isAuthenticated, profileCompletion, setProfileCompletion } = useAuth(); // Get authentication status and profile completion
  const location = useLocation(); // Get current location
  const shouldShowNavbar = [
    '/',
    '/services',
    '/how-it-works',
    '/about',
  ].includes(location.pathname);

  const handleDismissProfileNotification = () => {
    setProfileCompletion(null);
  };

  // Global error handler for unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      console.error('🚨 Promise:', event.promise);
      
      // Prevent the default browser behavior (which logs to console)
      event.preventDefault();
      
      // You can add additional error reporting here if needed
      // For example, send to error tracking service
    };

    const handleError = (event) => {
      console.error('🚨 Global Error:', event.error);
      console.error('🚨 Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8FAFC]">
        {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar on specific public pages */}
        <RoutesComponent />  {/* ✅ use renamed component */}
      </div>
      <ProfileCompletionNotification 
        profileCompletion={profileCompletion} 
        onDismiss={handleDismissProfileNotification}
      /> {/* Profile completion notification */}
      <ToastContainer /> {/* Toast notifications container */}
    </ErrorBoundary>
  );
};

export default App;

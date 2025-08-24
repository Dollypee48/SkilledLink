import React, { Component } from "react";
import RoutesComponent from "./routes";  // ✅ fixed import
import KYCReminderModal from "./components/KYCReminderModal"; // Import the KYC Reminder Modal

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
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <RoutesComponent />  {/* ✅ use renamed component */}
      </div>
      <KYCReminderModal /> {/* Render the KYC Reminder Modal globally */}
    </ErrorBoundary>
  );
};

export default App;

import React, { Component } from "react";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { ReportProvider } from "./context/ReportContext";
import { IssueProvider } from "./context/IssueContext";
import { ReviewProvider } from "./context/ReviewContext";
import { ArtisanProvider } from "./context/ArtisanContext"; // Ensure this matches the file
import Routes from "./routes";

// Error Boundary to catch rendering errors
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
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          {/* <ChatProvider> */}
            <BookingProvider>
              <ReportProvider>
                <IssueProvider>
                  <ReviewProvider>
                    <ArtisanProvider>
                      <div className="min-h-screen bg-gray-50">
                        <Routes />
                      </div>
                    </ArtisanProvider>
                  </ReviewProvider>
                </IssueProvider>
              </ReportProvider>
            </BookingProvider>
          {/* </ChatProvider> */}
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
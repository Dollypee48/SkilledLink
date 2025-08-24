import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ArtisanProvider } from './context/ArtisanContext';
import { BookingProvider } from './context/BookingContext';
import { ReviewProvider } from './context/ReviewContext';
import { ReportProvider } from './context/ReportContext';
import { IssueProvider } from './context/IssueContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> 
    <BrowserRouter>
      <AuthProvider>
        <ArtisanProvider>
          <BookingProvider>
            <ReviewProvider>
              <ReportProvider>
                <IssueProvider>
                  <App />
                </IssueProvider>
              </ReportProvider>
            </ReviewProvider>
          </BookingProvider>
        </ArtisanProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

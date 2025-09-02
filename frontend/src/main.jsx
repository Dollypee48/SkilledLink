import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ArtisanProvider } from './context/ArtisanContext';
import { BookingProvider } from './context/BookingContext';
import { ReviewProvider } from './context/ReviewContext';
import { ReportProvider } from './context/ReportContext';
import { IssueProvider } from './context/IssueContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> 
    <BrowserRouter>
      <AuthProvider>
        <MessageProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </MessageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

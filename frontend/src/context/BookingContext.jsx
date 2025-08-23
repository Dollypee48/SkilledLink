import React, { createContext, useContext, useState } from "react";
import { BookingService } from "../services/bookingService";
import useAuth from "../hooks/useAuth";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { accessToken } = useAuth(); // use accessToken from AuthContext
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to wrap API calls
  const handleRequest = async (callback) => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) {
        console.warn("Token missing:", { accessToken });
        throw new Error("Please log in to perform this action");
      }
      const result = await callback(accessToken);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations
  const createBooking = async (bookingData) => {
    const newBooking = await handleRequest(token =>
      BookingService.createBooking(bookingData, token)
    );
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const getBookings = async () => {
    const data = await handleRequest(token =>
      BookingService.getMyBookings(token)
    );
    setBookings(data);
    return data;
  };

  const viewBooking = async (id) =>
    await handleRequest(token => BookingService.getBookingById(id, token));

  const updateBookingStatus = async (id, status) => {
    const updated = await handleRequest(token =>
      BookingService.updateBookingStatus(id, status, token)
    );
    setBookings(prev => prev.map(b => (b._id === id ? updated : b)));
    return updated;
  };

  const deleteBooking = async (id) => {
    await handleRequest(token => BookingService.deleteBooking(id, token));
    setBookings(prev => prev.filter(b => b._id !== id));
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        createBooking,
        getBookings,
        viewBooking,
        updateBookingStatus,
        deleteBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within a BookingProvider");
  return context;
};

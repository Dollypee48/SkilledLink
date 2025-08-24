import React, { createContext, useContext, useState, useCallback } from "react";
import { BookingService } from "../services/bookingService";
import useAuth from "../hooks/useAuth";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { accessToken } = useAuth(); // use accessToken from AuthContext
  const [bookings, setBookings] = useState([]); // This will now hold ALL bookings fetched for the artisan
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback( // Memoize handleRequest
    async (callback) => {
      setLoading(true);
      setError(null);
      try {
        if (!accessToken) {
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
    },
    [accessToken] // Dependencies for handleRequest
  );

  const createBooking = useCallback( // Memoize createBooking
    async (bookingData) => {
      const newBooking = await handleRequest((token) =>
        BookingService.createBooking(bookingData, token)
      );
      setBookings((prev) => [...prev, newBooking]);
      return newBooking;
    },
    [handleRequest]
  );

  const getBookings = useCallback( // Memoize getBookings
    async () => {
      const data = await handleRequest((token) => BookingService.getMyBookings(token));
      setBookings(data);
      return data;
    },
    [handleRequest]
  );

  const fetchArtisanBookings = useCallback( // Memoize fetchArtisanBookings
    async () => {
      const data = await handleRequest((token) =>
        BookingService.getArtisanBookings(token)
      );
      setBookings(data);
      return data;
    },
    [handleRequest]
  );
  
  const viewBooking = useCallback( // Memoize viewBooking
    async (id) => await handleRequest((token) => BookingService.getBookingById(id, token)),
    [handleRequest]
  );

  const updateBookingStatus = useCallback( // Memoize updateBookingStatus
    async (id, status) => {
      const updated = await handleRequest((token) =>
        BookingService.updateBookingStatus(id, status, token)
      );
      setBookings((prev) => prev.map((b) => (b._id === id ? updated : b)));
      return updated;
    },
    [handleRequest]
  );

  const deleteBooking = useCallback( // Memoize deleteBooking
    async (id) => {
      await handleRequest((token) => BookingService.deleteBooking(id, token));
      setBookings((prev) => prev.filter((b) => b._id !== id));
    },
    [handleRequest]
  );

  return (
    <BookingContext.Provider
      value={{
        artisanBookings: bookings, // Renamed 'bookings' to 'artisanBookings' for clarity in context
        loading,
        error,
        createBooking,
        getBookings,
        viewBooking,
        updateBookingStatus,
        deleteBooking,
        fetchArtisanBookings, // Exposed new function
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

import React, { createContext, useContext, useState, useCallback } from "react";
import { BookingService } from "../services/bookingService";
import useAuth from "../hooks/useAuth";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { accessToken } = useAuth(); // use accessToken from AuthContext
  const [bookings, setBookings] = useState([]); // This will now hold ALL bookings fetched for the artisan
  const [customerBookings, setCustomerBookings] = useState([]); // New state for customer bookings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // State for modal visibility
  const [selectedArtisan, setSelectedArtisan] = useState(null); // State for selected artisan

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
      // Add new booking to customerBookings if the current user is a customer
      // (Assuming the created booking is for the current customer)
      setCustomerBookings((prev) => [...prev, newBooking]); 
      return newBooking;
    },
    [handleRequest]
  );

  const getBookings = useCallback( // Memoize getBookings (for customers)
    async () => {
      const data = await handleRequest((token) => BookingService.getMyBookings(token));
      setCustomerBookings(data); // Set customer-specific bookings
      return data;
    },
    [handleRequest]
  );

  const fetchArtisanBookings = useCallback( // Memoize fetchArtisanBookings
    async () => {
      const data = await handleRequest((token) =>
        BookingService.getArtisanBookings(token)
      );
      setBookings(data); // This now explicitly sets artisan bookings
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
      setBookings((prev) => prev.map((b) => (b._id === id ? updated : b))); // Update artisan bookings
      setCustomerBookings((prev) => prev.map((b) => (b._id === id ? updated : b))); // Update customer bookings
      return updated;
    },
    [handleRequest]
  );

  const deleteBooking = useCallback( // Memoize deleteBooking
    async (id) => {
      await handleRequest((token) => BookingService.deleteBooking(id, token));
      setBookings((prev) => prev.filter((b) => b._id !== id)); // Filter artisan bookings
      setCustomerBookings((prev) => prev.filter((b) => b._id !== id)); // Filter customer bookings
    },
    [handleRequest]
  );

  const openBookingModal = useCallback(() => setIsBookingModalOpen(true), []);
  const closeBookingModal = useCallback(() => setIsBookingModalOpen(false), []);

  return (
    <BookingContext.Provider
      value={{
        artisanBookings: bookings, // Renamed 'bookings' to 'artisanBookings' for clarity in context
        customerBookings,
        loading,
        error,
        createBooking,
        getBookings,
        viewBooking,
        updateBookingStatus,
        deleteBooking,
        fetchArtisanBookings,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        selectedArtisan,
        setSelectedArtisan,
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

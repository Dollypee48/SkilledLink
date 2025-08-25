import React, { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import { useBooking } from "../../context/BookingContext"; // use custom hook
import { useAuth } from "../../context/AuthContext";

const Bookings = () => {
  const [sortBy, setSortBy] = useState("date");
  const { accessToken } = useAuth(); // Get accessToken from AuthContext

  const { customerBookings, loading, error, getBookings, viewBooking } = useBooking();

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (accessToken) { // Only fetch if accessToken is available
          await getBookings(); // This now fetches customer bookings
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };
    fetchBookings();
  }, [getBookings, accessToken]); // Add accessToken to dependencies

  const sortedBookings = [...customerBookings].sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = async (id) => {
    try {
      const booking = await viewBooking(id);
      // For now just log, replace with modal or navigation
      console.log("Booking details:", booking);
    } catch (err) {
      console.error("Failed to view booking:", err);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <div className="flex items-center gap-3 mb-6">
          <CalendarCheck className="w-8 h-8 text-[#6b2d11]" />
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Manage your booking history and upcoming appointments.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#6b2d11]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Booking History</h2>
          {loading ? (
            <p className="text-gray-600">Loading bookings...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : sortedBookings.length === 0 ? (
            <p className="text-gray-600">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Artisan</th>
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Service</th>
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Date</th>
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Time</th>
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Status</th>
                    <th className="p-3 text-sm font-medium text-[#6b2d11]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-sm text-gray-600">
                        {booking.artisan?.name || "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{booking.service}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {booking.time || "N/A"}
                      </td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <button
                          className="px-4 py-1 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow-md transition"
                          onClick={() => handleView(booking._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Bookings;

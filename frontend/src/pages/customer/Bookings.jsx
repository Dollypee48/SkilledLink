import React, { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import CustomerLayout from "../../components/common/Layouts/customerLayout";
import { useBooking } from "../../context/BookingContext"; // use custom hook
import { useAuth } from "../../context/AuthContext";
import BookingDetailsModal from "../../components/customer/BookingDetailsModal"; // Import the new modal

const Bookings = () => {
  const [sortBy, setSortBy] = useState("date");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedBooking, setSelectedBooking] = useState(null); // State to store booking details for the modal
  const { accessToken } = useAuth(); // Get accessToken from AuthContext

  const { 
    customerBookings, 
    customerServiceProfileBookings, 
    loading, 
    error, 
    getBookings, 
    fetchCustomerServiceProfileBookings,
    viewBooking 
  } = useBooking();

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (accessToken) { // Only fetch if accessToken is available
          await getBookings(); // This fetches regular customer bookings
          if (fetchCustomerServiceProfileBookings) {
            await fetchCustomerServiceProfileBookings(); // This fetches service profile bookings
          }
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };
    fetchBookings();
  }, [getBookings, fetchCustomerServiceProfileBookings, accessToken]); // Add fetchCustomerServiceProfileBookings to dependencies

  // Combine both types of bookings
  const allBookings = [
    ...(customerBookings || []).map(booking => ({ ...booking, type: 'regular' })),
    ...(customerServiceProfileBookings || []).map(booking => ({ ...booking, type: 'serviceProfile' }))
  ];

  const sortedBookings = [...allBookings].sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted": // New: For accepted bookings, show as In Progress
        return "bg-blue-100 text-blue-800";
      case "Pending Confirmation":
        return "bg-orange-100 text-orange-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = async (id) => {
    try {
      const booking = await viewBooking(id);
      setSelectedBooking(booking); // Set the fetched booking details
      setIsModalOpen(true); // Open the modal
    } catch (err) {
      console.error("Failed to view booking:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 text-[#151E3D]">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <CalendarCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#151E3D]" />
          <h1 className="text-2xl sm:text-3xl font-bold">My Bookings</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Manage your booking history and upcoming appointments.
        </p>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-[#151E3D]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D] text-sm sm:text-base"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Booking History</h2>
          {loading ? (
            <p className="text-gray-600">Loading bookings...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : sortedBookings.length === 0 ? (
            <p className="text-gray-600">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Artisan</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Service</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Type</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Date</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Time</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Status</th>
                    <th className="p-3 text-sm font-medium text-[#151E3D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm text-gray-600">
                        {booking.artisan?.name || "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{booking.service || booking.serviceName}</td>
                      <td className="p-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.type === 'serviceProfile' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.type === 'serviceProfile' ? 'Service' : 'Regular'}
                        </span>
                      </td>
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
                          {booking.status === 'Accepted' ? 'In Progress' : 
                           booking.status === 'Pending Confirmation' ? 'Pending Confirmation' : 
                           booking.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <button
                          className="px-4 py-1 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold shadow-md transition"
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
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          booking={selectedBooking}
        />
      )}
    </CustomerLayout>
  );
};

export default Bookings;

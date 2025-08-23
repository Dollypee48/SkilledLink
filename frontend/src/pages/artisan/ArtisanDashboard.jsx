import React from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { Wallet, CalendarCheck, Star } from "lucide-react";

const ArtisanDashboard = () => {
  // Dummy data (replace with API later)
  const totalEarnings = 120000;
  const pendingBookings = 3;
  const completedBookings = 8;
  const artisanProfile = {
    name: "John Doe",
    role: "Plumber",
    rating: 4.5,
  };
  const bookings = [
    {
      id: 1,
      date: "2025-08-10",
      service: "Pipe Repair",
      status: "Completed",
      price: 20000,
    },
    {
      id: 2,
      date: "2025-08-12",
      service: "Tap Installation",
      status: "Pending",
      price: 10000,
    },
    {
      id: 3,
      date: "2025-08-15",
      service: "Bathroom Renovation",
      status: "Cancelled",
      price: 50000,
    },
  ];

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Artisan Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Earnings */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-semibold text-gray-900">
                  ₦{totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Bookings</p>
                <p className="text-xl font-semibold text-gray-900">
                  {pendingBookings}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Bookings</p>
                <p className="text-xl font-semibold text-gray-900">
                  {completedBookings}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Profile Overview
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {artisanProfile.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-md font-medium text-gray-900">
                {artisanProfile.name || "Artisan Name"}
              </p>
              <p className="text-sm text-gray-600">
                {artisanProfile.role || "Role Not Set"}
              </p>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">
                  {artisanProfile.rating || "0.0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Booking History
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings available.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Service</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-gray-600">{booking.date}</td>
                    <td className="p-3 text-gray-600">
                      Customer {booking.id}
                    </td>
                    <td className="p-3 text-gray-600">{booking.service}</td>
                    <td className="p-3">
                      {booking.status === "Completed" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Completed
                        </span>
                      )}
                      {booking.status === "Pending" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      )}
                      {booking.status === "Cancelled" && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">
                      ₦{booking.price?.toLocaleString() || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanDashboard;

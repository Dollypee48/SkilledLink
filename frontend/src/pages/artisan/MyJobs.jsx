import React, { useState } from "react";
import { CalendarCheck, CheckCircle, Clock, RefreshCw, Eye } from "lucide-react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";

const MyJobs = () => {
  const [filterStatus, setFilterStatus] = useState("all");

  // Example data (replace with API data)
  const bookings = [
    { id: "JOB-001", customer: "John Doe", service: "Plumbing", date: "2025-08-10", status: "Completed" },
    { id: "JOB-002", customer: "Jane Smith", service: "Electrical Repair", date: "2025-08-12", status: "Pending" },
    { id: "JOB-003", customer: "David Lee", service: "Painting", date: "2025-08-15", status: "Cancelled" },
  ];

  const filteredBookings =
    filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus);

  const completedJobs = bookings.filter((b) => b.status === "Completed").length;
  const pendingJobs = bookings.filter((b) => b.status === "Pending").length;

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Jobs Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-xl font-semibold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Jobs</p>
                <p className="text-xl font-semibold text-gray-900">{completedJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Jobs</p>
                <p className="text-xl font-semibold text-gray-900">{pendingJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Job List</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No jobs available.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700">
                  <th className="p-3 font-medium">Job ID</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Service</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-gray-600">{booking.id}</td>
                    <td className="p-3 text-gray-600">{booking.customer}</td>
                    <td className="p-3 text-gray-600">{booking.service}</td>
                    <td className="p-3 text-gray-600">{booking.date}</td>
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
                    <td className="p-3">
                      <button
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                        onClick={() => alert(`Viewing details for ${booking.id}`)}
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
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

export default MyJobs; 

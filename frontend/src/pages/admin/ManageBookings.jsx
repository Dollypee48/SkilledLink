// frontend/src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ManageBookings = () => {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await adminService.getAllBookings(accessToken);
        setBookings(data);
      } catch (err) {
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [accessToken]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Bookings</h1>
        
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Booking ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Artisan</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{booking._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{booking.customer?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{booking.artisan?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{booking.serviceDetails?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">${booking.price?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      {/* Add more actions like update status if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageBookings;
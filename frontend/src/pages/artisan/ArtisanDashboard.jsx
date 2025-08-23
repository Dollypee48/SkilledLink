// pages/ArtisanDashboard.jsx
import React, { useEffect } from 'react';
import { ArtisanContext } from '../../context/ArtisanContext';
import  useAuth  from '../../hooks/useAuth';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout';
import { Wallet, CalendarCheck, Star } from 'lucide-react';

const ArtisanDashboard = () => {
  const { user } = useAuth();
  const { currentArtisan, fetchCurrentProfile, fetchBookings, bookings, loading, error } = useArtisan();
  const navigate = useNavigate();

  // Fetch artisan profile and bookings on mount
  useEffect(() => {
    if (user?.role === 'artisan') {
      fetchCurrentProfile();
      fetchBookings();
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, fetchCurrentProfile, fetchBookings, navigate]);

  // Calculate summary stats from bookings
  const totalEarnings = bookings?.reduce((sum, booking) => {
    return booking.status === 'Completed' ? sum + (booking.price || 0) : sum;
  }, 0) || 0;
  const pendingBookings = bookings?.filter((booking) => booking.status === 'Pending').length || 0;
  const completedBookings = bookings?.filter((booking) => booking.status === 'Completed').length || 0;

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Artisan Dashboard</h1>

        {/* Loading State */}
        {loading && <p className="text-gray-600">Loading dashboard...</p>}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* Summary Cards */}
        {!loading && !error && (
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
                  <p className="text-xl font-semibold text-gray-900">{pendingBookings}</p>
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
                  <p className="text-xl font-semibold text-gray-900">{completedBookings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {!loading && !error && currentArtisan && (
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Overview</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {currentArtisan.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-md font-medium text-gray-900">
                  {currentArtisan.name || 'Artisan Name'}
                </p>
                <p className="text-sm text-gray-600">
                  {currentArtisan.artisanProfile?.service || 'Role Not Set'}
                </p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {currentArtisan.artisanProfile?.rating || '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking History */}
        {!loading && !error && (
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking History</h2>
            {bookings?.length === 0 ? (
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
                  {bookings?.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-gray-600">{booking.date}</td>
                      <td className="p-3 text-gray-600">{booking.customerName || `Customer ${booking.id}`}</td>
                      <td className="p-3 text-gray-600">{booking.service}</td>
                      <td className="p-3">
                        {booking.status === 'Completed' && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            Completed
                          </span>
                        )}
                        {booking.status === 'Pending' && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                            Pending
                          </span>
                        )}
                        {booking.status === 'Cancelled' && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        ₦{booking.price?.toLocaleString() || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanDashboard;
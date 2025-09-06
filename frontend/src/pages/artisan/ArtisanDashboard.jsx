// pages/ArtisanDashboard.jsx
import React, { useEffect } from 'react';
import { ArtisanContext } from '../../context/ArtisanContext';
import { useAuth } from '../../context/AuthContext';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout';
import { CalendarCheck, Star, AlertTriangle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PremiumFeatures from '../../components/PremiumFeatures';
// import KYCForm from '../../components/KYCForm'; // Removed KYCForm import

const ArtisanDashboard = () => {
  const { user } = useAuth();
  const { profile: currentArtisan, loadProfile: fetchCurrentProfile, fetchBookings, bookings, loading, error } = React.useContext(ArtisanContext);
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
  const pendingBookings = bookings?.filter((booking) => booking.status === 'Pending').length || 0;
  const completedBookings = bookings?.filter((booking) => booking.status === 'Completed').length || 0;

  const getKYCStatusDisplay = () => {
    if (!user) return null;

    let statusText = "";
    let statusColor = "";
    let statusIcon = null;

    switch (user.kycStatus) {
      case 'pending':
        statusText = 'Your KYC is under review.';
        statusColor = 'bg-yellow-100 text-yellow-800';
        statusIcon = <Clock className="w-5 h-5 mr-2" />;
        break;
      case 'approved':
        statusText = 'Your KYC has been approved!';
        statusColor = 'bg-green-100 text-green-800';
        statusIcon = <ShieldCheck className="w-5 h-5 mr-2" />;
        break;
      case 'rejected':
        statusText = 'Your KYC submission was rejected. Please re-submit.';
        statusColor = 'bg-red-100 text-red-800';
        statusIcon = <XCircle className="w-5 h-5 mr-2" />;
        break;
      default:
        statusText = 'KYC verification is required.';
        statusColor = 'bg-blue-100 text-blue-800';
        statusIcon = <AlertTriangle className="w-5 h-5 mr-2" />;
    }

    return (
      <div className={`p-3 rounded-md mb-4 flex items-center ${statusColor}`}>
        {statusIcon}
        <p className="text-sm font-medium">{statusText}</p>
      </div>
    );
  };

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* KYC Status Indicator */}
        {getKYCStatusDisplay()}

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
            {/* Active Bookings */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {bookings?.filter(b => b.status === 'Accepted' || b.status === 'Pending Confirmation').length || 0}
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
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                {currentArtisan.profileImageUrl ? (
                  <img
                    src={currentArtisan.profileImageUrl}
                    alt={currentArtisan.name || 'Artisan'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] flex items-center justify-center text-white font-bold text-xl ${
                    currentArtisan.profileImageUrl ? 'hidden' : 'flex'
                  }`}
                >
                  {currentArtisan.name?.charAt(0) || 'A'}
                </div>
              </div>
              <div>
                <p className="text-md font-medium text-gray-900">
                  {currentArtisan.name || 'Artisan Name'}
                </p>
                <p className="text-sm text-gray-600">
                  {currentArtisan.artisanProfile?.service || 'Role Not Set'}
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <div className="flex items-center space-x-1">
                      {Array(5).fill().map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(currentArtisan.artisanProfile?.rating || 0) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-yellow-700 ml-2">
                      {currentArtisan.artisanProfile?.rating ? currentArtisan.artisanProfile.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
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
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Service</th>
                    <th className="p-3 font-medium">Status</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {bookings?.map((booking) => (
                    <tr
                      key={booking._id || booking.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-gray-600">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {booking.customer?.name || booking.customerName || 'Customer'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {booking.service || 'N/A'}
                      </td>
                      <td className="p-3">
                        {booking.status === 'Completed' && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                            Completed
                          </span>
                        )}
                        {booking.status === 'Pending' && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                            Pending
                          </span>
                        )}
                        {booking.status === 'Accepted' && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                            In Progress
                          </span>
                        )}
                        {booking.status === 'Pending Confirmation' && (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                            Pending Confirmation
                          </span>
                        )}
                        {booking.status === 'Declined' && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                            Declined
                          </span>
                        )}
                        {booking.status === 'Cancelled' && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                            Cancelled
                          </span>
                        )}
                        {(!booking.status || booking.status === "") && (
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                            Unknown
                          </span>
                        )}
                      </td>
                                                                    
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Premium Features Section */}
        <div className="mb-6">
          <PremiumFeatures 
            isPremium={user?.isPremium || false} 
            premiumFeatures={user?.premiumFeatures} 
          />
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanDashboard;
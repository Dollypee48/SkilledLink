// pages/ArtisanDashboard.jsx
import React, { useEffect, useState } from 'react';
import { ArtisanContext } from '../../context/ArtisanContext';
import { useAuth } from '../../context/AuthContext';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout';
import { updateEarnings } from '../../services/artisanService';
import { 
  CalendarCheck, 
  Star, 
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtisanDashboard = () => {
  const { user, accessToken } = useAuth();
  const { profile: currentArtisan, loadProfile: fetchCurrentProfile, fetchBookings, bookings, loading, error } = React.useContext(ArtisanContext);
  const navigate = useNavigate();
  
  // Earnings state
  const [isEditingEarnings, setIsEditingEarnings] = useState(false);
  const [earningsInput, setEarningsInput] = useState('');
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsMessage, setEarningsMessage] = useState('');

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

  // Handle earnings input
  const handleEditEarnings = () => {
    setIsEditingEarnings(true);
    setEarningsInput(currentArtisan?.artisanProfile?.earnings?.toString() || '0');
    setEarningsMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditingEarnings(false);
    setEarningsInput('');
    setEarningsMessage('');
  };

  const handleSaveEarnings = async () => {
    try {
      setEarningsLoading(true);
      const earnings = parseFloat(earningsInput);
      
      if (isNaN(earnings) || earnings < 0) {
        setEarningsMessage('Please enter a valid positive number');
        return;
      }

      await updateEarnings(accessToken, earnings);
      setEarningsMessage('Earnings updated successfully!');
      setIsEditingEarnings(false);
      
      // Refresh profile to get updated earnings
      fetchCurrentProfile();
      
      // Clear message after 3 seconds
      setTimeout(() => setEarningsMessage(''), 3000);
    } catch (error) {
      console.error('Error updating earnings:', error);
      setEarningsMessage('Failed to update earnings. Please try again.');
    } finally {
      setEarningsLoading(false);
    }
  };


  return (
    <ArtisanLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {currentArtisan?.name || user?.name || 'Artisan'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your bookings and grow your business
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {bookings?.filter(b => b.status === 'Accepted' || b.status === 'Pending Confirmation').length || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    In Progress
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Pending Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pendingBookings}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Awaiting Response
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Completed Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {completedBookings}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Successfully done
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  {isEditingEarnings ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="number"
                        value={earningsInput}
                        onChange={(e) => setEarningsInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter earnings"
                        min="0"
                        step="0.01"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEarnings}
                          disabled={earningsLoading}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          {earningsLoading ? (
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₦{currentArtisan?.artisanProfile?.earnings?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="text-sm mr-1">₦</span>
                        Total Earnings
                      </p>
                    </div>
                  )}
                  {earningsMessage && (
                    <p className={`text-xs mt-2 ${earningsMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                      {earningsMessage}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  {isEditingEarnings ? (
                    <Edit3 className="w-6 h-6 text-green-600" />
                  ) : (
                    <span className="text-2xl font-bold text-green-600">₦</span>
                  )}
                </div>
              </div>
              {!isEditingEarnings && (
                <button
                  onClick={handleEditEarnings}
                  className="mt-3 w-full text-xs text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Update Earnings
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                    <button className="text-sm text-[#151E3D] hover:text-[#1E2A4A] font-medium flex items-center">
                      View all
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D]"></div>
                      <span className="ml-3 text-gray-600">Loading bookings...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium">{error}</p>
                    </div>
                  ) : bookings?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarCheck className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-6">Your bookings will appear here once customers start booking your services</p>
                      <button className="inline-flex items-center px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Service
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings?.slice(0, 5).map((booking) => (
                        <div key={booking._id || booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Users className="w-6 h-6 text-[#151E3D]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.service || "Service"}</h3>
                              <p className="text-sm text-gray-600">
                                {booking.customer?.name || booking.customerName || "Customer"} • {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {booking.status === 'Completed' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            )}
                            {booking.status === 'Pending' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                            {booking.status === 'Accepted' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                In Progress
                              </span>
                            )}
                            {booking.status === 'Pending Confirmation' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending Confirmation
                              </span>
                            )}
                            {booking.status === 'Declined' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Declined
                              </span>
                            )}
                            {booking.status === 'Cancelled' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancelled
                              </span>
                            )}
                            <button className="text-gray-400 hover:text-gray-600">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile & Quick Actions */}
            <div className="space-y-6">
              {/* Profile Overview */}
              {currentArtisan && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Overview</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
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
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {currentArtisan.name || 'Artisan Name'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {currentArtisan.artisanProfile?.service || 'Service Provider'}
                        </p>
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
                          <span className="text-sm font-medium text-gray-700 ml-2">
                            {currentArtisan.artisanProfile?.rating ? currentArtisan.artisanProfile.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{currentArtisan.location || 'Location not set'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{currentArtisan.phone || 'Phone not provided'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{currentArtisan.email || 'Email not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanDashboard;
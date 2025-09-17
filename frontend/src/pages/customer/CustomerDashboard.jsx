// frontend/src/pages/customer/CustomerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/common/Layouts/CustomerLayout";
import { 
  CalendarCheck, 
  Wallet, 
  Heart, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  ArrowRight,
  Plus,
  XCircle,
  Home,
  MapPin,
  Wrench,
  Award,
  Eye
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { ArtisanContext } from "../../context/ArtisanContext";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  
  // Destructure 'bookings' as 'myBookings' to avoid conflict and use the correct data for customers
  const { customerBookings, loading: bookingsLoading, error: bookingsError, getBookings } = useBooking();

  // Use ArtisanContext directly for suggestions
  const { suggestions, loadSuggestions } = useContext(ArtisanContext);

  const { user, accessToken } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [artisansError, setArtisansError] = useState(null);

  useEffect(() => {
    if (!hasFetched && user && accessToken) {
      // Fetch bookings for the customer
      // Ensure getBookings is called and error handled
      getBookings().catch((err) => {
        // Handle error silently or show user-friendly message
      });

      // Fetch suggested artisans
      setArtisansLoading(true);
      // Ensure loadSuggestions is called and error handled
      loadSuggestions().catch((err) => { // loadSuggestions in ArtisanContext no longer takes token as arg
          setArtisansError("Could not load artisans.");
        })
        .finally(() => setArtisansLoading(false));

      setHasFetched(true);
    }
  }, [getBookings, loadSuggestions, hasFetched, user, accessToken]); // Keep dependencies updated


  // Get bookings in progress (Accepted or Pending Confirmation)
  const bookingsInProgress = customerBookings?.filter((b) => 
    b.status === "Accepted" || b.status === "Pending Confirmation"
  ) || [];

  const inProgressBooking = bookingsInProgress[0] || {
    service: "No active bookings",
    date: "All services completed",
  };

  // Count total bookings made
  const totalBookings = customerBookings?.length || 0;

  const loading = bookingsLoading || artisansLoading;
  const error = bookingsError || artisansError;


  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#151E3D]/5">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Customer'}!
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Here's what's happening with your bookings today
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-[#151E3D] hover:bg-[#1E2A4A] text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                title="Go to Homepage"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Active Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {bookingsInProgress.length}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    In Progress
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
             </div>

            {/* Total Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
             <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalBookings}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
             </div>
           </div>

            {/* Completed Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {customerBookings?.filter(b => b.status === 'Completed').length || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Successfully done
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Favorite Artisans */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
            <div>
                  <p className="text-sm font-medium text-gray-600">Saved Artisans</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  <p className="text-xs text-pink-600 mt-1 flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    Favorites
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
          </div>
        </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
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
                  ) : customerBookings?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarCheck className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-6">Start by booking your first service with our skilled artisans</p>
                      <button className="inline-flex items-center px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerBookings?.slice(0, 5).map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <CalendarCheck className="w-6 h-6 text-[#151E3D]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.service || "Service"}</h3>
                              <p className="text-sm text-gray-600">
                                {booking.artisan?.name || "Artisan"} • {new Date(booking.date).toLocaleDateString() || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                        {booking.status === "Completed" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        )}
                        {booking.status === "Pending" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                        {booking.status === "Accepted" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                            In Progress
                          </span>
                        )}
                        {booking.status === "Pending Confirmation" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                            Pending Confirmation
                          </span>
                        )}
                        {booking.status === "Declined" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                            Declined
                          </span>
                        )}
                        {booking.status === "Cancelled" && (
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

            {/* Recommended Artisans */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recommended Artisans</h2>
                    <button 
                      onClick={() => navigate('/find-artisans')}
                      className="text-sm text-[#151E3D] hover:text-[#1E2A4A] font-medium flex items-center"
                    >
                      View all
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#151E3D]"></div>
                      <span className="ml-3 text-gray-600">Loading artisans...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  ) : suggestions?.filter(artisan => artisan.isPremium)?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No premium artisans available</h3>
                      <p className="text-gray-600 text-xs mb-4">Premium artisans will appear here when available</p>
                      <button 
                        onClick={() => navigate('/find-artisans')}
                        className="inline-flex items-center px-3 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors text-sm"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Find All Artisans
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestions?.filter(artisan => artisan.isPremium)?.slice(0, 4).map((artisan) => (
                        <div key={artisan._id} className="group p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 border border-yellow-200 hover:border-yellow-300">
                          <div className="flex items-start space-x-3">
                            {/* Premium Badge */}
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {artisan.name?.charAt(0) || artisan.artisanProfile?.name?.charAt(0) || "A"}
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                                <Award className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            
                            {/* Artisan Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                      {artisan.name || artisan.artisanProfile?.name || "Unknown Artisan"}
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                                      PREMIUM
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate flex items-center mt-1">
                                    <Wrench className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {artisan.artisanProfile?.service || "Service Provider"}
                                  </p>
                                  
                                  {/* Rating */}
                                  <div className="flex items-center mt-2">
                                    <div className="flex items-center space-x-1">
                                      {Array(5).fill().map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < Math.floor(artisan.artisanProfile?.averageRating || 0) 
                                              ? "text-yellow-400 fill-current" 
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600 ml-2">
                                      {artisan.artisanProfile?.averageRating ? artisan.artisanProfile.averageRating.toFixed(1) : '0.0'}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({artisan.artisanProfile?.totalReviews || 0} reviews)
                                    </span>
                                  </div>

                                  {/* Location */}
                                  {artisan.state && (
                                    <div className="flex items-center mt-1">
                                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-600">{artisan.state}, Nigeria</span>
                                    </div>
                                  )}

                                  {/* Experience */}
                                  {artisan.artisanProfile?.experience && (
                                    <div className="flex items-center mt-1">
                                      <Award className="w-3 h-3 text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-600">
                                        {artisan.artisanProfile.experience} years experience
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 ml-3">
                                  <button 
                                    onClick={() => navigate(`/artisan/${artisan._id}`)}
                                    className="p-2 text-gray-400 hover:text-[#151E3D] hover:bg-white rounded-lg transition-all duration-200"
                                    title="View Profile"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => navigate(`/find-artisans?artisan=${artisan._id}`)}
                                    className="p-2 text-gray-400 hover:text-[#151E3D] hover:bg-white rounded-lg transition-all duration-200"
                                    title="Book Service"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Skills */}
                              {artisan.artisanProfile?.skills && artisan.artisanProfile.skills.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {artisan.artisanProfile.skills.slice(0, 3).map((skill, index) => (
                                      <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#151E3D]/10 text-[#151E3D]"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {artisan.artisanProfile.skills.length > 3 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        +{artisan.artisanProfile.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hourly Rate */}
                              {artisan.artisanProfile?.hourlyRate && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-green-600">
                                    ₦{artisan.artisanProfile.hourlyRate}/hour
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
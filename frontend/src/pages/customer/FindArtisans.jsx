// src/pages/customer/FindArtisans.jsx
import React, { useState, useEffect } from "react";
import { Search, Eye, Star, Crown } from "lucide-react";
import CustomerLayout from "../../components/common/Layouts/customerLayout";
import { ArtisanContext } from "../../context/ArtisanContext";
import { useContext } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingContext } from '../../context/BookingContext'; // Import BookingContext
import { ReviewContext } from '../../context/ReviewContext'; // Import ReviewContext
import { ReviewService } from '../../services/reviewService'; // Import ReviewService
import BookingModal from '../../components/BookingModal'; // Import BookingModal
import PremiumBadge from '../../components/PremiumBadge';
import { useAuth } from '../../context/AuthContext';
import ProfilePictureModal from '../../components/common/ProfilePictureModal';

const FindArtisans = () => {
  const { artisans, searchArtisans, loading, error } = useContext(ArtisanContext); // ✅ use context directly
  const { openBookingModal, setSelectedArtisan } = useContext(BookingContext); // Use BookingContext
  const { getArtisanReviews } = useContext(ReviewContext); // Use ReviewContext
  const { user } = useAuth(); // Get user from AuthContext
  const locationHook = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(locationHook.search);

  const [searchTerm, setSearchTerm] = useState(query.get('search') || "");
  const [location, setLocation] = useState(query.get('location') || "");
  const [service, setService] = useState(query.get('service') || "");
  const [selectedArtisanProfile, setSelectedArtisanProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [selectedProfileName, setSelectedProfileName] = useState(null);
  const [artisanReviews, setArtisanReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Comprehensive list of Nigerian states
  const nigerianStates = [
    'All Locations',
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Comprehensive list of artisan services
  const services = [
    'All Services',
    'Plumber', 'Tailor', 'Mechanic', 'Painter', 'Graphics Designer',
    'Electrician', 'Carpenter', 'Welder', 'Mason', 'Tiler',
    'AC Technician', 'Generator Repair', 'Phone Repair', 'Computer Repair',
    'Hair Stylist', 'Makeup Artist', 'Photographer', 'Videographer',
    'Interior Designer', 'Landscaper', 'Security Guard', 'Driver',
    'Cleaner', 'Cook', 'Nanny', 'Tutor', 'Translator',
    'Event Planner', 'DJ', 'Musician', 'Artist', 'Writer',
    'Web Developer', 'Mobile App Developer', 'Data Analyst',
    'Accountant', 'Lawyer', 'Consultant', 'Coach', 'Trainer'
  ];

  // Calculate average rating from reviews
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return totalRating / reviews.length;
  };

  // Fetch artisans on filter change
  useEffect(() => {
    searchArtisans({ search: searchTerm, location, service });
  }, [searchTerm, location, service, searchArtisans]);

  // Debug: Log artisans data when it changes
  useEffect(() => {
    console.log('Artisans data updated:', artisans);
  }, [artisans]);

  const handleBookNow = (artisan) => {
    if (!artisan || !artisan._id) {
      return;
    }

    // Check KYC verification status
    if (!user?.kycVerified || user?.kycStatus !== 'approved') {
      alert('KYC verification required to book services. Please complete your identity verification first.');
      navigate('/customer-settings');
      return;
    }

    setSelectedArtisan(artisan);
    openBookingModal();
  };

  const handleViewProfile = async (artisan) => {
    if (!artisan || !artisan._id) {
      return;
    }
    
    setSelectedArtisanProfile(artisan);
    setShowProfileModal(true);
    
    // Fetch artisan reviews
    try {
      setReviewsLoading(true);
      const reviews = await ReviewService.getPublicArtisanReviews(artisan._id);
      setArtisanReviews(reviews);
    } catch (error) {
      setArtisanReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedArtisanProfile(null);
    setArtisanReviews([]); // Clear reviews when modal is closed
  };

  const handleProfilePictureClick = (imageUrl, name) => {
    setSelectedProfileImage(imageUrl);
    setSelectedProfileName(name);
    setShowProfilePictureModal(true);
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 text-[#151E3D]">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Find Artisans</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Discover skilled professionals near you for any service.</p>
        
        {/* Rating Summary Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-base sm:text-lg font-semibold text-yellow-700">Top-Rated Artisans</span>
            </div>
            <div className="text-xs sm:text-sm text-yellow-600 text-center">
              All artisans are verified and rated by customers
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D] pl-10"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
            >
              {nigerianStates.map((state) => (
                <option key={state} value={state === 'All Locations' ? '' : state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
            >
              {services.map((svc) => (
                <option key={svc} value={svc === 'All Services' ? '' : svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Artisans List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Available Artisans</h2>
            {!loading && !error && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {(artisans || []).length} {(artisans || []).length === 1 ? 'artisan' : 'artisans'} found
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D] mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for artisans...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => searchArtisans({ search: searchTerm, location, service })}
                className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (artisans || []).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600 mb-4">No artisans found matching your criteria.</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(artisans || []).filter(artisan => artisan && artisan._id).map((artisan) => (
                <div key={artisan._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-[#151E3D]/30 group">
                  
                  {/* Header with Profile Image & Basic Info */}
                  <div className="flex items-start space-x-4 mb-5">
                    <div className="relative flex-shrink-0">
                      {artisan?.profileImageUrl ? (
                        <img
                          src={artisan.profileImageUrl}
                          alt={artisan.name || 'Artisan'}
                          className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {artisan?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                      {/* Availability Dot */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        artisan?.availability ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {artisan?.name || 'Artisan Name'}
                        </h3>
                        {artisan?.isPremium && (
                          <PremiumBadge size="sm" variant="default" showText={false} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {artisan?.artisanProfile?.service || artisan?.service || 'Professional Service'}
                      </p>
                      {artisan?.isPremium && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium Artisan
                          </span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {artisan?.address && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="font-medium truncate">{artisan.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating & Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {Array(5).fill().map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(artisan?.rating || 0) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {artisan?.rating ? `${artisan.rating.toFixed(1)}` : '0.0'}
                      </span>
                      <span className="text-xs text-gray-400">/ 5</span>
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      artisan?.availability 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {artisan?.availability ? 'Available' : 'Busy'}
                    </div>
                  </div>



                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <button
                      onClick={() => handleViewProfile(artisan)}
                      className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-300 flex items-center justify-center border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </button>
                    
                    <button
                      className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        artisan?.availability
                          ? 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white focus:ring-[#151E3D]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed focus:ring-gray-300'
                      }`}
                      onClick={() => handleBookNow(artisan)}
                      disabled={!artisan?.availability}
                    >
                      {artisan?.availability ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unavailable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedArtisanProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#151E3D]">Artisan Profile</h2>
                    <p className="text-xs text-gray-500">Professional information</p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Profile Header Section */}
              <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] rounded-xl p-5 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-5">
                  {/* Profile Image */}
                  <div 
                    className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleProfilePictureClick(selectedArtisanProfile.profileImageUrl, selectedArtisanProfile.name)}
                  >
                    {selectedArtisanProfile.profileImageUrl ? (
                      <img
                        src={selectedArtisanProfile.profileImageUrl}
                        alt={selectedArtisanProfile.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-3xl font-bold text-[#151E3D]">
                          {selectedArtisanProfile.name?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}
                    {/* Availability Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center ${
                      selectedArtisanProfile.availability 
                        ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedArtisanProfile.availability ? 'bg-green-100' : 'bg-red-100'
                      }`}></div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-[#151E3D] mb-2">
                      {selectedArtisanProfile.name || 'Name not provided'}
                    </h3>
                    <p className="text-lg text-gray-600 mb-3">
                      {selectedArtisanProfile.service || selectedArtisanProfile.artisanProfile?.service || 'Service not specified'}
                    </p>
                    


                    {/* Location */}
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {(() => {
                          // Handle location object structure - prioritize address
                          if (selectedArtisanProfile.location && typeof selectedArtisanProfile.location === 'object') {
                            const { state, city, address } = selectedArtisanProfile.location;
                            if (address && address.trim() !== '') {
                              return address;
                            } else if (city && city.trim() !== '') {
                              return `${city}${state ? `, ${state}` : ''}`;
                            } else if (state && state.trim() !== '') {
                              return `${state} State`;
                            }
                          }
                          
                          // Fallback to user's address/state if location object is empty - prioritize address
                          if (selectedArtisanProfile.address && selectedArtisanProfile.address.trim() !== '') {
                            return selectedArtisanProfile.address;
                          }
                          if (selectedArtisanProfile.state && selectedArtisanProfile.state.trim() !== '') {
                            return `${selectedArtisanProfile.state} State`;
                          }
                          
                          return 'Location not specified';
                        })()}
                      </span>
                    </div>

                    {/* Simple Rating Display */}
                    <div className="flex items-center justify-center md:justify-start space-x-2 mt-3">
                      <div className="flex items-center space-x-1">
                        {Array(5).fill().map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(calculateAverageRating(artisanReviews)) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {calculateAverageRating(artisanReviews).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-[#151E3D]">Contact Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedArtisanProfile.phone || selectedArtisanProfile.artisanProfile?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtisanProfile.email || selectedArtisanProfile.artisanProfile?.email || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Full Address</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtisanProfile.address || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Professional Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-[#151E3D]">Professional Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2V6" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtisanProfile.experience || selectedArtisanProfile.artisanProfile?.experience || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Nationality</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtisanProfile.nationality || selectedArtisanProfile.artisanProfile?.nationality || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtisanProfile.state || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Verification Status</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedArtisanProfile.kycVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedArtisanProfile.kycVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-[#151E3D]">Customer Reviews & Ratings</h4>
                </div>
                
                {/* Rating Summary */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {Array(5).fill().map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.floor(calculateAverageRating(artisanReviews)) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#151E3D]">
                          {calculateAverageRating(artisanReviews).toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {artisanReviews.length > 0 ? `${calculateAverageRating(artisanReviews).toFixed(1)}/5 stars` : 'No ratings yet'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Reviews</p>
                      <p className="text-xl font-semibold text-[#151E3D]">
                        {artisanReviews.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D] mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                  </div>
                ) : artisanReviews.length > 0 ? (
                  <div className="space-y-4">
                    {artisanReviews.slice(0, 5).map((review, index) => (
                      <div
                        key={review._id || index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                              {review.customerId?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.customerId?.name || 'Anonymous Customer'}
                              </p>
                              <div className="flex items-center space-x-1">
                                {Array(5).fill().map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">{review.rating}/5</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {review.date ? new Date(review.date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm italic">
                          "{review.comment || 'No comment provided'}"
                        </p>
                        {review.bookingId?.service && (
                          <p className="text-xs text-gray-500 mt-2">
                            Service: {review.bookingId.service}
                          </p>
                        )}
                      </div>
                    ))}
                    {artisanReviews.length > 5 && (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-500">
                          Showing 5 of {artisanReviews.length} reviews
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to review this artisan!</p>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {(selectedArtisanProfile.bio || selectedArtisanProfile.artisanProfile?.bio) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-[#151E3D]">About Me</h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F59E0B]">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedArtisanProfile.bio || selectedArtisanProfile.artisanProfile?.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {(selectedArtisanProfile.skills && selectedArtisanProfile.skills.length > 0) || (selectedArtisanProfile.artisanProfile?.skills && selectedArtisanProfile.artisanProfile.skills.length > 0) ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-[#151E3D]">Skills & Expertise</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(selectedArtisanProfile.skills || selectedArtisanProfile.artisanProfile?.skills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-2 rounded-full text-sm font-semibold border border-[#D97706] shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeProfileModal();
                    handleBookNow(selectedArtisanProfile);
                  }}
                  disabled={!selectedArtisanProfile.availability}
                  className={`flex-1 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedArtisanProfile.availability
                      ? 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-[#151E3D]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
                  }`}
                >
                  {selectedArtisanProfile.availability ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Book This Artisan</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Currently Unavailable</span>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={closeProfileModal}
                  className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal /> {/* Render the BookingModal here */}

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        imageUrl={selectedProfileImage}
        alt={selectedProfileName || 'Profile'}
        name={selectedProfileName}
      />
    </CustomerLayout>
  );
};

export default FindArtisans;

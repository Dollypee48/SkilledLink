import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, Search, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ReviewService } from '../services/reviewService';
import BookingModal from '../components/BookingModal';
import { useBooking } from '../context/BookingContext';

const AllArtisans = () => {
  const { user } = useAuth();
  const { setSelectedArtisan, openBookingModal } = useBooking();
  const navigate = useNavigate();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedArtisanProfile, setSelectedArtisanProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [artisanReviews, setArtisanReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const API_URL = "http://localhost:5000/api";

  // Handle booking click
  const handleBookClick = (artisan) => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login?redirect=/find-artisans');
      return;
    }
    
    if (user.role !== 'customer') {
      alert('Only customers can book services. Please log in as a customer.');
      return;
    }
    
    
    // Set the selected artisan and open booking modal
    setSelectedArtisan(artisan);
    openBookingModal();
  };

  // Handle view profile
  const handleViewProfile = async (artisan) => {
    if (!artisan || !artisan.id) {
      console.error('Invalid artisan data:', artisan);
      return;
    }
    
    setSelectedArtisanProfile(artisan);
    setShowProfileModal(true);
    
    // Fetch artisan reviews
    try {
      setReviewsLoading(true);
      console.log('Fetching reviews for artisan:', artisan.id);
      const reviews = await ReviewService.getPublicArtisanReviews(artisan.id);
      setArtisanReviews(reviews);
      console.log('Fetched reviews:', reviews);
    } catch (error) {
      console.error('Error fetching artisan reviews:', error);
      setArtisanReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedArtisanProfile(null);
    setArtisanReviews([]);
  };

  // Calculate average rating from reviews
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return totalRating / reviews.length;
  };


  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch artisans from API
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedService && selectedService !== 'All Services') params.append('service', selectedService);
        if (selectedLocation && selectedLocation !== 'All Locations') params.append('location', selectedLocation);
        
        const response = await axios.get(`${API_URL}/artisans?${params.toString()}`);
        
        // Transform the data to match our component structure
        const transformedArtisans = response.data.map(artisan => ({
          id: artisan._id,
          name: artisan.name || 'Unknown Artisan',
          service: artisan.service || artisan.artisanProfile?.service || 'General Service',
          location: artisan.location?.state || artisan.state || 'Location not specified',
          rating: artisan.rating || artisan.artisanProfile?.rating || 0,
          reviews: artisan.reviewCount || artisan.artisanProfile?.reviewCount || 0,
          price: artisan.hourlyRate ? `₦${artisan.hourlyRate}` : null,
          image: artisan.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          description: artisan.bio || artisan.artisanProfile?.bio || 'Professional artisan ready to help with your needs.',
          availability: artisan.availability ? 'Available Now' : 'Not Available',
          verified: artisan.kycVerified || false,
          skills: artisan.skills || artisan.artisanProfile?.skills || [],
          experience: artisan.experience || artisan.artisanProfile?.experience || ''
        }));
        
        setArtisans(transformedArtisans);
      } catch (err) {
        console.error('Error fetching artisans:', err);
        setError('Failed to load artisans. Please try again later.');
        
        // Fallback to empty array if API fails
        setArtisans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [API_URL, debouncedSearchTerm, selectedService, selectedLocation]);

  // Get unique services and locations from the data
  const services = ['All Services', ...new Set(artisans.map(artisan => artisan.service).filter(Boolean))];
  const locations = ['All Locations', ...new Set(artisans.map(artisan => artisan.location).filter(Boolean))];

  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === '' || artisan.service === selectedService;
    const matchesLocation = selectedLocation === '' || artisan.location === selectedLocation;
    
    return matchesSearch && matchesService && matchesLocation;
  });

  const sortedArtisans = [...filteredArtisans].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        const aPrice = a.price ? parseInt(a.price.replace(/[^\d]/g, '')) : Infinity;
        const bPrice = b.price ? parseInt(b.price.replace(/[^\d]/g, '')) : Infinity;
        return aPrice - bPrice;
      case 'price-high':
        const aPriceHigh = a.price ? parseInt(a.price.replace(/[^\d]/g, '')) : 0;
        const bPriceHigh = b.price ? parseInt(b.price.replace(/[^\d]/g, '')) : 0;
        return bPriceHigh - aPriceHigh;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#F59E0B] mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#F59E0B] rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Artisans</h3>
          <p className="text-gray-600">Finding the best professionals for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151E3D]/5 to-[#F59E0B]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Find <span className="text-[#F59E0B]">Skilled</span> Artisans
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Discover talented professionals ready to help with your projects. 
              Connect with verified artisans in your area.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-[#F59E0B]/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#151E3D] mb-2">Search & Filter</h2>
            <p className="text-[#151E3D]/70">Find the perfect artisan for your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <input
                type="text"
                placeholder="Search artisans, skills, or services..."
                className="w-full pl-12 pr-4 py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Service Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <select
                className="w-full pl-12 pr-4 py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] bg-white appearance-none cursor-pointer"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services.map(service => (
                  <option key={service} value={service === 'All Services' ? '' : service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <select
                className="w-full pl-12 pr-4 py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] bg-white appearance-none cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location === 'All Locations' ? '' : location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <select
                className="w-full pl-12 pr-4 py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] bg-white appearance-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Sort by Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#151E3D]/10 to-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-6">
            <p className="text-[#151E3D] font-semibold text-lg">
              <span className="font-bold text-[#F59E0B]">{sortedArtisans.length}</span> of <span className="font-bold text-[#151E3D]">{artisans.length}</span> artisans found
            </p>
          </div>
        </div>

        {/* Artisans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArtisans.map(artisan => (
            <div key={artisan.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#F59E0B]/20 group hover:-translate-y-1">
              {/* Artisan Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={artisan.image}
                  alt={artisan.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151E3D]/40 to-transparent"></div>
                {artisan.verified && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    KYC Verified
                  </div>
                )}
                {artisan.isPremium && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </div>
                )}
                <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
                  artisan.availability === 'Available Now' 
                    ? 'bg-[#F59E0B] text-white' 
                    : 'bg-[#151E3D] text-white'
                }`}>
                  {artisan.availability}
                </div>
              </div>

              {/* Artisan Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#151E3D] mb-2">{artisan.name}</h3>
                  <div className="flex items-center mb-3">
                    <span className="bg-gradient-to-r from-[#F59E0B]/10 to-[#151E3D]/10 text-[#F59E0B] px-3 py-1 rounded-full text-sm font-semibold border border-[#F59E0B]/20">
                      {artisan.service}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-[#F59E0B] mr-2" />
                    <span className="text-[#151E3D]/70 text-sm">{artisan.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-[#F59E0B] mr-1" />
                    <span className="text-sm font-bold text-[#151E3D]">{artisan.rating.toFixed(1)}</span>
                    <span className="text-sm text-[#151E3D]/60 ml-1">({artisan.reviews})</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewProfile(artisan)}
                    className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleBookClick(artisan)}
                    className="flex-1 border-2 border-[#151E3D] text-[#151E3D] hover:bg-[#151E3D] hover:text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedArtisans.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-[#F59E0B]/20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-3">No artisans found</h3>
              <p className="text-[#151E3D]/70 mb-6 leading-relaxed">
                We couldn't find any artisans matching your criteria. Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedService('');
                  setSelectedLocation('');
                }}
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

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
                    <div className="relative">
                      <img
                        src={selectedArtisanProfile.image}
                        alt={selectedArtisanProfile.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {/* Availability Badge */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center ${
                        selectedArtisanProfile.availability === 'Available Now'
                          ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedArtisanProfile.availability === 'Available Now' ? 'bg-green-100' : 'bg-red-100'
                        }`}></div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-[#151E3D] mb-2">
                        {selectedArtisanProfile.name}
                      </h3>
                      <p className="text-lg text-gray-600 mb-3">
                        {selectedArtisanProfile.service}
                      </p>
                      
                      {/* Location */}
                      <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {selectedArtisanProfile.location}
                        </span>
                      </div>

                      {/* KYC Status */}
                      <div className="flex items-center justify-center md:justify-start mb-3">
                        {selectedArtisanProfile.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            KYC Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Not Verified
                          </span>
                        )}
                      </div>

                      {/* Rating Display */}
                      <div className="flex items-center justify-center md:justify-start space-x-2 mt-3">
                        <div className="flex items-center space-x-1">
                          {Array(5).fill().map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(calculateAverageRating(artisanReviews)) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {calculateAverageRating(artisanReviews).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({artisanReviews.length} reviews)
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
                            Contact for details
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
                            Contact for details
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
                            {selectedArtisanProfile.experience || 'Not specified'}
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
                              selectedArtisanProfile.verified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedArtisanProfile.verified ? 'Verified' : 'Pending Verification'}
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
                {selectedArtisanProfile.description && (
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
                        {selectedArtisanProfile.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {selectedArtisanProfile.skills && selectedArtisanProfile.skills.length > 0 && (
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
                      {selectedArtisanProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-2 rounded-full text-sm font-semibold border border-[#D97706] shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeProfileModal();
                      handleBookClick(selectedArtisanProfile);
                    }}
                    disabled={selectedArtisanProfile.availability !== 'Available Now'}
                    className={`flex-1 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedArtisanProfile.availability === 'Available Now'
                        ? 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-[#151E3D]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
                    }`}
                  >
                    {selectedArtisanProfile.availability === 'Available Now' ? (
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

        {/* Booking Modal */}
        <BookingModal />
      </div>
    </div>
  );
};

export default AllArtisans;

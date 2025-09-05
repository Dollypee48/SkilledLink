import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AllArtisans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const API_URL = "http://localhost:5000/api";

  // Handle booking click
  const handleBookClick = (artisanId) => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login?redirect=/find-artisans');
      return;
    }
    
    if (user.role !== 'customer') {
      alert('Only customers can book services. Please log in as a customer.');
      return;
    }
    
    // Navigate to artisan detail page for booking
    navigate(`/artisan/${artisanId}`);
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
          location: artisan.location?.city && artisan.location?.state 
            ? `${artisan.location.city}, ${artisan.location.state}` 
            : artisan.location?.state || 'Location not specified',
          rating: artisan.rating || artisan.artisanProfile?.rating || 0,
          reviews: artisan.reviewCount || artisan.artisanProfile?.reviewCount || 0,
          price: artisan.hourlyRate ? `₦${artisan.hourlyRate}` : 'Contact for price',
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
  const locations = ['All Locations', ...new Set(artisans.map(artisan => artisan.location.split(',')[0]).filter(Boolean))];

  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === '' || artisan.service === selectedService;
    const matchesLocation = selectedLocation === '' || artisan.location.includes(selectedLocation);
    
    return matchesSearch && matchesService && matchesLocation;
  });

  const sortedArtisans = [...filteredArtisans].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'price-high':
        return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
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
                  <div className="absolute top-4 right-4 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ✓ Verified
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#151E3D] mb-1">{artisan.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className="bg-gradient-to-r from-[#F59E0B]/10 to-[#151E3D]/10 text-[#F59E0B] px-3 py-1 rounded-full text-sm font-semibold border border-[#F59E0B]/20">
                        {artisan.service}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#151E3D]">{artisan.price}</div>
                    <div className="text-sm text-[#151E3D]/60">per hour</div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <MapPin className="w-4 h-4 text-[#F59E0B] mr-2" />
                  <span className="text-[#151E3D]/70 text-sm">{artisan.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Star className="w-4 h-4 text-[#F59E0B] mr-1" />
                      <span className="text-sm font-bold text-[#151E3D]">{artisan.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-[#151E3D]/60">({artisan.reviews} reviews)</span>
                  </div>
                  {artisan.skills && artisan.skills.length > 0 && (
                    <div className="text-xs text-[#151E3D]/60">
                      {artisan.skills.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>

                <p className="text-[#151E3D]/70 text-sm mb-6 line-clamp-2 leading-relaxed">{artisan.description}</p>

                <div className="flex gap-3">
                  <Link
                    to={`/artisan/${artisan.id}`}
                    className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleBookClick(artisan.id)}
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
      </div>
    </div>
  );
};

export default AllArtisans;

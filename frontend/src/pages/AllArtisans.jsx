import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, Search, Eye, ArrowLeft, Briefcase, DollarSign, User, Calendar, XCircle, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ReviewService } from '../services/reviewService';
import ServiceProfileBookingModal from '../components/ServiceProfileBookingModal';
import { MessageProvider } from '../context/MessageContext';
import serviceProfileService from '../services/serviceProfileService';

// Chat Interface Component
const ChatInterface = ({ artisan, onClose, messages, loading, onSendMessage, onRefresh }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);


    try {
      await onSendMessage(messageText, artisan._id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[400px] bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-center font-medium">No messages yet</p>
            <p className="text-center text-sm text-gray-400">Start the conversation with {artisan.name || 'this artisan'}!</p>
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors duration-200 text-sm"
            >
              Refresh Messages
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.filter(message => message && message.content).map((message) => {
            // Use the same logic as the main message page
            const isOwnMessage = message?.sender?._id === user?._id;
            const messageTime = message?.timestamp || message?.createdAt;
            
            return (
            <div
              key={message._id + (message.timestamp || message.createdAt)}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar for received messages only */}
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {message?.sender?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`relative group ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white rounded-br-md' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  } ${message.isOptimistic ? 'opacity-70' : ''}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message?.content || ''}</p>
                    
                    {/* Message time */}
                    <div className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {messageTime ? new Date(messageTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Just now'}
                      {message.isOptimistic && ' (Sending...)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${artisan.name || 'this artisan'}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-transparent transition-colors duration-200"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, or click the Send button
        </p>
      </form>
    </div>
  );
};

const AllArtisans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedServiceProfile, setSelectedServiceProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [serviceProfileReviews, setServiceProfileReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedArtisanForChat, setSelectedArtisanForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showServiceBookingModal, setShowServiceBookingModal] = useState(false);
  const [selectedServiceProfileForBooking, setSelectedServiceProfileForBooking] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  const API_URL = "http://localhost:5000/api";

  // Handle booking click
  const handleBookClick = (serviceProfile) => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login?redirect=/find-artisans');
      return;
    }
    
    if (user.role !== 'customer') {
      alert('Only customers can book services. Please log in as a customer.');
      return;
    }

    // Check if service profile is active
    if (!serviceProfile.isActive) {
      alert('This service is currently unavailable for booking.');
      return;
    }

    // Check KYC verification status
    if (!user.kycVerified || user.kycStatus !== 'approved') {
      alert('KYC verification required to book services. Please complete your identity verification first.');
      navigate('/customer-settings');
      return;
    }
    
    // Set the selected service profile and open service booking modal
    setSelectedServiceProfileForBooking(serviceProfile);
    setShowServiceBookingModal(true);
  };

  // Close service booking modal
  const closeServiceBookingModal = () => {
    setShowServiceBookingModal(false);
    setSelectedServiceProfileForBooking(null);
  };

  // Handle view profile
  const handleViewProfile = async (serviceProfile) => {
    if (!serviceProfile || !serviceProfile._id) {
      return;
    }
    
    console.log('Viewing service profile:', serviceProfile);
    console.log('Artisan data:', serviceProfile.artisanId);
    console.log('Artisan profile data:', serviceProfile.artisanId?.artisanProfile);
    
    setSelectedServiceProfile(serviceProfile);
    setShowProfileModal(true);
    
    // Fetch service profile reviews
    try {
      setReviewsLoading(true);
      const reviews = await ReviewService.getPublicArtisanReviews(serviceProfile.artisanId._id);
      setServiceProfileReviews(reviews);
    } catch (error) {
      setServiceProfileReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedServiceProfile(null);
    setServiceProfileReviews([]);
  };

  // Handle chat click
  const handleChatClick = (serviceProfile) => {
    if (!user) {
      navigate('/login?redirect=/all-artisans');
      return;
    }
    
    if (user.role !== 'customer') {
      alert('Only customers can chat with artisans. Please log in as a customer.');
      return;
    }

    // Ensure we have a valid artisan ID
    const artisanId = serviceProfile.artisanId?._id || serviceProfile.artisanId;
    if (!artisanId) {
      console.error('No valid artisan ID found:', serviceProfile.artisanId);
      alert('Unable to start chat. Artisan information is missing.');
      return;
    }

    setSelectedArtisanForChat(serviceProfile.artisanId);
    setShowChatModal(true);
    // Load conversation when opening chat
    loadChatConversation(artisanId);
  };

  // Close chat modal
  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedArtisanForChat(null);
    // Don't clear messages, keep them for when modal reopens
  };

  // Load chat conversation
  const loadChatConversation = async (artisanId) => {
    setChatLoading(true);
    try {
      // Validate artisan ID
      if (!artisanId) {
        console.error('No artisan ID provided to loadChatConversation');
        setChatMessages([]);
        return;
      }

      console.log('Loading conversation for artisan ID:', artisanId);
      
      const { messageService } = await import('../services/messageService');
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        setChatMessages([]);
        return;
      }

      const messages = await messageService.getConversation(artisanId, token);
      
      // The backend returns messages array directly, not wrapped in an object
      console.log('Received messages from backend:', messages);
      if (Array.isArray(messages)) {
        setChatMessages(messages);
      } else {
        console.log('Messages is not an array:', typeof messages, messages);
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send chat message
  const handleSendMessage = async (messageText, artisanId) => {
    try {
      // Ensure we have a valid artisan ID
      const validArtisanId = artisanId?._id || artisanId;
      if (!validArtisanId) {
        throw new Error('Invalid artisan ID');
      }

      // Create optimistic message
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageText,
        sender: user.id,
        recipient: validArtisanId,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      setChatMessages(prev => [...prev, tempMessage]);

      // Send message via messageService
      const { messageService } = await import('../services/messageService');
      const token = localStorage.getItem('accessToken');
      const sentMessage = await messageService.sendMessage(validArtisanId, messageText, null, null, token);
      
      // Replace optimistic message with real message
      setChatMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { 
                ...sentMessage, 
                isOptimistic: false,
                timestamp: sentMessage.timestamp || new Date().toISOString()
              }
            : msg
        )
      );

    } catch (error) {
      // Remove optimistic message on error
      setChatMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      throw error;
    }
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

  // Fetch service profiles from API
  useEffect(() => {
    const fetchServiceProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const filters = {
          search: debouncedSearchTerm || undefined,
          category: selectedCategory && selectedCategory !== 'All Categories' ? selectedCategory : undefined,
          location: selectedLocation && selectedLocation !== 'All Locations' ? selectedLocation : undefined,
          sortBy: sortBy,
          page: pagination.currentPage,
          limit: 12
        };
        
        const response = await serviceProfileService.getAllServiceProfiles(filters);
        
        console.log('Service profiles response:', response.serviceProfiles);
        if (response.serviceProfiles && response.serviceProfiles.length > 0) {
          console.log('First service profile artisan data:', response.serviceProfiles[0].artisanId);
        }
        
        setServiceProfiles(response.serviceProfiles || []);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        });
      } catch (err) {
        console.error('Error fetching service profiles:', err);
        setError('Failed to load service profiles. Please try again later.');
        setServiceProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceProfiles();
  }, [debouncedSearchTerm, selectedCategory, selectedLocation, sortBy, pagination.currentPage]);

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

  // Comprehensive list of service categories
  const serviceCategories = [
    'All Categories',
    'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 
    'gardening', 'appliance_repair', 'hvac', 'roofing', 'flooring',
    'tiling', 'masonry', 'welding', 'automotive', 'computer_repair',
    'phone_repair', 'photography', 'catering', 'event_planning',
    'tutoring', 'fitness', 'beauty', 'massage', 'other'
  ];

  // Get unique categories and locations from the data, but use our comprehensive lists as primary
  const categories = [...new Set([...serviceCategories, ...serviceProfiles.map(profile => profile.category).filter(Boolean)])];
  const locations = [...new Set([...nigerianStates, ...serviceProfiles.map(profile => profile.artisanId?.address || profile.artisanId?.state).filter(Boolean)])];

  // The filtering is now handled by the backend API, so we just use the service profiles as returned
  const filteredServiceProfiles = serviceProfiles;

  const sortedServiceProfiles = [...filteredServiceProfiles].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price_low':
        return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      case 'price_high':
        return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'popular':
        return (b.bookingCount || 0) - (a.bookingCount || 0);
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Service Profiles</h3>
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
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Find <span className="text-[#F59E0B]">Skilled</span> Artisans
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Discover talented professionals ready to help with your projects. 
              Connect with verified artisans in your area.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-[#F59E0B]/20">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#151E3D] mb-2">Search & Filter</h2>
            <p className="text-sm sm:text-base text-[#151E3D]/70">Find the perfect artisan for your needs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <input
                type="text"
                placeholder="Search artisans, skills, or services..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-sm sm:text-base text-[#151E3D] placeholder-[#151E3D]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Service Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <select
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-sm sm:text-base text-[#151E3D] bg-white appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B] w-5 h-5" />
              <select
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-sm sm:text-base text-[#151E3D] bg-white appearance-none cursor-pointer"
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
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#151E3D]/20 rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-sm sm:text-base text-[#151E3D] bg-white appearance-none cursor-pointer"
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
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-[#151E3D]/10 to-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-[#151E3D] font-semibold text-base sm:text-lg">
                <span className="font-bold text-[#F59E0B]">{sortedServiceProfiles.length}</span> service profile{sortedServiceProfiles.length !== 1 ? 's' : ''} found
              </p>
              {(debouncedSearchTerm || selectedCategory || selectedLocation) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedLocation('');
                  }}
                  className="text-[#F59E0B] hover:text-[#D97706] text-sm font-medium underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Service Profiles Grid */}
        {sortedServiceProfiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#151E3D] mb-3">No Service Profiles Found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchTerm || selectedCategory || selectedLocation 
                  ? "Try adjusting your search criteria or filters to find more service profiles."
                  : "No service profiles are currently available. Please check back later."
                }
              </p>
              {(debouncedSearchTerm || selectedCategory || selectedLocation) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedLocation('');
                  }}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {sortedServiceProfiles.map(serviceProfile => (
            <div key={serviceProfile._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#F59E0B]/20 group hover:-translate-y-1">
              {/* Service Profile Header */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-[#151E3D] to-[#1E2A4A]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#151E3D]/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    {/* Artisan Profile Image */}
                    <div className="relative mb-3">
                      {serviceProfile.artisanId?.profileImageUrl ? (
                        <img
                          src={serviceProfile.artisanId.profileImageUrl}
                          alt={serviceProfile.artisanId.name || 'Artisan'}
                          className="w-20 h-20 rounded-full mx-auto border-4 border-white/30 shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {serviceProfile.artisanId?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{serviceProfile.title}</h3>
                    <p className="text-sm opacity-90 capitalize">{serviceProfile.category.replace('_', ' ')}</p>
                    <p className="text-xs opacity-75 mt-1">by {serviceProfile.artisanId?.name || 'Unknown Artisan'}</p>
                  </div>
                </div>
                {serviceProfile.artisanId?.isKYCVerified && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">KYC Verified</span>
                    <span className="sm:hidden">KYC</span>
                  </div>
                )}
                {serviceProfile.artisanId?.subscriptionStatus === 'premium' && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="hidden sm:inline">Premium</span>
                    <span className="sm:hidden">Pro</span>
                  </div>
                )}
                <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                  serviceProfile.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {serviceProfile.isActive ? 'Available' : 'Unavailable'}
                </div>
              </div>

              {/* Service Profile Info */}
              <div className="p-4 sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[#151E3D] mb-2">{serviceProfile.artisanId?.name || 'Unknown Artisan'}</h3>
                  <div className="flex items-center mb-2 sm:mb-3">
                    <span className="bg-gradient-to-r from-[#F59E0B]/10 to-[#151E3D]/10 text-[#F59E0B] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-[#F59E0B]/20">
                      {serviceProfile.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#F59E0B] mr-1 sm:mr-2" />
                    <span className="text-[#151E3D]/70 text-xs sm:text-sm truncate">{serviceProfile.artisanId?.address || serviceProfile.artisanId?.state || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#F59E0B] mr-1" />
                    <span className="text-xs sm:text-sm font-bold text-[#151E3D]">{(serviceProfile.rating || 0).toFixed(1)}</span>
                    <span className="text-xs sm:text-sm text-[#151E3D]/60 ml-1">({serviceProfile.reviewCount || 0})</span>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="mb-4 p-3 bg-gradient-to-r from-[#F59E0B]/5 to-[#151E3D]/5 rounded-lg border border-[#F59E0B]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-[#F59E0B] mr-2" />
                      <span className="text-sm text-[#151E3D]/70">Hourly Rate:</span>
                    </div>
                    <span className="text-lg font-bold text-[#151E3D]">₦{serviceProfile.hourlyRate?.toLocaleString() || '0'}</span>
                  </div>
                  {serviceProfile.minimumHours && serviceProfile.maximumHours && (
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-[#F59E0B] mr-2" />
                        <span className="text-sm text-[#151E3D]/70">Duration:</span>
                      </div>
                      <span className="text-sm font-medium text-[#151E3D]">
                        {serviceProfile.minimumHours}-{serviceProfile.maximumHours} hours
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleViewProfile(serviceProfile)}
                    className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white text-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Profile</span>
                    <span className="sm:hidden">View</span>
                  </button>
                  <button
                    onClick={() => handleChatClick(serviceProfile)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Chat</span>
                    <span className="sm:hidden">Chat</span>
                  </button>
                  <button
                    onClick={() => handleBookClick(serviceProfile)}
                    disabled={!serviceProfile.isActive}
                    className={`flex-1 text-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                      serviceProfile.isActive
                        ? 'border-2 border-[#151E3D] text-[#151E3D] hover:bg-[#151E3D] hover:text-white hover:shadow-lg'
                        : 'border-2 border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    {serviceProfile.isActive ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Service Profile Modal */}
        {showProfileModal && selectedServiceProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#151E3D]">Service Profile Details</h2>
                      <p className="text-sm text-gray-500">{selectedServiceProfile.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeProfileModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] rounded-xl p-4 mb-4 border border-[#151E3D]/10">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Artisan Profile Image */}
                    <div className="relative">
                      {selectedServiceProfile.artisanId?.profileImageUrl ? (
                        <img
                          src={selectedServiceProfile.artisanId.profileImageUrl}
                          alt={selectedServiceProfile.artisanId.name || 'Artisan'}
                          className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-3xl font-bold text-white">
                            {selectedServiceProfile.artisanId?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                      {/* Availability Badge */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center ${
                        selectedServiceProfile.isActive 
                          ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedServiceProfile.isActive ? 'bg-green-100' : 'bg-red-100'
                        }`}></div>
                      </div>
                    </div>

                    {/* Service Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-[#151E3D] mb-2">
                        {selectedServiceProfile.title}
                      </h3>
                      <p className="text-lg text-gray-600 mb-3 capitalize">
                        {selectedServiceProfile.category.replace('_', ' ')}
                      </p>
                      
                      {/* Artisan Name */}
                      <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {selectedServiceProfile.artisanId?.name || 'Unknown Artisan'}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {selectedServiceProfile.artisanId?.address || selectedServiceProfile.artisanId?.state || 'Location not specified'}
                        </span>
                      </div>

                      {/* KYC Status */}
                      <div className="flex items-center justify-center md:justify-start mb-3">
                        {console.log('KYC Debug - artisanId:', selectedServiceProfile.artisanId)}
                        {console.log('KYC Debug - kycVerified:', selectedServiceProfile.artisanId?.kycVerified)}
                        {console.log('KYC Debug - kycStatus:', selectedServiceProfile.artisanId?.kycStatus)}
                        {(() => {
                          const kycVerified = selectedServiceProfile.artisanId?.kycVerified;
                          const kycStatus = selectedServiceProfile.artisanId?.kycStatus;
                          
                          if (kycVerified && kycStatus === 'approved') {
                            return (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            KYC Verified
                          </span>
                            );
                          } else if (kycStatus === 'pending') {
                            return (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                KYC Pending
                              </span>
                            );
                          } else if (kycStatus === 'rejected') {
                            return (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                KYC Rejected
                              </span>
                            );
                          } else {
                            return (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Not Verified
                          </span>
                            );
                          }
                        })()}
                      </div>

                      {/* Rating Display */}
                      <div className="flex items-center justify-center md:justify-start space-x-2 mt-3">
                        <div className="flex items-center space-x-1">
                          {Array(5).fill().map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(calculateAverageRating(serviceProfileReviews)) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {calculateAverageRating(serviceProfileReviews).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({serviceProfileReviews.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  {/* Service Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-[#151E3D]">Service Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Hourly Rate</p>
                          <p className="text-sm font-medium text-gray-900">
                            ₦{selectedServiceProfile.hourlyRate?.toLocaleString() || '0'}/hour
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Duration Range</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.minimumHours || 1} - {selectedServiceProfile.maximumHours || 8} hours
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Service Area</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.serviceArea?.type === 'local' ? 'Local' : 'Remote'} Service
                            {selectedServiceProfile.serviceArea?.radius && ` (${selectedServiceProfile.serviceArea.radius}km radius)`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Artisan Name</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.artisanId?.name || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Contact</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.artisanId?.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">KYC Verification</p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedServiceProfile.artisanId?.kycVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedServiceProfile.artisanId?.kycVerified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2V6" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.artisanId?.artisanProfile?.experience || 'Not specified'}
                          </p>
                    </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Service Information Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-[#151E3D]">Service Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Hourly Rate</p>
                          <p className="font-medium text-gray-900">
                            ₦{selectedServiceProfile.hourlyRate?.toLocaleString() || '0'}/hour
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Duration Range</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.minimumHours || 1} - {selectedServiceProfile.maximumHours || 8} hours
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Service Area</p>
                          <p className="font-medium text-gray-900">
                            {selectedServiceProfile.serviceArea?.type === 'local' ? 'Local' : 'Remote'} Service
                            {selectedServiceProfile.serviceArea?.radius && ` (${selectedServiceProfile.serviceArea.radius}km radius)`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {selectedServiceProfile.category?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedServiceProfile.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Service Description</p>
                      <p className="text-gray-700">{selectedServiceProfile.description}</p>
                    </div>
                  )}
                </div>

                {/* Availability Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-[#151E3D]">Weekly Availability</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedServiceProfile.availability || {}).map(([day, schedule]) => (
                      <div key={day} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{day}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {schedule.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        {schedule.available && (
                          <div className="text-sm text-gray-600">
                            <p>{schedule.startTime} - {schedule.endTime}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
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
                                i < Math.floor(calculateAverageRating(serviceProfileReviews)) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#151E3D]">
                            {calculateAverageRating(serviceProfileReviews).toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {serviceProfileReviews.length > 0 ? `${calculateAverageRating(serviceProfileReviews).toFixed(1)}/5 stars` : 'No ratings yet'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Reviews</p>
                        <p className="text-xl font-semibold text-[#151E3D]">
                          {serviceProfileReviews.length || 0}
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
                  ) : serviceProfileReviews.length > 0 ? (
                    <div className="space-y-4">
                      {serviceProfileReviews.slice(0, 5).map((review, index) => (
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
                      {serviceProfileReviews.length > 5 && (
                        <div className="text-center py-4">
                          <p className="text-xs text-gray-500">
                            Showing 5 of {serviceProfileReviews.length} reviews
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
                {selectedServiceProfile.artisanId?.artisanProfile?.bio && (
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
                        {selectedServiceProfile.artisanId.artisanProfile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {selectedServiceProfile.artisanId?.artisanProfile?.skills && selectedServiceProfile.artisanId.artisanProfile.skills.length > 0 && (
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
                      {selectedServiceProfile.artisanId.artisanProfile.skills.map((skill, index) => (
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
                      handleBookClick(selectedServiceProfile);
                    }}
                    disabled={!selectedServiceProfile.isActive}
                    className={`flex-1 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedServiceProfile.isActive
                        ? 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-[#151E3D]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
                    }`}
                  >
                    {selectedServiceProfile.isActive ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Book This Service</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Service Currently Unavailable</span>
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

        {/* Chat Modal */}
        {showChatModal && selectedArtisanForChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
              {/* Chat Modal Header */}
              <div className="bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Chat with {selectedArtisanForChat.name || 'Artisan'}</h3>
                      <p className="text-sm text-white/80">Start a conversation</p>
                    </div>
                  </div>
                  <button
                    onClick={closeChatModal}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                  >
                    <XCircle className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Chat Modal Content */}
              <div className="flex-1 flex flex-col p-4">
                <ChatInterface 
                  artisan={selectedArtisanForChat}
                  onClose={closeChatModal}
                  messages={chatMessages}
                  loading={chatLoading}
                  onSendMessage={handleSendMessage}
                  onRefresh={() => {
                    const artisanId = selectedArtisanForChat?._id || selectedArtisanForChat;
                    if (artisanId) {
                      loadChatConversation(artisanId);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Service Profile Booking Modal */}
        <ServiceProfileBookingModal 
          isOpen={showServiceBookingModal}
          onClose={closeServiceBookingModal}
          serviceProfile={selectedServiceProfileForBooking}
        />
      </div>
    </div>
  );
};

// Wrap AllArtisans with MessageProvider for chat functionality
const AllArtisansWithProvider = () => {
  return (
    <MessageProvider>
      <AllArtisans />
    </MessageProvider>
  );
};

export default AllArtisansWithProvider;

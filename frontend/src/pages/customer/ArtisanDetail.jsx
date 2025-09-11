// frontend/src/pages/customer/ArtisanDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Remove CustomerLayout import - we'll create a simple layout inline
import { getArtisanById } from '../../services/artisanService'; // Import the new service function
import { Star, MapPin } from 'lucide-react';
import BookingModal from '../../components/BookingModal'; // Import BookingModal
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { BookingService } from '../../services/BookingService'; // Import BookingService
import { useMessage } from '../../context/MessageContext'; // New: Import useMessage
import { useNavigate } from 'react-router-dom'; // New: Import useNavigate

const ArtisanDetail = () => {
  const { id } = useParams();
  const { user, accessToken } = useAuth(); // Get user and accessToken from AuthContext
  const { selectRecipient } = useMessage(); // New: Get selectRecipient from MessageContext
  const navigate = useNavigate(); // New: Get navigate hook
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false); // State for modal visibility
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        setLoading(true);
        const data = await getArtisanById(id);
        setArtisan(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch artisan details.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [id]);

  const handleBookingSubmit = async (bookingDetails) => {
    if (!user) {
      setBookingError('Please log in to make a booking.');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    if (user.role !== 'customer') {
      setBookingError('Only customers can make bookings. Please log in as a customer.');
      return;
    }
    
    if (!accessToken) {
      setBookingError('Authentication token not found. Please log in.');
      return;
    }

    try {
      setBookingSuccess(false);
      setBookingError(null);
      await BookingService.createBooking({
        artisan: artisan.userId?._id || artisan._id, // Artisan's User ID
        service: artisan.service || artisan.artisanProfile?.service, // Service offered by the artisan
        ...bookingDetails,
      }, accessToken);
      setBookingSuccess(true);
      setShowBookingModal(false);
    } catch (err) {
      setBookingError(err.message || 'Failed to create booking.');
    }
  };

  const handleBookClick = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    if (user.role !== 'customer') {
      alert('Only customers can book services. Please log in as a customer.');
      return;
    }
    
    setShowBookingModal(true);
  };

  const handleMessageArtisan = () => {
    if (artisan && artisan.userId) {
      // Store recipient data in sessionStorage for the messages page to pick up
      const recipientData = {
        _id: artisan.userId,
        name: artisan.name || 'Artisan'
      };
      
      // Try to set recipient in context if available
      selectRecipient(recipientData);
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('selectedRecipient', JSON.stringify(recipientData));
      
      navigate('/messages'); // Navigate to the messages page
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151E3D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artisan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <Link to="/find-artisans" className="text-[#151E3D] hover:underline">
            ← Back to Find Artisans
          </Link>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Artisan not found.</div>
          <Link to="/find-artisans" className="text-[#151E3D] hover:underline">
            ← Back to Find Artisans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#151E3D]">
                SkilledLink
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/find-artisans" 
                className="text-gray-600 hover:text-[#151E3D] px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Artisans
              </Link>
              <Link 
                to="/login" 
                className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {artisan.userId?.profileImageUrl ? (
                <img
                  src={artisan.userId.profileImageUrl}
                  alt={artisan.userId.name || 'Artisan'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#151E3D] shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {artisan.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              {/* Availability Dot */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                artisan.availability ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {artisan.userId?.name || 'Unknown Artisan'}
              </h1>
              <p className="text-xl text-[#F59E0B] font-semibold mb-2">
                {artisan.service || artisan.artisanProfile?.service || 'Professional Service'}
              </p>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">{artisan.rating?.toFixed(1) || '0.0'}</span>
                  <span className="ml-1">({artisan.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{artisan.location?.city && artisan.location?.state 
                    ? `${artisan.location.city}, ${artisan.location.state}` 
                    : artisan.location?.state || 'Location not specified'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleMessageArtisan}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Message Artisan
              </button>
              <button
                onClick={handleBookClick}
                className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
            {artisan.bio || artisan.artisanProfile?.bio ? (
              <p className="text-gray-600 leading-relaxed">
                {artisan.bio || artisan.artisanProfile?.bio}
              </p>
            ) : (
              <p className="text-gray-500 italic">No bio available.</p>
            )}
            
            {artisan.experience || artisan.artisanProfile?.experience ? (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Experience</h3>
                <p className="text-gray-600">{artisan.experience || artisan.artisanProfile?.experience}</p>
              </div>
            ) : null}
          </div>

          {/* Skills Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
            {artisan.skills && artisan.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {artisan.skills.map((skill, index) => (
                  <span key={index} className="bg-[#F59E0B] text-white px-4 py-2 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills listed.</p>
            )}
          </div>
        </div>

        {/* Booking Status Messages */}
        {bookingSuccess && (
          <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            Booking successful! The artisan will review your request and get back to you.
          </div>
        )}
        {bookingError && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            Error: {bookingError}
          </div>
        )}
      </main>
      
      {showBookingModal && (
        <BookingModal
          artisan={artisan}
          service={artisan.service || artisan.artisanProfile?.service || 'General Service'}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default ArtisanDetail;

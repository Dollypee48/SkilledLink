// frontend/src/pages/customer/ArtisanDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomerLayout from '../../components/common/Layouts/CustomerLayout'; // Assuming a customer layout or a general layout
import { getArtisanById } from '../../services/artisanService'; // Import the new service function
import { Star } from 'lucide-react';
import BookingModal from '../../components/BookingModal'; // Import BookingModal
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { BookingService } from '../../services/BookingService'; // Import BookingService
import { useMessage } from '../../context/MessageContext'; // New: Import useMessage
import { useNavigate } from 'react-router-dom'; // New: Import useNavigate

const ArtisanDetail = () => {
  const { id } = useParams();
  const { user, accessToken } = useAuth(); // Get user and accessToken from AuthContext
  const { setSelectedRecipient } = useMessage(); // New: Get setSelectedRecipient from MessageContext
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
    if (!user || user.role !== 'customer') {
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
        artisan: artisan.userId._id, // Artisan's User ID
        service: artisan.service, // Service offered by the artisan
        ...bookingDetails,
      }, accessToken);
      setBookingSuccess(true);
      setShowBookingModal(false);
    } catch (err) {
      setBookingError(err.message || 'Failed to create booking.');
    }
  };

  const handleMessageArtisan = () => {
    if (artisan && artisan.userId) {
      setSelectedRecipient(artisan.userId); // Set the artisan as the selected recipient
      navigate('/messages'); // Navigate to the messages page
    }
  };

  if (loading) {
    return <CustomerLayout><div className="p-6 text-center">Loading artisan details...</div></CustomerLayout>;
  }

  if (error) {
    return <CustomerLayout><div className="p-6 text-center text-red-500">Error: {error}</div></CustomerLayout>;
  }

  if (!artisan) {
    return <CustomerLayout><div className="p-6 text-center">Artisan not found.</div></CustomerLayout>;
  }

  return (
    <CustomerLayout> {/* You might have a different layout for customer pages */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Artisan Details: {artisan.userId?.name || 'N/A'}</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p><strong>Service:</strong> {artisan.service || 'N/A'}</p>
          <div className="flex items-center mt-2">
            <strong>Rating:</strong>
            <span className="ml-2 text-yellow-500 flex items-center">
              {artisan.rating || 0} <Star className="w-4 h-4 ml-1 fill-current" />
            </span>
          </div>
          <p className="mt-2"><strong>Location:</strong> {artisan.location || 'N/A'}</p>
          {artisan.bio && <p className="mt-2"><strong>Bio:</strong> {artisan.bio}</p>}
          {artisan.experience && <p className="mt-2"><strong>Experience:</strong> {artisan.experience}</p>}
          <div className="mt-2">
            <strong>Skills:</strong>
            {artisan.skills && artisan.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {artisan.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="ml-2 text-gray-500">No skills listed.</span>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleMessageArtisan}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Message Artisan
            </button>
            <button
              onClick={() => {
                setShowBookingModal(true);
              }}
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Book Now
            </button>
          </div>
          {bookingSuccess && (
            <p className="mt-4 text-green-600">Booking successful! Artisan will review your request.</p>
          )}
          {bookingError && (
            <p className="mt-4 text-red-600">Error: {bookingError}</p>
          )}
        </div>
      </div>
      {showBookingModal && (
        <BookingModal
          artisan={artisan}
          service={artisan.service || 'General Service'}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </CustomerLayout>
  );
};

export default ArtisanDetail;

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext'; // Assuming you have a MessageContext
import { XCircle, Star } from 'lucide-react';
import ReviewRatingsModal from './ReviewRatingsModal';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  const navigate = useNavigate();
  const { setSelectedRecipient } = useMessage();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!isOpen || !booking) return null;

  const handleChatWithArtisan = () => {
    if (booking.artisan) {
      setSelectedRecipient({
        _id: booking.artisan._id,
        name: booking.artisan.name,
      });
      onClose(); // Close the booking details modal
      navigate('/messages'); // Navigate to the messages page
    }
  };

  const handleReviewAndRating = () => {
    setIsReviewModalOpen(true); // Open the review modal
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800'; // Changed to blue for accepted/in progress
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-[#151E3D] mb-6 border-b pb-3">Booking Details</h2>

        <div className="space-y-4 text-gray-700">
          <p><span className="font-semibold">Artisan:</span> {booking.artisan?.name || 'N/A'}</p>
          <p><span className="font-semibold">Service:</span> {booking.service}</p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
          <p><span className="font-semibold">Time:</span> {booking.time}</p>
          <p>
            <span className="font-semibold">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status === 'Accepted' ? 'In Progress' : booking.status}
            </span>
          </p>
          {booking.description && <p><span className="font-semibold">Description:</span> {booking.description}</p>}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {booking.artisan && ( // Only show chat button if artisan exists
            <button
              onClick={handleChatWithArtisan}
              className="px-4 py-2 rounded-md bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
            >
              Chat with {booking.artisan.name}
            </button>
          )}
          <button
            onClick={handleReviewAndRating}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2"
          >
            <Star className="w-4 h-4" />
            Review & Ratings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Review & Ratings Modal */}
      <ReviewRatingsModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        booking={booking}
      />
    </div>,
    document.body
  );
};

export default BookingDetailsModal;

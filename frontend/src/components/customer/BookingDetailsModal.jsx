import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext'; // Assuming you have a MessageContext
import { XCircle, Star } from 'lucide-react';
import ReviewRatingsModal from './ReviewRatingsModal';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  const navigate = useNavigate();
  const { selectRecipient } = useMessage();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!isOpen || !booking) return null;

  const handleChatWithArtisan = () => {
    if (booking.artisan) {
      // Store recipient data in sessionStorage for the messages page to pick up
      const recipientData = {
        _id: booking.artisan._id,
        name: booking.artisan.name,
      };
      
      // Try to set recipient in context if available
      selectRecipient(recipientData);
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('selectedRecipient', JSON.stringify(recipientData));
      
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
          <p><span className="font-semibold">Service:</span> {booking.service || booking.serviceName}</p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
          <p><span className="font-semibold">Time:</span> {booking.time}</p>
          <p>
            <span className="font-semibold">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status === 'Accepted' ? 'In Progress' : booking.status}
            </span>
          </p>
          {booking.description && <p><span className="font-semibold">Description:</span> {booking.description}</p>}
          {booking.type === 'serviceProfile' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-3">💰 Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {booking.hourlyRate && (
                      <p className="text-green-700"><span className="font-semibold">Hourly Rate:</span> ₦{booking.hourlyRate.toLocaleString()}/hour</p>
                    )}
                    {booking.estimatedDuration && (
                      <p className="text-green-700"><span className="font-semibold">Total Hours Booked:</span> <span className="font-bold text-lg">{booking.estimatedDuration} hours</span></p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {booking.totalAmount && (
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-green-800 font-bold text-xl text-center">Total Amount</p>
                        <p className="text-green-900 font-bold text-2xl text-center">₦{booking.totalAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                {booking.estimatedDuration && booking.hourlyRate && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                    <p className="text-green-800 text-sm text-center">
                      <span className="font-semibold">Calculation:</span> {booking.estimatedDuration} hours × ₦{booking.hourlyRate.toLocaleString()}/hour = ₦{booking.totalAmount?.toLocaleString() || (booking.estimatedDuration * booking.hourlyRate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {booking.specialRequirements && (
                <p><span className="font-semibold">Special Requirements:</span> {booking.specialRequirements}</p>
              )}
            </>
          )}
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
            disabled={booking.status !== 'Completed' && booking.status !== 'Pending Confirmation'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              booking.status === 'Completed' || booking.status === 'Pending Confirmation'
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white focus:ring-[#F59E0B]'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={
              booking.status !== 'Completed' && booking.status !== 'Pending Confirmation'
                ? 'Review will be available after service completion'
                : 'Submit a review for this service'
            }
          >
            <Star className="w-4 h-4" />
            {booking.status === 'Completed' || booking.status === 'Pending Confirmation'
              ? 'Review & Ratings'
              : 'Review (Not Available)'
            }
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

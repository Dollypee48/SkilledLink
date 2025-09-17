import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Star, XCircle } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

const ReviewRatingsModal = ({ isOpen, onClose, booking }) => {
  const { createReview, getMyReviews } = useReview();
  const { getBookings } = useBooking();
  const { accessToken } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setFormError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // Validate booking object structure
  if (!booking.artisan || !booking.artisan._id) {
    console.error('Invalid booking object - missing artisan data:', booking);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">Invalid booking data. Please try refreshing the page.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (rating === 0) {
      setFormError('Please select a rating.');
      setIsSubmitting(false);
      return;
    }
    if (!reviewText.trim()) {
      setFormError('Please enter a comment.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate required data
      if (!booking.artisan || !booking.artisan._id) {
        setFormError('Invalid booking data. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      if (!booking._id) {
        setFormError('Invalid booking ID. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      const reviewData = {
        artisanId: booking.artisan._id,
        bookingId: booking._id,
        rating,
        comment: reviewText.trim(),
      };

      console.log('Review data being sent:', reviewData);
      console.log('Booking object:', booking);
      console.log('Booking artisan:', booking.artisan);

      await createReview(reviewData);
      
      // Reset form
      setRating(0);
      setReviewText('');
      setSuccess('Review submitted successfully!');
      
      // Refresh reviews and bookings
      await getMyReviews();
      await getBookings();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setFormError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
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
        
        <h2 className="text-2xl font-bold text-[#151E3D] mb-6 border-b pb-3 flex items-center gap-2">
          <Star className="w-6 h-6 text-[#F59E0B]" />
          Review & Rating
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
          <p className="text-sm text-gray-600"><span className="font-medium">Artisan:</span> {booking.artisan?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Service:</span> {booking.service}</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this service? *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-[#F59E0B] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 ? 'Poor' : 
                 rating === 2 ? 'Fair' : 
                 rating === 3 ? 'Good' : 
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write your review *
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !reviewText.trim()}
              className="px-4 py-2 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReviewRatingsModal;

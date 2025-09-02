import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, booking, loading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }
    
    onSubmit({
      rating,
      comment: comment.trim()
    });
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Rate Your Experience</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Service Details</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Service:</span> {booking.service}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Artisan:</span> {booking.artisan?.name || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
          </p>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''} selected` : 'Click to rate'}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this artisan..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || rating === 0 || !comment.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

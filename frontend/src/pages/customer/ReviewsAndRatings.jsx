import React, { useState, useContext } from "react";
import { Star, MessageSquare } from "lucide-react";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import { ReviewContext } from "../../context/ReviewContext";
import { useBooking } from "../../context/BookingContext"; 

const Reviews = () => {
  const { reviews, loading, error, addReview } = useContext(ReviewContext);
  const { bookings } = useBooking(); 
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter completed bookings for review
  const completedBookings = bookings?.filter((b) => b.status === "completed") || [];

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!selectedBooking) {
      setFormError("Please select a completed booking to review.");
      return;
    }
    if (rating === 0) {
      setFormError("Please select a rating.");
      return;
    }
    if (!reviewText.trim()) {
      setFormError("Please enter a comment.");
      return;
    }

    try {
      await addReview(
        {
          artisanId: selectedBooking.artisanId._id,
          bookingId: selectedBooking._id,
          rating,
          comment: reviewText,
        },
        localStorage.getItem("token") // or however you store token
      );
      setRating(0);
      setReviewText("");
      setSelectedBooking(null);
      setSuccess("Review submitted successfully!");
    } catch {
      setFormError("Failed to submit review. Please try again.");
    }
  };

  // Avatar with initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-[#6b2d11]" />
          Reviews & Ratings
        </h1>
        <p className="text-gray-600 mb-6">Leave feedback for artisans after completed work.</p>

        {/* Review Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Select Booking */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Select Completed Booking</label>
              <select
                value={selectedBooking?._id || ""}
                onChange={(e) => {
                  const booking = completedBookings.find((b) => b._id === e.target.value);
                  setSelectedBooking(booking);
                }}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
              >
                <option value="">Select a booking</option>
                {completedBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.service} - {new Date(booking.date).toLocaleDateString()} (Artisan: {booking.artisanId.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Rating</label>
              <div className="flex gap-1 mt-1">
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <Star
                      key={index}
                      className={`w-7 h-7 cursor-pointer transition-colors ${
                        (hoverRating || rating) > index ? "text-yellow-500" : "text-gray-300"
                      }`}
                      onClick={() => setRating(index + 1)}
                      onMouseEnter={() => setHoverRating(index + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Comment</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full mt-1 px-4 py-2 rounded-lg bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11] h-28 resize-none"
              />
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow-md transition"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
          {loading ? (
            <p className="text-gray-600">Loading reviews...</p>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Start by leaving feedback!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FDE1F7] text-[#6b2d11] flex items-center justify-center font-bold">
                    {getInitials(review.artisanId.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-[#6b2d11]">{review.artisanId.name}</h3>
                      <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Service: {review.bookingId.service}</p>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      {Array(5)
                        .fill()
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(review.rating) ? "text-yellow-500" : "text-gray-300"}`}
                            fill={i < Math.floor(review.rating) ? "currentColor" : "none"}
                          />
                        ))}
                      <span className="text-sm text-gray-600 ml-1">{review.rating}</span>
                    </div>
                    <p className="text-sm text-gray-700 italic">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Reviews;

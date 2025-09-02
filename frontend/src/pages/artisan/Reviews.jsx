// ... existing code ...
import React, { useState, useEffect } from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { Star, CheckCircle, User, RefreshCcw } from "lucide-react";
import { useReview } from "../../context/ReviewContext"; // Import useReview hook
import useAuth from "../../hooks/useAuth"; // Import useAuth to get user role

const ArtisanReviews = () => {
  const [filterRating, setFilterRating] = useState("all");
  const { user } = useAuth();
  const {
    reviews,
    loading,
    error,
    getArtisanReviews,
  } = useReview();

  useEffect(() => {
    if (user?.role === "artisan" && getArtisanReviews) {
      getArtisanReviews(); // Fetch reviews for the artisan on mount
    }
  }, [user, getArtisanReviews]);


  // Calculate stats safely
  const averageRating =
    reviews?.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  const uniqueReviewers = new Set(
    reviews?.map((r) => r.customerId?.name || "Anonymous") // Using customerId from populated data
  ).size;

  // Filter reviews
  const filteredReviews =
    filterRating === "all"
      ? reviews
      : reviews?.filter((r) => r.rating === parseInt(filterRating));

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              onClick={getArtisanReviews} // Call getArtisanReviews from context
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && <p className="text-gray-600">Loading reviews...</p>}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* Reviews Summary */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {reviews?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviewers</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {uniqueReviewers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {!loading && !error && (
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Review Feedback
            </h2>
            {reviews?.length === 0 ? (
              <p className="text-gray-500">No reviews available.</p>
            ) : (
              <div className="space-y-4">
                {filteredReviews?.map((review, index) => (
                  <div
                    key={review._id || index} // Use _id from MongoDB
                    className="border-b border-gray-100 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {review.customerId?.name?.charAt(0) || "C"} {/* Access customer name */}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {review.customerId?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (review.rating || 0)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {review.date // Using the date field from the Review model
                          ? new Date(review.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm ml-13">
                      <span className="font-medium">Service:</span> {review.bookingId?.service || "N/A"} - {review.comment || "No comment provided"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanReviews;
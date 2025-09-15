// frontend/src/pages/admin/ManageReviews.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Star, Eye, X, User, Mail, Phone, Calendar, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Search, Filter, Wrench, Users, TrendingUp, BarChart3 } from 'lucide-react';

const ManageReviews = () => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtisan, setSelectedArtisan] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'artisan'

  useEffect(() => {
    const fetchReviews = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await adminService.getAllReviews(accessToken);
        // Map the response data to match expected field names
        const mappedReviews = response.data.map(review => ({
          ...review,
          customer: review.customerId,
          artisan: review.artisanId,
          booking: review.bookingId,
          createdAt: review.date
        }));
        setReviews(mappedReviews);
      } catch (err) {
        setError(err.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [accessToken]);

  const handleView = (review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return <span className="text-gray-400">No rating</span>;
    
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    
    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  // Get unique artisans from reviews
  const getUniqueArtisans = () => {
    const artisans = reviews
      .filter(review => review.artisan)
      .map(review => ({
        id: review.artisan._id,
        name: review.artisan.name,
        service: review.artisan.artisanProfile?.service || 'N/A'
      }))
      .filter((artisan, index, self) => 
        index === self.findIndex(a => a.id === artisan.id)
      );
    return artisans;
  };

  // Filter and sort reviews
  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.artisan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Artisan filter
    if (selectedArtisan) {
      filtered = filtered.filter(review => review.artisan?._id === selectedArtisan);
    }

    // Rating filter
    if (ratingFilter) {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'artisan':
        filtered.sort((a, b) => (a.artisan?.name || '').localeCompare(b.artisan?.name || ''));
        break;
      default:
        break;
    }

    return filtered;
  };

  // Group reviews by artisan
  const getReviewsByArtisan = () => {
    const filtered = getFilteredReviews();
    const grouped = {};

    filtered.forEach(review => {
      if (review.artisan) {
        const artisanId = review.artisan._id;
        if (!grouped[artisanId]) {
          grouped[artisanId] = {
            artisan: review.artisan,
            reviews: [],
            averageRating: 0,
            totalReviews: 0
          };
        }
        grouped[artisanId].reviews.push(review);
      }
    });

    // Calculate averages for each artisan
    Object.keys(grouped).forEach(artisanId => {
      const artisanData = grouped[artisanId];
      artisanData.totalReviews = artisanData.reviews.length;
      artisanData.averageRating = artisanData.reviews.reduce((sum, review) => sum + review.rating, 0) / artisanData.totalReviews;
    });

    return grouped;
  };

  // Get statistics
  const getStatistics = () => {
    const filtered = getFilteredReviews();
    const totalReviews = filtered.length;
    const averageRating = totalReviews > 0 ? filtered.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: filtered.filter(review => review.rating === rating).length,
      percentage: totalReviews > 0 ? (filtered.filter(review => review.rating === rating).length / totalReviews) * 100 : 0
    }));

    return { totalReviews, averageRating, ratingDistribution };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  const filteredReviews = getFilteredReviews();
  const reviewsByArtisan = getReviewsByArtisan();
  const statistics = getStatistics();
  const uniqueArtisans = getUniqueArtisans();

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Reviews</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              List View
            </button>
            <button
              onClick={() => setViewMode('artisan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'artisan' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              By Artisan
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalReviews}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Average Rating</p>
                <p className="text-2xl font-bold text-green-900">{statistics.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Artisans Reviewed</p>
                <p className="text-2xl font-bold text-purple-900">{uniqueArtisans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Services</p>
                <p className="text-2xl font-bold text-orange-900">
                  {[...new Set(uniqueArtisans.map(a => a.service))].length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {statistics.ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center">
                <div className="w-8 text-sm font-medium text-gray-600">{rating}★</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Artisan</label>
              <select
                value={selectedArtisan}
                onChange={(e) => setSelectedArtisan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Artisans</option>
                {uniqueArtisans.map(artisan => (
                  <option key={artisan.id} value={artisan.id}>
                    {artisan.name} ({artisan.service})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
                <option value="artisan">By Artisan Name</option>
              </select>
            </div>
          </div>
        </div>
        
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews found.</p>
        ) : viewMode === 'artisan' ? (
          // Artisan Grouped View
          <div className="space-y-6">
            {Object.keys(reviewsByArtisan).length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reviews found for the selected filters.</p>
            ) : (
              Object.values(reviewsByArtisan).map((artisanData) => (
                <div key={artisanData.artisan._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Artisan Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{artisanData.artisan.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{artisanData.artisan.artisanProfile?.service || 'N/A'}</p>
                          <div className="flex items-center mt-1">
                            {renderStars(artisanData.averageRating)}
                            <span className="ml-2 text-sm text-gray-600">
                              ({artisanData.totalReviews} review{artisanData.totalReviews !== 1 ? 's' : ''})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {artisanData.averageRating.toFixed(1)}/5
                        </div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="divide-y divide-gray-200">
                    {artisanData.reviews.map((review) => (
                      <div key={review._id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                                <span className={`ml-2 text-sm font-medium ${getRatingColor(review.rating)}`}>
                                  {getRatingText(review.rating)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{review.customer?.name || 'Anonymous'}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{formatDate(review.createdAt)}</span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                "{review.comment}"
                              </p>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-mono">#{review._id.substring(0, 8)}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleView(review)}
                            className="ml-4 text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="View Review Details"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // List View
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Review ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Artisan</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Rating</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Comment</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800 font-mono">{review._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{review.customer?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div>
                        <div className="font-medium">{review.artisan?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {review.artisan?.artisanProfile?.service || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className={`ml-2 text-xs font-medium ${getRatingColor(review.rating)}`}>
                          {getRatingText(review.rating)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate" title={review.comment}>
                      {review.comment || 'No comment'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button 
                        onClick={() => handleView(review)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="View Review Details"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Review Details Modal */}
        {showViewModal && selectedReview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Review Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Review Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Review ID:</span>
                        <span className="ml-2 text-sm font-medium font-mono">{selectedReview._id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="ml-2 flex items-center">
                          {renderStars(selectedReview.rating)}
                          <span className={`ml-2 text-sm font-medium ${getRatingColor(selectedReview.rating)}`}>
                            {getRatingText(selectedReview.rating)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="ml-2 text-sm font-medium">
                          {formatDateTime(selectedReview.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Rating Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Overall Rating:</span>
                        <span className={`ml-2 text-lg font-bold ${getRatingColor(selectedReview.rating)}`}>
                          {selectedReview.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Quality:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.qualityRating ? `${selectedReview.qualityRating}/5` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Communication:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.communicationRating ? `${selectedReview.communicationRating}/5` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Timeliness:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.timelinessRating ? `${selectedReview.timelinessRating}/5` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Comment */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Review Comment
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedReview.comment || 'No comment provided'}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.customer?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Customer Since:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.customer?.createdAt ? formatDate(selectedReview.customer.createdAt) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Total Reviews:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.customer?.totalReviews || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artisan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Artisan Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.artisan?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.artisan?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReview.artisan?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Average Rating:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.artisan?.artisanProfile?.averageRating ? 
                            `${selectedReview.artisan.artisanProfile.averageRating.toFixed(1)}/5` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Total Reviews:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReview.artisan?.artisanProfile?.totalReviews || '0'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Service:</span>
                        <span className="ml-2 text-sm font-medium capitalize">
                          {selectedReview.artisan?.artisanProfile?.service || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                {selectedReview.booking && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <Calendar className="w-5 h-5 mr-2" />
                      Related Booking
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Booking ID:</span>
                          <span className="ml-2 text-sm font-medium font-mono">
                            {selectedReview.booking._id?.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Service:</span>
                          <span className="ml-2 text-sm font-medium capitalize">
                            {selectedReview.booking.service || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Service Date:</span>
                          <span className="ml-2 text-sm font-medium">
                            {formatDate(selectedReview.booking.serviceDate || selectedReview.booking.bookingDate)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedReview.booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedReview.booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedReview.booking.status || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="ml-2 text-sm font-medium">
                            ₦{selectedReview.booking.price || selectedReview.booking.amount || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    Review Timeline
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Review Created</p>
                        <p className="text-xs text-gray-500">{formatDateTime(selectedReview.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedReview.updatedAt && selectedReview.updatedAt !== selectedReview.createdAt && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Last Updated</p>
                          <p className="text-xs text-gray-500">{formatDateTime(selectedReview.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageReviews;

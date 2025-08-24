// frontend/src/pages/admin/ManageReviews.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Star } from 'lucide-react';

const ManageReviews = () => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await adminService.getAllReviews(accessToken);
        setReviews(data);
      } catch (err) {
        setError(err.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [accessToken]);

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

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reviews</h1>
        
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews found.</p>
        ) : (
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
                {reviews.map((review) => (
                  <tr key={review._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{review._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{review.customer?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{review.artisan?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 flex items-center">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <Star key={i + review.rating} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="ml-2 text-sm">({review.rating})</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{review.comment || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageReviews;

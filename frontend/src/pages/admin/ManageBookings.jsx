// frontend/src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Eye, X, Calendar, Clock, MapPin, Phone, Mail, User, Wrench, DollarSign, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';

const ManageBookings = () => {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await adminService.getAllBookings(accessToken);
        setBookings(data);
      } catch (err) {
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [accessToken]);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Bookings</h1>
        
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Booking ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Artisan</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Service Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800 font-mono">{booking._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{booking.customer?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{booking.artisan?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 capitalize">{booking.serviceDetails?.name || booking.service || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(booking.serviceDate || booking.bookingDate)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-semibold">
                      {formatCurrency(booking.price || booking.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button 
                        onClick={() => handleView(booking)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="View Booking Details"
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

        {/* View Booking Details Modal */}
        {showViewModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Booking Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Booking Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Booking ID:</span>
                        <span className="ml-2 text-sm font-medium font-mono">{selectedBooking._id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {getStatusIcon(selectedBooking.status)}
                          <span className="ml-1 capitalize">{selectedBooking.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Service Date:</span>
                        <span className="ml-2 text-sm font-medium">
                          {formatDate(selectedBooking.serviceDate || selectedBooking.bookingDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="ml-2 text-sm font-medium">
                          {formatDateTime(selectedBooking.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Payment Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="ml-2 text-lg font-bold text-green-600">
                          {formatCurrency(selectedBooking.price || selectedBooking.amount)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedBooking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedBooking.paymentStatus || 'Not specified'}
                        </span>
                      </div>
                      {selectedBooking.paymentMethod && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="ml-2 text-sm font-medium capitalize">
                            {selectedBooking.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
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
                        <span className="ml-2 text-sm font-medium">{selectedBooking.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedBooking.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedBooking.customer?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedBooking.customer?.state ? `${selectedBooking.customer.state}, Nigeria` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Customer Since:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedBooking.customer?.createdAt ? formatDate(selectedBooking.customer.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artisan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Wrench className="w-5 h-5 mr-2" />
                    Artisan Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedBooking.artisan?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedBooking.artisan?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedBooking.artisan?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedBooking.artisan?.state ? `${selectedBooking.artisan.state}, Nigeria` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedBooking.artisan?.artisanProfile?.averageRating ? 
                            `${selectedBooking.artisan.artisanProfile.averageRating.toFixed(1)}/5` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Wrench className="w-5 h-5 mr-2" />
                    Service Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Service Type:</span>
                          <span className="ml-2 text-sm font-medium capitalize">
                            {selectedBooking.serviceDetails?.name || selectedBooking.service || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Description:</span>
                          <span className="ml-2 text-sm font-medium">
                            {selectedBooking.description || selectedBooking.serviceDetails?.description || 'No description provided'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="ml-2 text-sm font-medium">
                            {selectedBooking.duration || selectedBooking.serviceDetails?.duration || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Urgency:</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBooking.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                            selectedBooking.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            selectedBooking.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {selectedBooking.urgency || 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Service Location */}
                    {selectedBooking.location && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Service Location</h4>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">{selectedBooking.location}</p>
                            {selectedBooking.address && (
                              <p className="text-xs text-gray-500 mt-1">{selectedBooking.address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {selectedBooking.specialInstructions && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedBooking.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Clock className="w-5 h-5 mr-2" />
                    Booking Timeline
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Booking Created</p>
                        <p className="text-xs text-gray-500">{formatDateTime(selectedBooking.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedBooking.updatedAt && selectedBooking.updatedAt !== selectedBooking.createdAt && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Last Updated</p>
                          <p className="text-xs text-gray-500">{formatDateTime(selectedBooking.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedBooking.completedAt && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Completed</p>
                          <p className="text-xs text-gray-500">{formatDateTime(selectedBooking.completedAt)}</p>
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

export default ManageBookings;
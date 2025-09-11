import React from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, MessageSquare, Star, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useMessage } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingPreviewModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onAccept, 
  onDecline, 
  isLoading 
}) => {
  const { user } = useAuth();
  const { setSelectedRecipient } = useMessage();
  const navigate = useNavigate();


  const handleChatWithCustomer = () => {
    if (booking?.customer) {
      // Set the selected recipient for the chat
      setSelectedRecipient({
        _id: booking.customer._id,
        name: booking.customer.name || 'Customer'
      });
      
      // Close the modal
      onClose();
      
      // Navigate to messages page
      if (user?.role === 'artisan') {
        navigate('/artisan-messages');
      } else {
        navigate('/messages');
      }
    }
  };

  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div>
            <h2 className="text-2xl font-bold">Job Request Details</h2>
            <p className="text-blue-100">Request ID: {booking._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
              {/* Service Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  Service Request
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Service Type</p>
                    <p className="text-blue-900 text-lg font-semibold">{booking.service}</p>
                  </div>
                  {booking.budget && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Budget</p>
                      <p className="text-blue-900 text-lg font-semibold flex items-center">
                        <DollarSign className="w-5 h-5 mr-1" />
                        {booking.budget}
                      </p>
                    </div>
                  )}
                </div>
                {booking.description && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-700 font-medium mb-2">Description</p>
                    <p className="text-blue-800 bg-white rounded-lg p-3 border border-blue-200">
                      {booking.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Full Name</p>
                    <p className="text-gray-900 text-lg font-semibold">{booking.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Phone Number</p>
                    <p className="text-gray-900 text-lg font-semibold flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-gray-600" />
                      {booking.customer?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 font-medium">Email Address</p>
                    <p className="text-gray-900 text-lg font-semibold flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-gray-600" />
                      {booking.customer?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Schedule & Timing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Preferred Date</p>
                    <p className="text-green-900 text-lg font-semibold">{formatDate(booking.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">Preferred Time</p>
                    <p className="text-green-900 text-lg font-semibold flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {formatTime(booking.date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {booking.location && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
                    <MapPin className="w-6 h-6 mr-2" />
                    Location Details
                  </h3>
                  <p className="text-orange-900 text-lg font-semibold">{booking.location}</p>
                </div>
              )}

              {/* Additional Information */}
              {booking.additionalDetails && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-900 mb-4">Additional Information</h3>
                  <p className="text-purple-900 text-lg leading-relaxed">{booking.additionalDetails}</p>
                </div>
              )}

              {/* Current Status */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h3>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    booking.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : booking.status === 'Accepted'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {booking.status === 'Pending' && <Clock className="w-4 h-4 mr-2" />}
                    {booking.status === 'Accepted' && <CheckCircle className="w-4 h-4 mr-2" />}
                    {booking.status === 'Declined' && <XCircle className="w-4 h-4 mr-2" />}
                    {booking.status}
                  </span>
                  <p className="text-gray-600 text-sm">
                    {booking.status === 'Pending' && 'Awaiting your response'}
                    {booking.status === 'Accepted' && 'You have accepted this request'}
                    {booking.status === 'Declined' && 'You have declined this request'}
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* Actions Footer */}
        {booking.status === 'Pending' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-blue-300 transition-colors font-medium"
              >
                Close
              </button>
              {booking.customer && (
                <button
                  onClick={handleChatWithCustomer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center shadow-md hover:shadow-lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat with Customer
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onDecline(booking._id)}
                disabled={isLoading}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Decline Request
                  </>
                )}
              </button>
              <button
                onClick={() => onAccept(booking._id)}
                disabled={isLoading || (!user?.kycVerified || user?.kycStatus !== 'approved')}
                className={`px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-md hover:shadow-lg ${
                  (!user?.kycVerified || user?.kycStatus !== 'approved') 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={(!user?.kycVerified || user?.kycStatus !== 'approved') ? 'KYC verification required to accept jobs' : ''}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Non-pending status footer */}
        {booking.status !== 'Pending' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-blue-300 transition-colors font-medium"
              >
                Close
              </button>
              {booking.customer && (
                <button
                  onClick={handleChatWithCustomer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center shadow-md hover:shadow-lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat with Customer
                </button>
              )}
            </div>
            <div className="text-gray-600">
              <p className="text-sm font-medium">
                {booking.status === 'Accepted' ? 'Request Accepted' : 'Request Declined'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPreviewModal;
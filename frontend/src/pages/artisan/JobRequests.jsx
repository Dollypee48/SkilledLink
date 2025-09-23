import React, { useState, useEffect, useContext } from "react"; // Added useContext
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { CalendarCheck, CheckCircle, XCircle, Eye } from "lucide-react";
import { BookingContext } from "../../context/BookingContext"; // Import BookingContext
import useAuth from "../../hooks/useAuth"; // Import useAuth to ensure user role is checked
import BookingPreviewModal from "../../components/BookingPreviewModal";

const ArtisanRequests = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState({}); // Track loading state for individual actions
  const [successMessage, setSuccessMessage] = useState(""); // Track success messages
  const [selectedBooking, setSelectedBooking] = useState(null); // For booking preview
  const [showBookingModal, setShowBookingModal] = useState(false); // For booking preview modal
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 5; // Items per page
  const { user } = useAuth(); // Get user to check role
  const {
    artisanBookings: requests, // Renamed for clarity, assuming BookingContext provides artisanBookings
    serviceProfileBookings, // Service profile bookings
    loading,
    error,
    fetchArtisanBookings, // Assuming a function to fetch artisan bookings
    fetchServiceProfileBookings, // Function to fetch service profile bookings
    updateBookingStatus, // Function to update booking status
    updateServiceProfileBookingStatus, // Function to update service profile booking status
  } = useContext(BookingContext);

  // Validate status values - only Pending, Accepted, Declined
  const validStatuses = ["Pending", "Accepted", "Declined"];
  
  const validateStatus = (status) => {
    return validStatuses.includes(status);
  };

  // Normalize status to one of the three valid statuses
  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    
    const normalized = status.trim();
    
    // If it's already one of our three valid statuses, return it
    if (validStatuses.includes(normalized)) {
      return normalized;
    }
    
    // Map other statuses to our three valid ones
    switch (normalized) {
      case "Completed":
      case "Cancelled":
      case "Pending Confirmation":
        return "Accepted"; // Treat completed/cancelled as accepted for display
      default:
        return "Pending"; // Default to Pending for any unknown status
    }
  };

  useEffect(() => {
    if (user?.role === "artisan") {
      if (fetchArtisanBookings) {
        fetchArtisanBookings();
      }
      if (fetchServiceProfileBookings) {
        fetchServiceProfileBookings();
      }
    }
  }, [user, fetchArtisanBookings, fetchServiceProfileBookings]); // Depend on user and both fetch functions

  // Combine both types of bookings
  const allBookings = [
    ...(requests || []).map(booking => ({ ...booking, type: 'regular' })),
    ...(serviceProfileBookings || []).map(booking => ({ ...booking, type: 'serviceProfile' }))
  ];

  const acceptedRequests = allBookings?.filter((r) => normalizeStatus(r.status) === "Accepted").length || 0;
  const declinedRequests = allBookings?.filter((r) => normalizeStatus(r.status) === "Declined").length || 0;
  const totalRequests = allBookings?.length || 0;

  const filteredRequests = (filterStatus === "all" ? allBookings : allBookings?.filter((r) => normalizeStatus(r.status) === filterStatus))
    ?.sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return dateB - dateA;
    });

  // Pagination logic
  const totalPages = Math.ceil((filteredRequests?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests?.slice(startIndex, endIndex) || [];

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Debug logging removed for production

  // Accept request
  const handleAccept = async (id) => {
    // Find the booking to determine its type
    const booking = allBookings.find(b => b._id === id);
    const type = booking?.type || 'regular';
    try {
      // Check KYC verification status before accepting
      if (!user?.kycVerified || user?.kycStatus !== 'approved') {
        setSuccessMessage("KYC verification required to accept jobs. Please complete your identity verification first.");
        setTimeout(() => setSuccessMessage(""), 5000);
        return;
      }

      setActionLoading(prev => ({ ...prev, [id]: 'accepting' }));
      
      const newStatus = "Accepted";
      if (!validateStatus(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      console.log(`🔄 Accepting booking ${id} with status: ${newStatus}`);
      const updatedBooking = type === 'serviceProfile' 
        ? await updateServiceProfileBookingStatus(id, newStatus)
        : await updateBookingStatus(id, newStatus);
      console.log(`✅ Booking updated:`, updatedBooking);
      
      // Verify the status was updated correctly
      if (updatedBooking.status !== newStatus) {
        console.warn(`⚠️ Status mismatch: expected ${newStatus}, got ${updatedBooking.status}`);
      }
      
      // Close modal immediately after successful update
      setShowBookingModal(false);
      setSelectedBooking(null);
      
      // Refresh bookings after update
      await fetchArtisanBookings();
      
      setSuccessMessage("Booking request accepted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error accepting request:', error);
      
      // Check if it's a KYC error
      if (error.response?.data?.kycRequired) {
        setSuccessMessage("KYC verification required to accept jobs. Please complete your identity verification first.");
      }
      // Check if it's a job limit error
      else if (error.response?.data?.limitReached) {
        setSuccessMessage("Job acceptance limit reached! Upgrade to Premium for unlimited job acceptances.");
      } else {
        setSuccessMessage("Error accepting request. Please try again.");
      }
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Decline request
  const handleDecline = async (id) => {
    // Find the booking to determine its type
    const booking = allBookings.find(b => b._id === id);
    const type = booking?.type || 'regular';
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'declining' }));
      
      const newStatus = "Declined";
      if (!validateStatus(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      console.log(`🔄 Declining booking ${id} with status: ${newStatus}`);
      const updatedBooking = type === 'serviceProfile' 
        ? await updateServiceProfileBookingStatus(id, newStatus)
        : await updateBookingStatus(id, newStatus);
      console.log(`✅ Booking updated:`, updatedBooking);
      
      // Verify the status was updated correctly
      if (updatedBooking.status !== newStatus) {
        console.warn(`⚠️ Status mismatch: expected ${newStatus}, got ${updatedBooking.status}`);
      }
      
      // Close modal immediately after successful update
      setShowBookingModal(false);
      setSelectedBooking(null);
      
      // Refresh bookings after update
      await fetchArtisanBookings();
      
      setSuccessMessage("Booking request declined successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error declining request:', error);
      setSuccessMessage("Error declining request. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Handler for viewing booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // Handler for closing booking modal
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              onClick={() => {
                if (fetchArtisanBookings) fetchArtisanBookings();
                if (fetchServiceProfileBookings) fetchServiceProfileBookings();
              }} // Refresh both types of bookings
            >
              Refresh
            </button>
          </div>
        </div>

        {/* KYC Verification Warning */}
        {(!user?.kycVerified || user?.kycStatus !== 'approved') && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  KYC Verification Required
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  You need to complete your identity verification before you can accept job requests.
                </p>
                <button
                  onClick={() => window.location.href = '/artisan-settings'}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Complete KYC Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading and Error States */}
        {loading && <p className="text-gray-600">Loading requests...</p>}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}
        {successMessage && (
          <div className={`p-3 rounded mb-4 ${
            successMessage.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {successMessage}
          </div>
        )}

        {/* Requests Summary */}
        {!loading && !error && ( // Only show if not loading and no error
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-xl font-semibold text-gray-900">{totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Accepted Requests</p>
                  <p className="text-xl font-semibold text-gray-900">{acceptedRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Declined Requests</p>
                  <p className="text-xl font-semibold text-gray-900">{declinedRequests}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {!loading && !error && ( // Only show if not loading and no error
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Request List</h2>
            {filteredRequests?.length === 0 ? (
              <p className="text-gray-500">No requests available.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700">
                    <th className="p-3 font-medium">Request ID</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Service</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests?.map((request) => (
                    <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-600">{request._id}</td>
                      <td className="p-3 text-gray-600">{request.customer?.name || `Customer ${request._id}`}</td>
                      <td className="p-3 text-gray-600">{request.service || request.serviceName}</td>
                      <td className="p-3 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.type === 'serviceProfile' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {request.type === 'serviceProfile' ? 'Service' : 'Regular'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{new Date(request.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        {(() => {
                          const originalStatus = request.status;
                          const normalizedStatus = normalizeStatus(originalStatus);
                          
                          switch (normalizedStatus) {
                            case "Accepted":
                              return (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                  Accepted
                                </span>
                              );
                            case "Pending":
                              return (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                  Pending
                                </span>
                              );
                            case "Declined":
                              return (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                  Declined
                                </span>
                              );
                            default:
                              return (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                  Pending
                                </span>
                              );
                          }
                        })()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {filteredRequests && filteredRequests.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 px-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-[#151E3D] border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-[#151E3D] border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Booking Preview Modal */}
        <BookingPreviewModal
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          booking={selectedBooking}
          onAccept={handleAccept}
          onDecline={handleDecline}
          isLoading={selectedBooking ? actionLoading[selectedBooking._id] : false}
          isAccepting={selectedBooking ? actionLoading[selectedBooking._id] === 'accepting' : false}
          isDeclining={selectedBooking ? actionLoading[selectedBooking._id] === 'declining' : false}
        />
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanRequests;

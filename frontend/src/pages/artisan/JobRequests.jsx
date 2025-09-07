import React, { useState, useEffect, useContext } from "react"; // Added useContext
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { CalendarCheck, CheckCircle, XCircle } from "lucide-react";
import { BookingContext } from "../../context/BookingContext"; // Import BookingContext
import useAuth from "../../hooks/useAuth"; // Import useAuth to ensure user role is checked

const ArtisanRequests = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState({}); // Track loading state for individual actions
  const [successMessage, setSuccessMessage] = useState(""); // Track success messages
  const { user } = useAuth(); // Get user to check role
  const {
    artisanBookings: requests, // Renamed for clarity, assuming BookingContext provides artisanBookings
    loading,
    error,
    fetchArtisanBookings, // Assuming a function to fetch artisan bookings
    updateBookingStatus, // Assuming a function to update booking status
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
    if (user?.role === "artisan" && fetchArtisanBookings) {
      fetchArtisanBookings();
    }
  }, [user, fetchArtisanBookings]); // Depend on user and fetchArtisanBookings

  const acceptedRequests = requests?.filter((r) => normalizeStatus(r.status) === "Accepted").length || 0;
  const declinedRequests = requests?.filter((r) => normalizeStatus(r.status) === "Declined").length || 0;
  const totalRequests = requests?.length || 0;

  const filteredRequests =
    filterStatus === "all" ? requests : requests?.filter((r) => normalizeStatus(r.status) === filterStatus);

  // Debug logging to check booking data
  console.log('All requests:', requests);
  console.log('Filtered requests:', filteredRequests);

  // Accept request
  const handleAccept = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'accepting' }));
      console.log('Accepting booking with ID:', id);
      
      const newStatus = "Accepted";
      if (!validateStatus(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      const updatedBooking = await updateBookingStatus(id, newStatus);
      console.log('Updated booking:', updatedBooking);
      
      // Verify the status was updated correctly
      if (updatedBooking.status !== newStatus) {
        console.warn('Status mismatch after update. Expected:', newStatus, 'Got:', updatedBooking.status);
      }
      
      await fetchArtisanBookings(); // Refresh bookings after update
      setSuccessMessage("Booking request accepted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error accepting request:', error);
      setSuccessMessage("Error accepting request. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Decline request
  const handleDecline = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'declining' }));
      console.log('Declining booking with ID:', id);
      
      const newStatus = "Declined";
      if (!validateStatus(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      const updatedBooking = await updateBookingStatus(id, newStatus);
      console.log('Updated booking:', updatedBooking);
      
      // Verify the status was updated correctly
      if (updatedBooking.status !== newStatus) {
        console.warn('Status mismatch after update. Expected:', newStatus, 'Got:', updatedBooking.status);
      }
      
      await fetchArtisanBookings(); // Refresh bookings after update
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
              onClick={fetchArtisanBookings} // Refresh from context
            >
              Refresh
            </button>
          </div>
        </div>

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
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Status</th>
                    {filteredRequests?.some(r => r.status === "Pending") && (
                      <th className="p-3 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests?.map((request) => (
                    <tr
                      key={request._id} // Use _id from MongoDB
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-gray-600">{request._id}</td>
                      <td className="p-3 text-gray-600">{request.customer?.name || `Customer ${request._id}`}</td> {/* Access customer name */}
                      <td className="p-3 text-gray-600">{request.service}</td>
                      <td className="p-3 text-gray-600">{new Date(request.date).toLocaleDateString()}</td> {/* Format date */}
                      <td className="p-3">
                        {(() => {
                          const originalStatus = request.status;
                          const normalizedStatus = normalizeStatus(originalStatus);
                          console.log('Request status for', request._id, ':', 'Original:', originalStatus, 'Normalized:', normalizedStatus);
                          
                          // Only handle Pending, Accepted, Declined
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
                              // This should never happen with normalizeStatus, but just in case
                              return (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                  Pending
                                </span>
                              );
                          }
                        })()}
                      </td>
                      {filteredRequests?.some(r => normalizeStatus(r.status) === "Pending") && (
                        <td className="p-3">
                          {normalizeStatus(request.status) === "Pending" ? (
                            <div className="flex space-x-2">
                              <button
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                                  actionLoading[request._id] === 'accepting'
                                    ? 'bg-green-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                onClick={() => handleAccept(request._id)}
                                disabled={actionLoading[request._id] === 'accepting'}
                              >
                                {actionLoading[request._id] === 'accepting' ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                    Accepting...
                                  </>
                                ) : (
                                  'Accept'
                                )}
                              </button>
                              <button
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                                  actionLoading[request._id] === 'declining'
                                    ? 'bg-red-400 text-white cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                                onClick={() => handleDecline(request._id)}
                                disabled={actionLoading[request._id] === 'declining'}
                              >
                                {actionLoading[request._id] === 'declining' ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                    Declining...
                                  </>
                                ) : (
                                  'Decline'
                                )}
                              </button>
                            </div>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanRequests;

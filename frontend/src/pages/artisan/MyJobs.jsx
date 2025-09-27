import React, { useState, useContext, useEffect, useRef } from "react"; // Added useContext, useEffect, and useRef
import { CalendarCheck, CheckCircle, Clock, RefreshCw, Eye, MapPin, Phone, Calendar, Clock as ClockIcon, FileText, MessageCircle, X, Check, Send, Smile } from "lucide-react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { BookingContext } from "../../context/BookingContext"; // Import BookingContext instead of ArtisanContext
import useAuth from "../../hooks/useAuth"; // Import useAuth to potentially refresh data
import { BookingService } from "../../services/BookingService"; // Import BookingService
import { ServiceProfileBookingService } from "../../services/serviceProfileBookingService"; // Import ServiceProfileBookingService
import { messageService } from "../../services/messageService"; // Import message service
import { useNotification } from "../../context/NotificationContext"; // Import notification context
import { useMessage } from "../../context/MessageContext"; // Import MessageContext for chat functionality
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Chat Interface Component
const ChatInterface = ({ customer, onClose, messages, loading, onSendMessage, onRefresh }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await onSendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[400px] bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-center font-medium">No messages yet</p>
            <p className="text-center text-sm text-gray-400">Start the conversation with {customer.name || 'this customer'}!</p>
            <button
              onClick={onRefresh}
              className="mt-3 px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.filter(message => message && message.content).map((message) => {
            // Use the same logic as the main message page
            const isOwnMessage = message?.sender?._id === user?._id;
            const messageTime = message?.timestamp || message?.createdAt;
            
            return (
            <div
              key={message._id + (message.timestamp || message.createdAt)}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar for received messages only */}
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {message?.sender?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`relative group ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white rounded-br-md' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  } ${message.isOptimistic ? 'opacity-70' : ''}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message?.content || ''}</p>
                    
                    {/* Message time */}
                    <div className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {messageTime ? new Date(messageTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Just now'}
                      {message.isOptimistic && ' (Sending...)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${customer.name || 'customer'}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const MyJobs = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingJob, setUpdatingJob] = useState(null); // Track which job is being updated
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [selectedBooking, setSelectedBooking] = useState(null); // Selected booking for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [showChatModal, setShowChatModal] = useState(false); // Chat modal visibility
  const [selectedCustomerForChat, setSelectedCustomerForChat] = useState(null); // Selected customer for chat
  const [chatMessages, setChatMessages] = useState([]); // Chat messages
  const [chatLoading, setChatLoading] = useState(false); // Chat loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 5; // Items per page
  const { user } = useAuth(); // Use useAuth to get user info
  const { 
    artisanBookings, 
    serviceProfileBookings, 
    loading, 
    error, 
    fetchArtisanBookings, 
    fetchServiceProfileBookings,
    updateBookingStatus,
    updateServiceProfileBookingStatus
  } = useContext(BookingContext); // Get data from BookingContext
  const { notifyJobStatusChange, showNotification } = useNotification(); // Get notification functions
  const { selectRecipient } = useMessage(); // Get selectRecipient for chat functionality
  const navigate = useNavigate(); // Get navigate for navigation

  useEffect(() => {
    // Fetch both types of bookings when component mounts or user changes
    if (user && user.role === 'artisan') {
      if (fetchArtisanBookings) {
        fetchArtisanBookings();
      }
      if (fetchServiceProfileBookings) {
        fetchServiceProfileBookings();
      }
    }
  }, [user, fetchArtisanBookings, fetchServiceProfileBookings]);

  // Function to handle chat with customer
  const handleChatWithCustomer = async (booking) => {
    if (booking.customer && booking.customer._id) {
      setSelectedCustomerForChat(booking.customer);
      setShowChatModal(true);
      await loadChatConversation(booking.customer._id);
    } else {
      showNotification('error', 'Customer information not available for chat');
    }
  };

  // Load chat conversation
  const loadChatConversation = async (customerId) => {
    try {
      setChatLoading(true);
      const messages = await messageService.getConversation(customerId);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedCustomerForChat) return;

    try {
      // Create optimistic message with correct structure
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageText,
        sender: { _id: user._id, name: user.name },
        recipient: selectedCustomerForChat._id,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      // Optimistically add message to UI
      setChatMessages(prev => [...prev, tempMessage]);

      // Send message to server
      await messageService.sendMessage(selectedCustomerForChat._id, messageText);
      
      // Refresh conversation
      await loadChatConversation(selectedCustomerForChat._id);
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('error', 'Failed to send message');
    }
  };

  // Close chat modal
  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedCustomerForChat(null);
    setChatMessages([]);
  };

  // Function to request customer confirmation for job completion
  const handleRequestCustomerConfirmation = async (bookingId) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to request customer confirmation for this job? The customer will be notified to review and confirm the work.');
    
    if (!isConfirmed) {
      return;
    }

    try {
      setUpdatingJob(bookingId);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Find the booking to get customer ID
      const booking = allBookings.find(b => b._id === bookingId);
      if (!booking) {
        alert('Booking not found');
        return;
      }

      // Check if customer data exists and has proper structure
      if (!booking.customer || !booking.customer._id) {
        console.error('Customer data not properly populated:', booking.customer);
        alert('Customer information not available. Please try refreshing the page.');
        return;
      }

      // Send confirmation message to customer
      try {
        const messageContent = `Hi ${booking.customer.name || 'there'}! I have completed the work for your ${booking.service} job. Please confirm if you are satisfied with the work before I mark it as completed. If everything is good, please reply with "CONFIRMED" or let me know if any adjustments are needed.`;
        
        await messageService.sendMessage(
          booking.customer._id, 
          messageContent, 
          null, 
          null, 
          token
        );
        
        // Show success notification
        showNotification('success', 'Confirmation message sent to customer successfully!');
        
      } catch (messageError) {
        console.error('Error sending message:', messageError);
        showNotification('error', 'Failed to send confirmation message to customer. Please try again.');
      }

      // Change status to "Pending Confirmation" - wait for customer confirmation
      if (booking.type === 'serviceProfile') {
        await ServiceProfileBookingService.updateServiceProfileBookingStatus(bookingId, 'Pending Confirmation', token);
      } else {
      await BookingService.updateBookingStatus(bookingId, 'Pending Confirmation', token);
      }
      
      // Refresh the bookings to show updated status
      if (fetchArtisanBookings) {
        fetchArtisanBookings();
      }
      if (fetchServiceProfileBookings) {
        fetchServiceProfileBookings();
      }
      
      // Notify about job status change
      notifyJobStatusChange(booking, 'Pending Confirmation', 'artisan');
      
      // Show success notification
      showNotification('success', 'Customer confirmation requested. Waiting for customer to review and confirm the work.');
      
      setSuccessMessage('Customer confirmation requested. The customer has been notified to review the work.');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error in completion process:', error);
      alert(error.message || 'Failed to process completion request');
    } finally {
      setUpdatingJob(null);
    }
  };


  // Function to view booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Function to actually mark job as completed (after customer confirmation)
  const handleConfirmCompletion = async (bookingId) => {
    const isConfirmed = window.confirm('Has the customer confirmed they are satisfied with the work? This will mark the job as completed.');
    
    if (!isConfirmed) {
      return;
    }

    try {
      setUpdatingJob(bookingId);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Find the booking to determine its type
      const booking = allBookings.find(b => b._id === bookingId);
      if (!booking) {
        alert('Booking not found');
        return;
      }

      if (booking.type === 'serviceProfile') {
        await ServiceProfileBookingService.updateServiceProfileBookingStatus(bookingId, 'Completed', token);
      } else {
      await BookingService.updateBookingStatus(bookingId, 'Completed', token);
      }
      
      // Refresh the bookings to show updated status
      if (fetchArtisanBookings) {
        fetchArtisanBookings();
      }
      if (fetchServiceProfileBookings) {
        fetchServiceProfileBookings();
      }
      
      // Notify about job status change
        notifyJobStatusChange(booking, 'Completed', 'artisan');
      
      setSuccessMessage('Job marked as completed successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error marking job as completed:', error);
      alert(error.message || 'Failed to mark job as completed');
    } finally {
      setUpdatingJob(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
      case "Pending Confirmation":
        return "bg-orange-100 text-orange-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Declined":
        return "bg-red-100 text-red-700";
      case "Cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  // Combine both types of bookings
  const allBookings = [
    ...(artisanBookings || []).map(booking => ({ ...booking, type: 'regular' })),
    ...(serviceProfileBookings || []).map(booking => ({ ...booking, type: 'serviceProfile' }))
  ];

  const filteredBookings = (filterStatus === "all"
    ? allBookings
    : allBookings.filter((b) => b.status === filterStatus))
    ?.sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return dateB - dateA;
    });

  // Pagination logic
  const totalPages = Math.ceil((filteredBookings?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings?.slice(startIndex, endIndex) || [];

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

  const completedJobs = allBookings?.filter((b) => b.status === "Completed").length || 0;
  const pendingJobs = allBookings?.filter((b) => b.status === "Pending").length || 0;
  const totalJobs = allBookings?.length || 0;

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">In Progress</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
              <option value="Completed">Completed</option>
              <option value="Declined">Declined</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              onClick={() => {
                if (fetchArtisanBookings) fetchArtisanBookings();
                if (fetchServiceProfileBookings) fetchServiceProfileBookings();
              }} // Fetch both types of bookings
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-500 hover:text-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading and Error States */}
        {loading && <p className="text-gray-600">Loading jobs...</p>}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* Jobs Summary */}
        {!loading && !error && ( // Only show if not loading and no error
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="text-xl font-semibold text-gray-900">{totalJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                  <p className="text-xl font-semibold text-gray-900">{completedJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Progress Jobs</p>
                  <p className="text-xl font-semibold text-gray-900">{allBookings?.filter((b) => b.status === "Accepted").length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Jobs</p>
                  <p className="text-xl font-semibold text-gray-900">{pendingJobs}</p>
                </div>
              </div>
            </div>


          </div>
        )}



        {/* Jobs Table */}
        {!loading && !error && ( // Only show if not loading and no error
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Job List</h2>
            {filteredBookings.length === 0 ? (
              <p className="text-gray-500">No jobs available.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700">
                    <th className="p-3 font-medium">Job ID</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Service</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-600">{booking._id}</td>
                      <td className="p-3 text-gray-600">{booking.customer?.name || "N/A"}</td>
                      <td className="p-3 text-gray-600">{booking.service || booking.serviceName}</td>
                      <td className="p-3 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.type === 'serviceProfile' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.type === 'serviceProfile' ? 'Service' : 'Regular'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status === 'Accepted' ? 'In Progress' : booking.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                            onClick={() => handleViewBooking(booking)}
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          {/* Show "Mark as Completed" button for pending confirmation jobs */}
                          {booking.status === "Pending Confirmation" && (
                            <button
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                updatingJob === booking._id
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              onClick={() => handleConfirmCompletion(booking._id)}
                              disabled={updatingJob === booking._id}
                            >
                              {updatingJob === booking._id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" /> Updating...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" /> Mark as Completed
                                </>
                              )}
                            </button>
                          )}
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {filteredBookings && filteredBookings.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 px-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} jobs
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
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                    <p className="text-sm text-gray-500">Complete job information</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/10 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {selectedBooking.customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedBooking.customer?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.customer?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{selectedBooking.contactPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-semibold text-gray-800">{selectedBooking.service || selectedBooking.serviceName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selectedBooking.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <ClockIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-gray-800">{selectedBooking.time || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">
                          {selectedBooking.urgencyLevel?.charAt(0)?.toUpperCase() || 'N'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Urgency Level</p>
                        <p className="font-semibold text-gray-800 capitalize">{selectedBooking.urgencyLevel || 'Normal'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-semibold text-gray-800">{selectedBooking.status}</p>
                      </div>
                    </div>
                    {selectedBooking.type === 'serviceProfile' && (
                      <>
                        {selectedBooking.hourlyRate && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">₦</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Hourly Rate</p>
                              <p className="font-semibold text-gray-800">₦{selectedBooking.hourlyRate.toLocaleString()}/hour</p>
                            </div>
                          </div>
                        )}
                        {selectedBooking.estimatedDuration && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <ClockIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Estimated Duration</p>
                              <p className="font-semibold text-gray-800">{selectedBooking.estimatedDuration} hours</p>
                            </div>
                          </div>
                        )}
                        {selectedBooking.totalAmount && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">₦</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Amount</p>
                              <p className="font-semibold text-gray-800">₦{selectedBooking.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Job Description & Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border-l-4 border-purple-200">
                      {selectedBooking.description || 'No description provided'}
                    </p>
                  </div>
                  {(selectedBooking.specialRequirements || selectedBooking.additionalDetails) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Special Requirements</p>
                      <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-200">
                        {selectedBooking.specialRequirements || selectedBooking.additionalDetails}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Preferred Contact Method</p>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-200 capitalize">
                      {selectedBooking.preferredContactMethod || 'Phone'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                {/* Chat Button - Always visible */}
                <button
                  onClick={() => handleChatWithCustomer(selectedBooking)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Customer</span>
                </button>
                
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
                
                
                {/* Show Request Confirmation button for accepted jobs */}
                {selectedBooking.status === "Accepted" && (
                  <button
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                      updatingJob === selectedBooking._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                    onClick={() => handleRequestCustomerConfirmation(selectedBooking._id)}
                    disabled={updatingJob === selectedBooking._id}
                  >
                    {updatingJob === selectedBooking._id ? (
                      <>
                        <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 inline mr-2" />
                        Job Completed - Request Confirmation from {selectedBooking.customer?.name || 'Customer'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedCustomerForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[500px] flex flex-col">
            {/* Chat Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#151E3D]">Chat with Customer</h2>
                  <p className="text-sm text-gray-500">{selectedCustomerForChat.name}</p>
                </div>
              </div>
              <button
                onClick={closeChatModal}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Chat Modal Content */}
            <div className="flex-1 flex flex-col">
              <ChatInterface 
                customer={selectedCustomerForChat}
                onClose={closeChatModal}
                messages={chatMessages}
                loading={chatLoading}
                onSendMessage={handleSendMessage}
                onRefresh={() => {
                  if (selectedCustomerForChat?._id) {
                    loadChatConversation(selectedCustomerForChat._id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </ArtisanLayout>
  );
};

export default MyJobs; 

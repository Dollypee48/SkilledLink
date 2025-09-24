import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext'; // Assuming you have a MessageContext
import { useAuth } from '../../context/AuthContext';
import { XCircle, Star, MessageSquare, Send, X } from 'lucide-react';
import ReviewRatingsModal from './ReviewRatingsModal';
import { messageService } from '../../services/messageService';

// Chat Interface Component
const ChatInterface = ({ artisan, onClose, messages, loading, onSendMessage, onRefresh }) => {
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation with {artisan.name}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === user._id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`relative group ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                      isOwnMessage 
                        ? 'bg-[#151E3D] text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    } ${message.isOptimistic ? 'opacity-70' : ''}`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`text-xs mt-2 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${artisan.name || 'artisan'}...`}
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

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  const navigate = useNavigate();
  const { selectRecipient } = useMessage();
  const { user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  if (!isOpen || !booking) return null;

  // Load chat conversation
  const loadChatConversation = async (artisanId) => {
    try {
      setChatLoading(true);
      const messages = await messageService.getConversation(artisanId);
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
    if (!messageText.trim() || !booking?.artisan) return;

    try {
      // Create optimistic message with correct structure
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageText,
        sender: { _id: user._id, name: user.name },
        recipient: booking.artisan._id,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      // Optimistically add message to UI
      setChatMessages(prev => [...prev, tempMessage]);

      // Send message to server
      await messageService.sendMessage(booking.artisan._id, messageText);
      
      // Refresh conversation
      await loadChatConversation(booking.artisan._id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // Close chat modal
  const closeChatModal = () => {
    setShowChatModal(false);
    setChatMessages([]);
  };

  const handleChatWithArtisan = async () => {
    if (booking?.artisan) {
      console.log('Chat with artisan clicked:', booking.artisan);
      setShowChatModal(true);
      await loadChatConversation(booking.artisan._id);
    }
  };

  const handleReviewAndRating = () => {
    setIsReviewModalOpen(true); // Open the review modal
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800'; // Changed to blue for accepted/in progress
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-[#151E3D] mb-6 border-b pb-3">Booking Details</h2>

        <div className="space-y-4 text-gray-700">
          <p><span className="font-semibold">Artisan:</span> {booking.artisan?.name || 'N/A'}</p>
          <p><span className="font-semibold">Service:</span> {booking.service || booking.serviceName}</p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
          <p><span className="font-semibold">Time:</span> {booking.time}</p>
          <p>
            <span className="font-semibold">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status === 'Accepted' ? 'In Progress' : booking.status}
            </span>
          </p>
          {booking.description && <p><span className="font-semibold">Description:</span> {booking.description}</p>}
          {booking.type === 'serviceProfile' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-3">💰 Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {booking.hourlyRate && (
                      <p className="text-green-700"><span className="font-semibold">Hourly Rate:</span> ₦{booking.hourlyRate.toLocaleString()}/hour</p>
                    )}
                    {booking.estimatedDuration && (
                      <p className="text-green-700"><span className="font-semibold">Total Hours Booked:</span> <span className="font-bold text-lg">{booking.estimatedDuration} hours</span></p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {booking.totalAmount && (
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-green-800 font-bold text-xl text-center">Total Amount</p>
                        <p className="text-green-900 font-bold text-2xl text-center">₦{booking.totalAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                {booking.estimatedDuration && booking.hourlyRate && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                    <p className="text-green-800 text-sm text-center">
                      <span className="font-semibold">Calculation:</span> {booking.estimatedDuration} hours × ₦{booking.hourlyRate.toLocaleString()}/hour = ₦{booking.totalAmount?.toLocaleString() || (booking.estimatedDuration * booking.hourlyRate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {booking.specialRequirements && (
                <p><span className="font-semibold">Special Requirements:</span> {booking.specialRequirements}</p>
              )}
            </>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {booking.artisan && ( // Only show chat button if artisan exists
            <button
              onClick={handleChatWithArtisan}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with {booking.artisan.name}
            </button>
          )}
          <button
            onClick={handleReviewAndRating}
            disabled={booking.status !== 'Completed' && booking.status !== 'Pending Confirmation'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              booking.status === 'Completed' || booking.status === 'Pending Confirmation'
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white focus:ring-[#F59E0B]'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={
              booking.status !== 'Completed' && booking.status !== 'Pending Confirmation'
                ? 'Review will be available after service completion'
                : 'Submit a review for this service'
            }
          >
            <Star className="w-4 h-4" />
            {booking.status === 'Completed' || booking.status === 'Pending Confirmation'
              ? 'Review & Ratings'
              : 'Review (Not Available)'
            }
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Review & Ratings Modal */}
      <ReviewRatingsModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        booking={booking}
      />

      {/* Chat Modal */}
      {showChatModal && booking?.artisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[500px] flex flex-col">
            {/* Chat Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#151E3D]">Chat with Artisan</h2>
                  <p className="text-sm text-gray-500">{booking.artisan.name}</p>
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
                artisan={booking.artisan}
                onClose={closeChatModal}
                messages={chatMessages}
                loading={chatLoading}
                onSendMessage={handleSendMessage}
                onRefresh={() => {
                  if (booking?.artisan?._id) {
                    loadChatConversation(booking.artisan._id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default BookingDetailsModal;

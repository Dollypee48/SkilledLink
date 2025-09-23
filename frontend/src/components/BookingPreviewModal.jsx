import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, MessageSquare, Star, DollarSign, CheckCircle, XCircle, Send } from 'lucide-react';
import { useMessage } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';

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
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
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

const BookingPreviewModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onAccept, 
  onDecline, 
  isLoading,
  isAccepting,
  isDeclining
}) => {
  const { user } = useAuth();
  const { selectRecipient } = useMessage();
  const navigate = useNavigate();
  
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);


  const handleChatWithCustomer = async () => {
    if (booking?.customer) {
      console.log('Chat with customer clicked:', booking.customer);
      setShowChatModal(true);
      await loadChatConversation(booking.customer._id);
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
    if (!messageText.trim() || !booking?.customer) return;

    try {
      // Create optimistic message with correct structure
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageText,
        sender: { _id: user._id, name: user.name },
        recipient: booking.customer._id,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      // Optimistically add message to UI
      setChatMessages(prev => [...prev, tempMessage]);

      // Send message to server
      await messageService.sendMessage(booking.customer._id, messageText);
      
      // Refresh conversation
      await loadChatConversation(booking.customer._id);
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

  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white">
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
              <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-xl p-6 border border-[#151E3D]/20">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  Service Request
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Service Type</p>
                    <p className="text-blue-900 text-lg font-semibold">{booking.service || booking.serviceName}</p>
                  </div>
                  {(booking.budget || booking.totalAmount) && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Amount</p>
                      <p className="text-blue-900 text-lg font-semibold flex items-center">
                        <DollarSign className="w-5 h-5 mr-1" />
                        ₦{(booking.totalAmount || booking.budget || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {booking.hourlyRate && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Hourly Rate</p>
                      <p className="text-blue-900 text-lg font-semibold flex items-center">
                        <DollarSign className="w-5 h-5 mr-1" />
                        ₦{booking.hourlyRate.toLocaleString()}/hour
                      </p>
                    </div>
                  )}
                  {booking.estimatedDuration && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Estimated Duration</p>
                      <p className="text-blue-900 text-lg font-semibold">
                        {booking.estimatedDuration} hours
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
                      {booking.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {booking.location && (
                <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-xl p-6 border border-[#151E3D]/20">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
                    <MapPin className="w-6 h-6 mr-2" />
                    Location Details
                  </h3>
                  <p className="text-orange-900 text-lg font-semibold">{booking.location}</p>
                </div>
              )}

              {/* Additional Information */}
              {(booking.additionalDetails || booking.specialRequirements) && (
                <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-xl p-6 border border-[#151E3D]/20">
                  <h3 className="text-xl font-semibold text-purple-900 mb-4">Additional Information</h3>
                  <p className="text-purple-900 text-lg leading-relaxed">{booking.additionalDetails || booking.specialRequirements}</p>
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
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-[#151E3D]/5">
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
                disabled={isDeclining || isAccepting}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-md hover:shadow-lg"
              >
                {isDeclining ? (
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
                disabled={isAccepting || isDeclining || (!user?.kycVerified || user?.kycStatus !== 'approved')}
                className={`px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-md hover:shadow-lg ${
                  (!user?.kycVerified || user?.kycStatus !== 'approved') 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={(!user?.kycVerified || user?.kycStatus !== 'approved') ? 'KYC verification required to accept jobs' : ''}
              >
                {isAccepting ? (
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
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-[#151E3D]/5">
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

      {/* Chat Modal */}
      {showChatModal && booking?.customer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[500px] flex flex-col">
            {/* Chat Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#151E3D]">Chat with Customer</h2>
                  <p className="text-sm text-gray-500">{booking.customer.name}</p>
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
                customer={booking.customer}
                onClose={closeChatModal}
                messages={chatMessages}
                loading={chatLoading}
                onSendMessage={handleSendMessage}
                onRefresh={() => {
                  if (booking?.customer?._id) {
                    loadChatConversation(booking.customer._id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPreviewModal;
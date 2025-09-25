import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { 
  Loader2, 
  MessageSquare, 
  User, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ManageMessages = () => {
  const { accessToken } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const conversationsData = await adminService.getAllConversations(accessToken);
        setConversations(conversationsData);
      } catch (err) {
        setError(err.message || "Failed to fetch conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [accessToken]);

  const handleViewMessages = async (conversation) => {
    try {
      setMessagesLoading(true);
      setSelectedConversation(conversation);
      setShowMessagesModal(true);
      
      const messagesData = await adminService.getAllMessages(
        accessToken, 
        1, 
        100, 
        conversation.conversationId
      );
      setMessages(messagesData.messages);
      setPagination(messagesData.pagination);
    } catch (err) {
      setError(err.message || "Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
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

  const formatTime = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'artisan':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'artisan':
        return <User className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Filter conversations based on search and role filter
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = !searchTerm || 
      conversation.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
      conversation.sender?.role === filterRole || 
      conversation.recipient?.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Messages</h1>
        
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="artisan">Artisans</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No conversations found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No messages have been exchanged yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Participants */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${getRoleColor(conversation.sender?.role)}`}>
                          {getRoleIcon(conversation.sender?.role)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{conversation.sender?.name || 'Unknown'}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(conversation.sender?.role)}`}>
                            {conversation.sender?.role || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-gray-400">↔</div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${getRoleColor(conversation.recipient?.role)}`}>
                          {getRoleIcon(conversation.recipient?.role)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{conversation.recipient?.name || 'Unknown'}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(conversation.recipient?.role)}`}>
                            {conversation.recipient?.role || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Last Message Preview */}
                    <div className="mb-3">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        <span className="font-medium">{conversation.sender?.name}:</span> {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>

                    {/* Conversation Stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {conversation.messageCount} messages
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last: {formatDateTime(conversation.lastMessage?.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleViewMessages(conversation)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Messages
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Modal */}
        {showMessagesModal && selectedConversation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Conversation Messages</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Between {selectedConversation.sender?.name} and {selectedConversation.recipient?.name}
                  </p>
                </div>
                <button 
                  onClick={() => setShowMessagesModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages in this conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.sender.role === 'admin' ? 'ml-12' : 'mr-12'}`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                            message.sender.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-900'
                              : message.sender.role === 'artisan'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{message.sender.name}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.sender.role)}`}>
                                  {getRoleIcon(message.sender.role)}
                                  <span className="ml-1">{message.sender.role}</span>
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            {message.fileUrl && (
                              <div className="mt-2">
                                <a 
                                  href={message.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  📎 View attachment
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowMessagesModal(false)} 
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

export default ManageMessages;

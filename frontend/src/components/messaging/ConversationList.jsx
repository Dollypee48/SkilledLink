import React, { useState } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { User, MessageCircle, Search } from 'lucide-react';

const ConversationList = ({ onConversationSelect }) => {
  const { user } = useAuth();
  const { 
    conversations, 
    selectedRecipient, 
    selectRecipient, 
    loading, 
    error 
  } = useMessage();
  
  // Debug logging
  console.log('ConversationList - conversations:', conversations);
  console.log('ConversationList - loading:', loading);
  console.log('ConversationList - error:', error);
  console.log('ConversationList - user:', user);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.sender?.name?.toLowerCase().includes(searchLower) ||
      conv.recipient?.name?.toLowerCase().includes(searchLower) ||
      conv.content?.toLowerCase().includes(searchLower)
    );
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get conversation partner
  const getConversationPartner = (conversation) => {
    if (!user) return null;
    return conversation.sender._id === user._id ? conversation.recipient : conversation.sender;
  };

  if (loading) {
    return (
      <div className="w-96 bg-white border-r border-gray-200 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#151E3D] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 bg-white border-r border-gray-200 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-transparent bg-white shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'Start a conversation to connect with others'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const partner = getConversationPartner(conversation);
              const isSelected = selectedRecipient?._id === partner?._id;
              const unreadCount = conversation.unreadCount || 0;
            
            return (
              <div
                  key={conversation.conversationId}
                  onClick={() => {
                    selectRecipient(partner);
                    onConversationSelect && onConversationSelect();
                  }}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    isSelected ? 'bg-gradient-to-r from-[#151E3D]/10 to-[#1E2A4A]/10 border-r-4 border-[#151E3D]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                        isSelected ? 'bg-gradient-to-br from-[#151E3D] to-[#1E2A4A]' : 'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        <User className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                  )}
                </div>
                    
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-[#151E3D]' : 'text-gray-900'
                        }`}>
                          {partner?.name || 'Unknown User'}
                    </h3>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conversation.timestamp || conversation.createdAt)}
                        </span>
                      </div>
                      
                      <p className={`text-sm truncate ${
                        isSelected ? 'text-[#151E3D]/80' : 'text-gray-600'
                      }`}>
                        {conversation.content || 'No messages yet'}
                    </p>
                </div>
                  </div>
                </div>
              );
            })}
              </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
import React, { useEffect } from 'react';
import { useMessage } from '../../context/MessageContext';
import { User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const ConversationList = () => {
  const { conversations, fetchConversations, setSelectedRecipient } = useMessage();
  const { user } = useAuth(); // Get the current user from AuthContext

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationClick = (otherUser) => {
    setSelectedRecipient(otherUser);
    // Don't navigate - just update the selected recipient to keep the layout intact
  };

  if (!user) {
    return <div className="p-4 text-gray-500">Please log in to view conversations.</div>; // Handle case where user is not logged in
  }
  
  if (!conversations) {
    return <div className="p-4 text-gray-500">Loading conversations...</div>; // Defensive check for conversations loading
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex-shrink-0">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">Start a chat to get connected!</p>
          </div>
        ) : (
          conversations.map((conv) => {
            // Add null checks for sender and recipient
            if (!conv.sender || !conv.recipient) {
              return null; // Skip invalid conversations
            }
            
            const otherUser = conv.sender._id === user._id ? conv.recipient : conv.sender;
            
            // Additional null check for otherUser
            if (!otherUser || !otherUser._id) {
              return null; // Skip conversations with invalid users
            }
            
            return (
              <div
                key={conv.conversationId}
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={() => handleConversationClick(otherUser)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow-sm">
                  {otherUser.profileImageUrl ? (
                      <img src={otherUser.profileImageUrl} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                      <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {otherUser.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.content || 'No message content'}
                    </p>
                </div>
                {conv.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
                </div>
              </div>
            );
          }).filter(Boolean) // Remove null entries
        )}
      </div>
    </div>
  );
};

export default ConversationList;

import React, { useEffect } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const ConversationList = () => {
  const { conversations, fetchConversations, setSelectedRecipient } = useMessage();
  const { user } = useAuth(); // Get the current user from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationClick = (otherUser) => {
    setSelectedRecipient(otherUser);
    navigate(`/messages/${otherUser._id}`);
  };

  if (!user) {
    return <div className="p-4 text-gray-500">Please log in to view conversations.</div>; // Handle case where user is not logged in
  }
  
  if (!conversations) {
    return <div className="p-4 text-gray-500">Loading conversations...</div>; // Defensive check for conversations loading
  }

  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
      </div>
      <div className="">
        {conversations.length === 0 ? (
          <p className="text-gray-500 p-4">No conversations yet. Start a chat!</p>
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
                className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleConversationClick(otherUser)}
              >
                <div className="flex-shrink-0">
                  {otherUser.profileImageUrl ? (
                    <img src={otherUser.profileImageUrl} alt={otherUser.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <User className="h-10 w-10 text-gray-400 border rounded-full p-2" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{otherUser.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.content || 'No message content'}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          }).filter(Boolean) // Remove null entries
        )}
      </div>
    </div>
  );
};

export default ConversationList;

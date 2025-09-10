import React, { useEffect } from 'react';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { useParams } from 'react-router-dom';
import CustomerLayout from '../components/common/Layouts/CustomerLayout';
import ArtisanLayout from '../components/common/Layouts/ArtisanLayout';

const MessagesPage = () => {
  const { user } = useAuth();
  const { fetchConversation } = useMessage();
  const { otherUserId } = useParams();

  // Handle URL parameters for conversation selection
  useEffect(() => {
    if (otherUserId && fetchConversation) {
      fetchConversation(otherUserId);
    }
  }, [otherUserId, fetchConversation]);

  // Messages Content Component
  const MessagesContent = () => (
    <div className="flex h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 flex-shrink-0 min-w-0 border-r border-gray-200">
        <ConversationList />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 min-w-0">
        <ChatWindow />
      </div>
    </div>
  );

  // Render with appropriate layout based on user role
  if (user?.role === 'artisan') {
    return (
      <ArtisanLayout>
        <MessagesContent />
      </ArtisanLayout>
    );
  } else {
    return (
      <CustomerLayout>
        <MessagesContent />
      </CustomerLayout>
    );
  }
};

export default MessagesPage;
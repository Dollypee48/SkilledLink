import React from 'react';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import CustomerLayout from '../components/common/Layouts/CustomerLayout';
import ArtisanLayout from '../components/common/Layouts/ArtisanLayout';

const MessagesPage = () => {
  const { user } = useAuth();
  
  const messagesContent = (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex">
      {/* Conversation List */}
      <div className="w-96 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <ConversationList />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 bg-white">
        <ChatWindow />
      </div>
    </div>
  );

  // Wrap in appropriate layout based on user role
  if (user?.role === 'artisan') {
    return <ArtisanLayout>{messagesContent}</ArtisanLayout>;
  } else {
    return <CustomerLayout>{messagesContent}</CustomerLayout>;
  }
};

export default MessagesPage;
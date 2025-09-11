import React from 'react';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import CustomerLayout from '../components/common/Layouts/CustomerLayout';
import ArtisanLayout from '../components/common/Layouts/ArtisanLayout';

const MessagesPage = () => {
  const { user } = useAuth();
  
  const messagesContent = (
    <div className="flex h-screen bg-gray-100">
      <ConversationList />
      <ChatWindow />
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
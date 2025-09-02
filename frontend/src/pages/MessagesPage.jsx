import React from 'react';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import CustomerLayout from '../components/common/Layouts/CustomerLayout'; // Import CustomerLayout
import ArtisanLayout from '../components/common/Layouts/ArtisanLayout'; // Import ArtisanLayout

const MessagesPage = () => {
  const { user } = useAuth(); // Get user from AuthContext

  const Layout = user?.role === 'artisan' ? ArtisanLayout : CustomerLayout; // Choose layout based on role

  return (
    <Layout>
      <div className="flex h-full bg-gray-100">
        <ConversationList />
        <ChatWindow />
      </div>
    </Layout>
  );
};

export default MessagesPage;

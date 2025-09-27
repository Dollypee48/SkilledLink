import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import CustomerLayout from '../components/common/Layouts/customerLayout';
import ArtisanLayout from '../components/common/Layouts/ArtisanLayout';

const MessagesPage = () => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Check if mobile view
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowConversationList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleConversationSelect = () => {
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };
  
  const messagesContent = (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          {/* Conversation List */}
          <div className="w-80 lg:w-96 bg-white shadow-lg border-r border-gray-200 flex flex-col">
            <ConversationList onConversationSelect={handleConversationSelect} />
          </div>
          
          {/* Chat Window */}
          <div className="flex-1 bg-white">
            <ChatWindow onBackToConversations={handleBackToConversations} />
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Conversation List - Mobile */}
          {showConversationList && (
            <div className="w-full bg-white flex flex-col">
              <ConversationList onConversationSelect={handleConversationSelect} />
            </div>
          )}

          {/* Chat Window - Mobile */}
          {!showConversationList && (
            <div className="w-full bg-white flex flex-col">
              <ChatWindow onBackToConversations={handleBackToConversations} />
            </div>
          )}
        </>
      )}
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
import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Paperclip, Trash2, Smile, Menu, User, MessageCircle, ArrowLeft } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ onBackToConversations }) => {
  const { user } = useAuth();
  const { 
    currentConversation, 
    selectedRecipient, 
    sendNewMessage, 
    deleteMessage, 
    clearConversation,
    loading 
  } = useMessage();
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  // Close hamburger menu when clicking outside
  useEffect(() => {
    if (!showHamburgerMenu) return;
    
    const handleClickOutside = (event) => {
      if (showHamburgerMenu && !event.target.closest('.hamburger-menu')) {
        setShowHamburgerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHamburgerMenu]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (isSendingMessage || !selectedRecipient || !newMessage.trim()) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSendingMessage(true);

    try {
      await sendNewMessage(selectedRecipient._id, messageContent, null, null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on error
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle file clear
  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle clear conversation
  const handleClearConversation = async () => {
    if (!selectedRecipient) return;
    
    if (window.confirm('Are you sure you want to clear all messages in this conversation?')) {
      try {
        await clearConversation(selectedRecipient._id);
        setShowHamburgerMenu(false);
        alert('Conversation cleared successfully!');
      } catch (error) {
        console.error('Failed to clear conversation:', error);
        alert('Failed to clear conversation. Please try again.');
      }
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Debug logging
  console.log('ChatWindow - selectedRecipient:', selectedRecipient);
  console.log('ChatWindow - currentConversation:', currentConversation);
  console.log('ChatWindow - loading:', loading);
  console.log('ChatWindow - user:', user);

  if (!selectedRecipient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Back Button */}
          {onBackToConversations && (
            <button
              onClick={onBackToConversations}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{selectedRecipient.name || 'Unknown User'}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Online</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {showHamburgerMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hamburger-menu">
              <button
                onClick={handleClearConversation}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#151E3D] border-t-transparent"></div>
          </div>
        ) : currentConversation && currentConversation.length > 0 ? (
          <div className="space-y-4">
            {currentConversation.map((message) => {
              const isOwnMessage = message?.sender?._id === user?._id;
              const messageTime = message?.timestamp || message?.createdAt;
              
              return (
                <div
                  key={message._id + (message.timestamp || message.createdAt)}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar for received messages */}
                    {!isOwnMessage && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                        {message?.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`relative group ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                     <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                       isOwnMessage 
                         ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white rounded-br-md' 
                         : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                     }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message?.content || ''}</p>
                        
                        {/* File attachments */}
                        {message?.fileUrl && message?.fileType && message.fileType.startsWith('image/') && (
                          <div className="mt-3">
                            <img 
                              src={message.fileUrl} 
                              alt="Sent file" 
                              className="max-w-xs h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {message?.fileUrl && message?.fileType && !message.fileType.startsWith('image/') && (
                          <div className="mt-3">
                            <a 
                              href={message.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isOwnMessage 
                                  ? 'bg-white/20 text-white hover:bg-white/30' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download File
                            </a>
                          </div>
                        )}
                        
                       {/* Message time */}
                       <div className={`text-xs mt-2 ${
                         isOwnMessage ? 'text-white/70' : 'text-gray-500'
                       }`}>
                          {messageTime ? new Date(messageTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : ''}
                        </div>
                      </div>
                      
                      {/* Delete button for user's own messages */}
                      {isOwnMessage && message?._id && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start the conversation by sending a message!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={handleClearFile}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50"
              disabled={!selectedRecipient || isSendingMessage}
            />
            
            {/* Emoji button inside input */}
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-[#151E3D] hover:bg-gray-100 rounded-lg transition-colors"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSendingMessage || !selectedRecipient || newMessage.trim() === ''}
            className={`px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm ${
              isSendingMessage || !selectedRecipient || newMessage.trim() === ''
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white hover:from-[#1E2A4A] hover:to-[#151E3D] hover:shadow-md transform hover:scale-105'
            }`}
          >
            {isSendingMessage ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-6 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ChatWindow;
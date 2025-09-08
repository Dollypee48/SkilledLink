import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Paperclip, Trash2, Smile, Menu, User } from 'lucide-react'; // Import new icons
import EmojiPicker from 'emoji-picker-react'; // Import EmojiPicker

// Helper function to convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // File converted to base64
      }
      resolve(reader.result.split(',')[1]); // Extract only the base64 part
    };
    reader.onerror = error => {
      console.error('fileToBase64 - Reader error:', error);
      reject(error);
    };
  });
};

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentConversation, selectedRecipient, fetchConversation, sendNewMessage, deleteMessage, clearConversation } = useMessage();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // New state for selected file
  const [filePreview, setFilePreview] = useState(null); // New state for file preview
  const fileInputRef = useRef(null); // Ref for hidden file input
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to control emoji picker visibility
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false); // State to control hamburger menu visibility

  // Fetch conversation when selectedRecipient changes
  useEffect(() => {
    if (selectedRecipient) {
      fetchConversation(selectedRecipient._id);
    }
  }, [selectedRecipient, fetchConversation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  // Close hamburger menu when clicking outside
  useEffect(() => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Debug logging - only in development
    if (process.env.NODE_ENV === 'development') {
      // File selected for upload
    }
    if (file) {
      setSelectedFile(file);
      // Create a URL for file preview
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null); // No preview for non-image files for now
      }
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedRecipient) return; // Must have a recipient

    if (newMessage.trim() === '') return; // Must have content (file upload temporarily disabled)

    // Temporarily disabled file upload logic
    /*
    let fileData = null;
    let fileType = null;

    if (selectedFile) {
      console.log('handleSendMessage - selectedFile is present:', selectedFile.name);
      fileData = await fileToBase64(selectedFile);
      fileType = selectedFile.type;
      console.log('handleSendMessage - fileData after conversion snippet:', fileData ? fileData.substring(0, 50) + '...' : 'No fileData after conversion');
    }
    console.log('Sending message - fileData snippet:', fileData ? fileData.substring(0, 50) + '...' : 'No fileData');
    console.log('Sending message - fileType:', fileType);
    */
    
    await sendNewMessage(selectedRecipient._id, newMessage.trim(), null, null); // Temporarily pass null for fileData and fileType
    setNewMessage('');
    // Temporarily disabled file cleanup
    /*
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
    }
    */
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClearConversation = async () => {
    if (window.confirm('Are you sure you want to clear all messages in this conversation? This will only clear your view - the other person will still see all messages.')) {
      try {
        // Debug logging - only in development
        if (process.env.NODE_ENV === 'development') {
          // Starting clear conversation process
        }
        
        await clearConversation(selectedRecipient._id);
        setShowHamburgerMenu(false); // Close menu after action
        
        // Show success feedback
        if (process.env.NODE_ENV === 'development') {
          // Conversation cleared successfully
        }
        alert('Conversation cleared successfully!');
        
      } catch (error) {
        console.error('Failed to clear conversation:', error);
        // Show detailed error feedback
        alert(`Failed to clear conversation: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    // For now, just show an alert with basic info
    // You can expand this to open a modal or navigate to a profile page
    alert(`Profile: ${selectedRecipient.name}\nRole: ${selectedRecipient.role || 'User'}`);
    setShowHamburgerMenu(false); // Close menu after action
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  if (!selectedRecipient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow-sm">
              {selectedRecipient.profileImageUrl ? (
                <img 
                  src={selectedRecipient.profileImageUrl} 
                  alt={selectedRecipient.name} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{selectedRecipient.name}</h2>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </div>
          
          {/* Hamburger Menu */}
          <div className="relative hamburger-menu">
            <button
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {showHamburgerMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleViewProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={handleClearConversation}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {currentConversation.map((message) => (
          <div
            key={message._id + message.timestamp}
            className={`flex mb-4 ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-3 max-w-[70%] relative group ${
                message.sender._id === user._id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.fileUrl && message.fileType && message.fileType.startsWith('image/') && (
                <img src={message.fileUrl} alt="Sent file" className="max-w-xs h-auto rounded-lg mt-2" />
              )}
              {message.fileUrl && message.fileType && !message.fileType.startsWith('image/') && (
                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className={`underline mt-2 block ${
                  message.sender._id === user._id ? 'text-blue-100' : 'text-blue-600'
                }`}>
                  Download File ({message.fileType})
                </a>
              )}
              <div className={`text-xs mt-2 ${
                message.sender._id === user._id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              
              {/* Delete button for user's own messages */}
              {message.sender._id === user._id && (
                <button
                  onClick={() => handleDeleteMessage(message._id)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete message"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <EmojiPicker onEmojiClick={(emojiObject) => {
                setNewMessage(prevMsg => prevMsg + emojiObject.emoji);
                setShowEmojiPicker(false);
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

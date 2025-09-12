import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Settings, ChevronDown, Eye } from 'lucide-react';

const ProfileDropdown = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    if (user?.role === 'customer') {
      navigate('/customer-profile');
    } else if (user?.role === 'artisan') {
      navigate('/artisan-profile');
    }
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    if (user?.role === 'customer') {
      navigate('/customer-settings');
    } else if (user?.role === 'artisan') {
      navigate('/artisan-settings');
    }
    setIsOpen(false);
  };

  const handleSignOut = () => {
    handleLogout();
    navigate('/');
    setIsOpen(false);
  };

  const isSidebar = variant === 'sidebar';
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 ${
          isSidebar 
            ? 'hover:bg-white/10 text-white w-full justify-start' 
            : 'hover:bg-gray-100'
        }`}
      >
        {user?.profileImageUrl ? (
          <img 
            src={user.profileImageUrl} 
            alt="Profile" 
            className={`w-10 h-10 rounded-full object-cover shadow border-2 transition-colors duration-200 ${
              isSidebar 
                ? 'border-white hover:border-[#F59E0B]' 
                : 'border-white hover:border-[#151E3D]'
            }`}
          />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] flex items-center justify-center shadow border-2 transition-colors duration-200 ${
            isSidebar 
              ? 'border-white hover:border-[#F59E0B]' 
              : 'border-white hover:border-[#151E3D]'
          }`}>
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isSidebar ? 'text-white' : 'text-gray-600'
          } ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[9999] ${
          isSidebar ? 'left-0' : 'right-0'
        }`}>
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
            <p className="text-xs text-[#151E3D] font-medium capitalize">{user?.role || ''}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-3 text-gray-500" />
              View Profile
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              Profile Settings
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

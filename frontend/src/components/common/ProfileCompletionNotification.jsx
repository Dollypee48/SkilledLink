import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  ArrowRight,
  Settings
} from 'lucide-react';

const ProfileCompletionNotification = ({ profileCompletion, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (profileCompletion && profileCompletion.message && profileCompletion.message.showNotification) {
      setIsVisible(true);
    }
  }, [profileCompletion]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || isDismissed || !profileCompletion?.message) {
    return null;
  }

  const { message, completionPercentage } = profileCompletion;
  const { type, title, message: notificationMessage, actionText, actionUrl } = message;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${getBackgroundColor()} border rounded-lg shadow-lg p-4 transition-all duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${getTextColor()}`}>
              {title}
            </h3>
            <button
              onClick={handleDismiss}
              className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className={`mt-1 text-sm ${getTextColor()}`}>
            {notificationMessage}
          </p>
          
          {/* Progress bar */}
          {completionPercentage !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    completionPercentage < 30 ? 'bg-red-400' :
                    completionPercentage < 70 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Action button */}
          {actionText && actionUrl && (
            <div className="mt-3">
              <Link
                to={actionUrl}
                className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  type === 'warning' 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : type === 'info'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Settings className="w-3 h-3 mr-1" />
                {actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionNotification;

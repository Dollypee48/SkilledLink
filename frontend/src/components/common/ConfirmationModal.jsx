import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Loader2 } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  isLoading = false,
  showIcon = true
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBtn: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500',
          borderColor: 'border-red-200',
          headerBg: 'bg-gradient-to-r from-red-50 to-red-100',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmBtn: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500',
          borderColor: 'border-green-200',
          headerBg: 'bg-gradient-to-r from-green-50 to-green-100',
          icon: <CheckCircle className="w-6 h-6" />
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBtn: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500',
          borderColor: 'border-blue-200',
          headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      default: // warning
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBtn: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500',
          borderColor: 'border-yellow-200',
          headerBg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          icon: <AlertTriangle className="w-6 h-6" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${styles.headerBg} rounded-t-2xl p-6 border-b ${styles.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showIcon && (
                <div className={`p-3 rounded-xl ${styles.iconBg}`}>
                  <div className={styles.iconColor}>
                    {styles.icon}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">Please confirm your action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <XCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed text-center">{message}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmBtn}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

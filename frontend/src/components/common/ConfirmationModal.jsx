import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Loader2, X } from 'lucide-react';

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
          iconBg: 'bg-gradient-to-br from-[#151E3D]/10 to-[#1E2A4A]/20',
          iconColor: 'text-[#151E3D]',
          iconBorder: 'border-[#151E3D]/20',
          confirmBtn: 'bg-gradient-to-r from-[#151E3D] via-[#1E2A4A] to-[#151E3D] hover:from-[#1E2A4A] hover:via-[#151E3D] hover:to-[#1E2A4A] focus:ring-[#151E3D]/50',
          borderColor: 'border-[#151E3D]/20',
          headerBg: 'bg-gradient-to-br from-[#151E3D]/5 via-[#1E2A4A]/10 to-[#151E3D]/5',
          shadowColor: 'shadow-[#151E3D]/20',
          icon: <AlertTriangle className="w-7 h-7" />
        };
      case 'success':
        return {
          iconBg: 'bg-gradient-to-br from-[#151E3D]/10 to-[#1E2A4A]/20',
          iconColor: 'text-[#151E3D]',
          iconBorder: 'border-[#151E3D]/20',
          confirmBtn: 'bg-gradient-to-r from-[#151E3D] via-[#1E2A4A] to-[#151E3D] hover:from-[#1E2A4A] hover:via-[#151E3D] hover:to-[#1E2A4A] focus:ring-[#151E3D]/50',
          borderColor: 'border-[#151E3D]/20',
          headerBg: 'bg-gradient-to-br from-[#151E3D]/5 via-[#1E2A4A]/10 to-[#151E3D]/5',
          shadowColor: 'shadow-[#151E3D]/20',
          icon: <CheckCircle className="w-7 h-7" />
        };
      case 'info':
        return {
          iconBg: 'bg-gradient-to-br from-[#151E3D]/10 to-[#1E2A4A]/20',
          iconColor: 'text-[#151E3D]',
          iconBorder: 'border-[#151E3D]/20',
          confirmBtn: 'bg-gradient-to-r from-[#151E3D] via-[#1E2A4A] to-[#151E3D] hover:from-[#1E2A4A] hover:via-[#151E3D] hover:to-[#1E2A4A] focus:ring-[#151E3D]/50',
          borderColor: 'border-[#151E3D]/20',
          headerBg: 'bg-gradient-to-br from-[#151E3D]/5 via-[#1E2A4A]/10 to-[#151E3D]/5',
          shadowColor: 'shadow-[#151E3D]/20',
          icon: <AlertTriangle className="w-7 h-7" />
        };
      default: // warning
        return {
          iconBg: 'bg-gradient-to-br from-[#151E3D]/10 to-[#1E2A4A]/20',
          iconColor: 'text-[#151E3D]',
          iconBorder: 'border-[#151E3D]/20',
          confirmBtn: 'bg-gradient-to-r from-[#151E3D] via-[#1E2A4A] to-[#151E3D] hover:from-[#1E2A4A] hover:via-[#151E3D] hover:to-[#1E2A4A] focus:ring-[#151E3D]/50',
          borderColor: 'border-[#151E3D]/20',
          headerBg: 'bg-gradient-to-br from-[#151E3D]/5 via-[#1E2A4A]/10 to-[#151E3D]/5',
          shadowColor: 'shadow-[#151E3D]/20',
          icon: <AlertTriangle className="w-7 h-7" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 border ${styles.borderColor} ${styles.shadowColor} animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${styles.headerBg} rounded-t-2xl p-5 border-b ${styles.borderColor} relative overflow-hidden`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showIcon && (
                <div className={`p-3 rounded-xl ${styles.iconBg} border ${styles.iconBorder} shadow-lg`}>
                  <div className={styles.iconColor}>
                    {styles.icon}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-xs text-gray-600 font-medium">Please confirm your action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg hover:shadow-xl"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Message */}
          <div className="mb-5">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed text-center text-sm font-medium">{message}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 ${styles.confirmBtn}`}
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
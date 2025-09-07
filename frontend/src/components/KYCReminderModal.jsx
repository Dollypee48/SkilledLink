import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert } from 'lucide-react';

const KYCReminderModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (user && user.kycStatus !== 'approved' && !user.kycVerified) {
        setIsOpen(true);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }, [user]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const allowedRoles = ["artisan"]; // Only show for artisans since KYC is disabled for customers
    if (user && allowedRoles.includes(user.role) && user.kycStatus !== 'approved' && !user.kycVerified) {
      setIsOpen(true); // Open immediately if not approved and is an allowed role
      startTimer(); // Start timer for subsequent pop-ups
    } else {
      setIsOpen(false);
      stopTimer();
    }

    return () => stopTimer();
  }, [user?.kycStatus, user?.kycVerified, user?.role, startTimer, stopTimer]);

  const handleClose = () => {
    setIsOpen(false);
    stopTimer();
    startTimer(); // Restart timer for next pop-up after closing
  };

  const handleVerifyClick = () => {
    setIsOpen(false);
    stopTimer();
    navigate('/kyc-verification'); // Navigate to the dedicated KYC page
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] mb-6">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-[#151E3D] mb-2">KYC Verification Required</h3>
          <p className="text-gray-600 mb-4">
            Complete your identity verification to unlock all platform features and ensure secure transactions.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Verification Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                user?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                user?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user?.kycStatus === 'pending' ? 'Under Review' :
                 user?.kycStatus === 'rejected' ? 'Rejected' :
                 'Not Started'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleVerifyClick}
              className="w-full bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#0F172A] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Complete Verification
            </button>
            <button
              onClick={handleClose}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCReminderModal;

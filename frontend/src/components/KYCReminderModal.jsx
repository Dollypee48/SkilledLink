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
      if (user && user.kycStatus !== 'approved') {
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
    const allowedRoles = ["customer", "artisan"];
    if (user && allowedRoles.includes(user.role) && user.kycStatus !== 'approved') {
      setIsOpen(true); // Open immediately if not approved and is an allowed role
      startTimer(); // Start timer for subsequent pop-ups
    } else {
      setIsOpen(false);
      stopTimer();
    }

    return () => stopTimer();
  }, [user?.kycStatus, user?.role, startTimer, stopTimer]);

  const handleClose = () => {
    setIsOpen(false);
    stopTimer();
    startTimer(); // Restart timer for next pop-up after closing
  };

  const handleVerifyClick = () => {
    setIsOpen(false);
    stopTimer();
    navigate('/kyc'); // Navigate to the dedicated KYC page
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">KYC Verification Required</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Your account requires KYC verification to access full features.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Current status: <span className="font-semibold capitalize">{user?.kycStatus || 'Not Started'}</span>
            </p>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={handleVerifyClick}
            >
              Verify My KYC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCReminderModal;

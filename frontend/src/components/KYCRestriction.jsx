import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { isKYCVerified, needsKYC, getKYCRequirementMessage } from '../utils/kycUtils';

const KYCRestriction = ({ 
  children, 
  feature, 
  fallback = null,
  showModal = true 
}) => {
  const navigate = useNavigate();

  // If user is KYC verified, show the children
  if (isKYCVerified(feature?.user)) {
    return children;
  }

  // If user needs KYC and we should show modal
  if (needsKYC(feature?.user) && showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#151E3D] mb-2">Verification Required</h3>
            <p className="text-gray-600 mb-6">
              {getKYCRequirementMessage(feature)}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/kyc-verification')}
                className="w-full bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#0F172A] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                Complete Verification
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has pending KYC, show a warning banner
  if (feature?.user?.kycStatus === 'pending') {
    return (
      <div className="relative">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="font-semibold text-yellow-800">Verification Pending</h4>
              <p className="text-sm text-yellow-700">
                Your documents are under review. Some features may be limited until verification is complete.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // If user has rejected KYC, show error banner
  if (feature?.user?.kycStatus === 'rejected') {
    return (
      <div className="relative">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="font-semibold text-red-800">Verification Rejected</h4>
              <p className="text-sm text-red-700">
                Your verification was rejected. Please resubmit your documents to access all features.
              </p>
              <button
                onClick={() => navigate('/kyc-verification')}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Resubmit Documents
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Return fallback or children based on configuration
  return fallback || children;
};

export default KYCRestriction;

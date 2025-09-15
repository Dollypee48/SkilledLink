import React from 'react';
import { useAuth } from '../context/AuthContext';
import KYCForm from '../components/KYCForm';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KYCVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back to the appropriate dashboard based on user role
    if (user?.role === 'customer') {
      navigate('/customer-dashboard');
    } else if (user?.role === 'artisan') {
      navigate('/artisan-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            {/* Page Title */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
                <p className="text-sm text-gray-600">Complete your identity verification</p>
              </div>
            </div>

            {/* Spacer for centering */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KYC Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              user?.kycStatus === 'approved' ? 'bg-green-500' : 
              user?.kycStatus === 'pending' ? 'bg-yellow-500' : 
              user?.kycStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-gray-700 capitalize font-medium">
              {user?.kycStatus === 'approved' ? 'Verified' : 
               user?.kycStatus === 'pending' ? 'Under Review' : 
               user?.kycStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
            </span>
            {user?.kycStatus === 'rejected' && (
              <span className="text-red-600 text-sm">
                Please resubmit your documents with the required corrections.
              </span>
            )}
          </div>
        </div>

        {/* KYC Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <KYCForm />
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationPage;

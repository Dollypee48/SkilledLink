import React from 'react';
import { Shield, AlertTriangle, Clock, XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getKYCStatusInfo } from '../utils/kycUtils';

const KYCNotificationBanner = ({ user, onDismiss }) => {
  const navigate = useNavigate();
  
  if (!user) return null;

  const kycStatus = user.kycStatus;
  const statusInfo = getKYCStatusInfo(kycStatus);
  
  // Don't show banner if user is verified
  if (statusInfo.text === 'Verified') return null;

  const getStatusIcon = () => {
    switch (statusInfo.icon) {
      case 'check-circle':
        return <CheckCircle className="w-6 h-6" />;
      case 'clock':
        return <Clock className="w-6 h-6" />;
      case 'x-circle':
        return <XCircle className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (statusInfo.color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleAction = () => {
    if (kycStatus === 'rejected') {
      navigate('/kyc-verification');
    } else if (!kycStatus || kycStatus === 'not_submitted') {
      navigate('/kyc-verification');
    }
  };

  const getActionText = () => {
    if (kycStatus === 'rejected') {
      return 'Resubmit Documents';
    } else if (kycStatus === 'pending') {
      return 'View Status';
    } else {
      return 'Complete Verification';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 p-6 mb-8 ${getStatusColor()}`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${
              statusInfo.color === 'green' ? 'bg-green-100' :
              statusInfo.color === 'yellow' ? 'bg-yellow-100' :
              statusInfo.color === 'red' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              {getStatusIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold">
                  {statusInfo.text === 'Not Verified' ? 'Complete KYC Verification' : 
                   statusInfo.text === 'Under Review' ? 'KYC Under Review' :
                   statusInfo.text === 'Rejected' ? 'KYC Verification Required' :
                   'KYC Status'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusInfo.color === 'green' ? 'bg-green-200 text-green-800' :
                  statusInfo.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                  statusInfo.color === 'red' ? 'bg-red-200 text-red-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {statusInfo.text.toUpperCase()}
                </span>
              </div>
              
              <p className="text-lg mb-4">
                {statusInfo.description}
                {statusInfo.text === 'Not Verified' && ' Complete your identity verification to access all platform features and build trust with customers.'}
                {statusInfo.text === 'Under Review' && ' We\'re reviewing your submitted documents. This usually takes 1-2 business days.'}
                {statusInfo.text === 'Rejected' && ' Your documents were not accepted. Please resubmit with clear, valid documents.'}
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAction}
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                    statusInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    statusInfo.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    statusInfo.color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  } shadow-lg hover:shadow-xl`}
                >
                  {getActionText()}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                
                {statusInfo.text === 'Under Review' && (
                  <button
                    onClick={() => navigate('/kyc-verification')}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Dismiss button for non-critical states */}
          {(statusInfo.text === 'Under Review' || statusInfo.text === 'Not Verified') && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Dismiss notification"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCNotificationBanner;

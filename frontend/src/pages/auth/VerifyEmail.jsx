import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await fetch(`https://skilledlink-1.onrender.com/api/auth/verify/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    // This would typically require the user to enter their email
    // For now, we'll redirect to a resend page or login
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151E3D]">
        <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151E3D] mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-[#151E3D]">Verifying your email...</h2>
          <p className="text-sm text-gray-600 mt-2">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151E3D]">
      <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center">
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-600 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full py-2 px-4 bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold rounded-md transition-colors duration-300 inline-block"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full py-2 px-4 bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold rounded-md transition-colors duration-300"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Resend Verification Email
              </button>
              <Link
                to="/login"
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors duration-300 inline-block"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

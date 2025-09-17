import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft, Clock, RefreshCw, Shield, Sparkles, Zap } from 'lucide-react';
import Logo from '../../components/common/Logo';

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    // Get email from location state or localStorage
    const userEmail = location.state?.email || localStorage.getItem('pendingVerificationEmail');
    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem('pendingVerificationEmail', userEmail);
    } else {
      // If no email, redirect to login
      navigate('/login');
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setMessage(data.message);
        
        // Clear pending verification email
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! You can now log in.',
              verified: true 
            }
          });
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('🔄 Attempting to resend verification code for:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (response.ok && data.success) {
        setMessage('New verification code sent to your email!');
        setTimeLeft(600); // Reset timer to 10 minutes
        console.log('✅ Resend successful');
      } else {
        const errorMessage = data.message || data.error || 'Failed to resend verification code';
        setError(errorMessage);
        console.error('❌ Resend failed:', errorMessage);
      }
    } catch (error) {
      console.error('❌ Network error during resend:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#151E3D] mb-3">Email Verified!</h2>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <div className="flex items-center justify-center bg-gradient-to-r from-[#151E3D]/10 to-[#1E2A4A]/10 rounded-lg p-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#151E3D] mr-2"></div>
              <span className="text-[#151E3D] font-semibold text-sm">Redirecting to login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F59E0B]/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#F59E0B]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#151E3D] mb-2">Verify Email</h1>
            <p className="text-gray-600 text-sm mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="font-semibold text-[#151E3D] text-sm bg-gradient-to-r from-[#151E3D]/10 to-[#1E2A4A]/10 px-3 py-1 rounded-lg inline-block">
              {email}
            </p>
          </div>

          {/* Timer */}
          {timeLeft > 0 && (
            <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/30 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#F59E0B] mr-2" />
                <span className="text-[#151E3D] font-semibold text-sm">
                  Expires in {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* Code Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#151E3D]/20 focus:border-[#151E3D] outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  maxLength={6}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="flex justify-center items-center h-full">
                    {code.split('').map((digit, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 mx-1 border-b-2 border-gray-300 ${
                          digit ? 'border-[#151E3D]' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && !error && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || code.length !== 6 || timeLeft === 0}
              className="w-full bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-[#151E3D]/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={resendLoading || timeLeft > 0}
              className="text-[#151E3D] hover:text-[#1E2A4A] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto bg-white/50 hover:bg-white/70 px-4 py-2 rounded-lg transition-all duration-200"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-gray-600 hover:text-[#151E3D] font-medium text-sm transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Sparkles, Shield, Zap, User, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setRequiresVerification(false);

    try {
      const response = await fetch('https://skilledlink-1.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          setRequiresVerification(true);
          setError(data.message);
        } else {
          setSuccess(true);
        }
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#151E3D] mb-4">Check Your Email</h2>
            <p className="text-[#151E3D]/70 mb-6 leading-relaxed">
              We've sent a 6-digit verification code to <strong>{email}</strong>. 
              Please check your email and enter the code to reset your password.
            </p>
            
            <div className="space-y-4">
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/30 transform hover:scale-105 flex items-center justify-center"
              >
                Enter Reset Code
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              <Link
                to="/login"
                className="w-full py-3 rounded-lg border-2 border-[#151E3D]/20 text-[#151E3D] font-semibold hover:bg-[#151E3D]/5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#151E3D]/20 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] flex items-center justify-center p-2 sm:p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="text-center lg:text-left text-white space-y-4 lg:space-y-6 order-1 lg:order-1">
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-center lg:justify-start">
                <Logo variant="full" size="lg" textColor="white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                Forgot Your <span className="text-[#F59E0B]">Password?</span>
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                No worries! Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 flex flex-col items-center lg:items-start">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Secure Password Reset</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Quick & Easy Process</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Verified Email Required</span>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 max-w-md mx-auto lg:mx-0 order-2 lg:order-2">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#151E3D] mb-1">Reset Password</h3>
              <p className="text-[#151E3D]/70 text-sm">Enter your email to receive a reset code</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium text-xs">{error}</span>
                  </div>
                </div>
              )}

              {requiresVerification && (
                <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 border-2 border-[#151E3D]/20 rounded-lg p-4 text-sm">
                  <div className="flex items-center mb-2">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-xs">Email Verification Required</span>
                  </div>
                  <p className="text-blue-700 mb-3 leading-relaxed text-xs">
                    Please verify your email address before resetting your password. Check your email for verification link.
                  </p>
                  <Link
                    to="/login"
                    className="w-full py-2 px-3 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-xs text-center block"
                  >
                    Back to Login
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6 pt-4 border-t border-[#151E3D]/10">
              <p className="text-[#151E3D]/70 text-sm">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-[#F59E0B] font-semibold hover:text-[#D97706] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 rounded-lg px-2 py-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

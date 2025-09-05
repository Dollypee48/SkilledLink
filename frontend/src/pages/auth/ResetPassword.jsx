import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, Sparkles, Shield, Zap, User, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Verify code, 2: Enter new password
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email and reset code are provided
    if (!formData.email || !formData.resetCode) {
      setError('Please enter both email and verification code');
      setLoading(false);
      return;
    }

    try {
      // First, verify the code by making a request to check if it's valid
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          resetCode: formData.resetCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeVerified(true);
        setStep(2);
        setError('');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, and a special character (!@#$%^&*)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          resetCode: formData.resetCode,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
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
            
            <h2 className="text-2xl font-bold text-[#151E3D] mb-4">Password Reset Successful!</h2>
            <p className="text-[#151E3D]/70 mb-6 leading-relaxed">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/30 transform hover:scale-105 flex items-center justify-center"
              >
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="text-center lg:text-left text-white space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold">SkilledLink</h1>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Reset Your <span className="text-[#F59E0B]">Password</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Enter the verification code sent to your email and create a new secure password.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
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

          {/* Right Side - Reset Password Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-white/20 max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#151E3D] mb-1">
                {step === 1 ? 'Verify Reset Code' : 'Create New Password'}
              </h3>
              <p className="text-[#151E3D]/70 text-sm">
                {step === 1 
                  ? 'Enter your email and verification code to proceed' 
                  : 'Enter your new password to complete the reset'
                }
              </p>
            </div>

            <form onSubmit={step === 1 ? handleCodeSubmit : handlePasswordSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-[#F59E0B]" />
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="resetCode"
                      value={formData.resetCode}
                      onChange={handleChange}
                      className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                    <p className="text-xs text-[#151E3D]/60 text-center">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-[#F59E0B]" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 pr-10"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-[#151E3D]/50 hover:text-[#F59E0B] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 rounded-lg p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-[#F59E0B]" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 pr-10"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-[#151E3D]/50 hover:text-[#F59E0B] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 rounded-lg p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 rounded-lg text-sm border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium text-xs">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {step === 1 ? 'Verifying Code...' : 'Resetting Password...'}
                    </>
                  ) : (
                    <>
                      {step === 1 ? 'Verify Code' : 'Reset Password'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
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

export default ResetPassword;

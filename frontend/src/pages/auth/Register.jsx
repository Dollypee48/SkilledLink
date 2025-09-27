import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, AlertCircle, User, Lock, ArrowRight, Sparkles, Shield, Zap, UserPlus, ArrowLeft } from 'lucide-react';
import Logo from '../../components/common/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, and a special character (!@#$%^&*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      console.log('🚀 Attempting registration with:', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        passwordLength: formData.password.length
      });

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      
      console.log('📡 Registration response status:', response.status);
      const data = await response.json();
      console.log('📡 Registration response data:', data);
      
      if (response.ok) {
        console.log('✅ Registration successful, redirecting to verification...');
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', formData.email);
        // Clear any existing errors
        setError('');
        // Navigate to verification page
        navigate('/verify-code', { 
          state: { 
            email: formData.email,
            message: data.message 
          } 
        });
      } else {
        console.error('❌ Registration failed:', data);
        if (data.message === 'Email already registered') {
          setError('This email is already registered. Please try logging in instead or use a different email address.');
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('An error occurred. Please check your network or try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] flex items-center justify-center p-2 sm:p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="text-center lg:text-left text-white space-y-4 lg:space-y-6 order-1 lg:order-1">
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-center lg:justify-start">
                <Logo variant="full" size="lg" textColor="white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                Join Our <span className="text-[#F59E0B]">Community</span>
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                Create your account and start connecting with skilled professionals or showcase your talents to the world.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 flex flex-col items-center lg:items-start">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Secure & Verified Platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Instant Connections</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white/90 text-sm">Trusted Community</span>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 max-w-md mx-auto lg:mx-0 order-2 lg:order-2">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#151E3D] mb-1">Create Account</h3>
              <p className="text-[#151E3D]/70 text-sm">Join SkilledLink and start your journey</p>
            </div>

            {/* Role Toggle */}
            <div className="flex justify-between mb-6 bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 p-1 rounded-xl border border-[#151E3D]/20">
              <button
                onClick={() => handleRoleChange('customer')}
                className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 ${
                  formData.role === 'customer'
                    ? "bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105"
                    : "text-[#151E3D] hover:bg-white/50 hover:scale-105"
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Customer
              </button>
              <button
                onClick={() => handleRoleChange('artisan')}
                className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 ${
                  formData.role === 'artisan'
                    ? "bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105"
                    : "text-[#151E3D] hover:bg-white/50 hover:scale-105"
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Artisan
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#F59E0B]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
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
                    className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#151E3D] flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-[#F59E0B]" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 pr-10"
                      placeholder="Create a strong password"
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
                      className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 pr-10"
                      placeholder="Confirm your password"
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
              </div>
              
              {error && (
                <div className="p-3 rounded-lg text-sm border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-xs">{error}</span>
                      {error.includes('already registered') && (
                        <div className="mt-2">
                          <Link 
                            to="/login" 
                            className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Click here to login instead
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#151E3D]/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>

            {/* Login Redirect */}
            <div className="text-center mt-6 pt-4 border-t border-[#151E3D]/10">
              <p className="text-[#151E3D]/70 text-sm">
                Already have an account?{" "}
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

export default Register;
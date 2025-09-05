import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, AlertCircle, User, Lock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { resendVerificationEmail } from "../../services/authService";

const Login = () => {
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const { user, handleLogin } = useAuth();

  // Redirect after login
  useEffect(() => {
    if (user) {
      const role = user.role || "customer";
      if (role === "customer") {
        navigate("/customer-dashboard");
      } else if (role === "artisan") {
        navigate("/artisan-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRequiresVerification(false);

    console.log('🔍 Login form data:', { email, password, role });
    console.log('🔍 Email value:', email);
    console.log('🔍 Password value:', password);
    console.log('🔍 Role value:', role);

    try {
      await handleLogin({ email, password, role });
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(err.response.data.email || email);
        setError(err.response.data.message || "Email verification required");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(verificationEmail);
      setError("Verification email sent! Please check your inbox.");
      setRequiresVerification(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

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
                Welcome <span className="text-[#F59E0B]">Back</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Sign in to continue your journey with skilled professionals and amazing opportunities.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
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

          {/* Right Side - Login Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-white/20 max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#151E3D] mb-1">Sign In</h3>
              <p className="text-[#151E3D]/70 text-sm">Enter your credentials to access your account</p>
            </div>

            {/* Role Toggle */}
            <div className="flex justify-between mb-6 bg-gradient-to-r from-[#151E3D]/5 to-[#F59E0B]/5 p-1 rounded-xl border border-[#F59E0B]/20">
              <button
                onClick={() => setRole("customer")}
                className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 ${
                  role === "customer"
                    ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg transform scale-105"
                    : "text-[#151E3D] hover:bg-white/50 hover:scale-105"
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Customer
              </button>
              <button
                onClick={() => setRole("artisan")}
                className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 ${
                  role === "artisan"
                    ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg transform scale-105"
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
                    <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-3 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-white border-2 border-[#151E3D]/10 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-300 text-[#151E3D] placeholder-[#151E3D]/50 pr-10"
                      placeholder="Enter your password"
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
              </div>
              {error && (
                <div className={`p-3 rounded-lg text-sm border-2 ${
                  requiresVerification 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800' 
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium text-xs">{error}</span>
                  </div>
                </div>
              )}

              {requiresVerification && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-center mb-2">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-xs">Email Verification Required</span>
                  </div>
                  <p className="text-blue-700 mb-3 leading-relaxed text-xs">
                    Please check your email ({verificationEmail}) and click the verification link to activate your account.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-xs"
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Email"}
                  </button>
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
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center mt-4 mb-4">
                <Link 
                  to="/forgot-password" 
                  className="inline-block text-[#F59E0B] font-semibold hover:text-[#D97706] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 rounded-lg px-4 py-2 text-sm hover:bg-[#F59E0B]/10 border border-[#F59E0B]/20 hover:border-[#F59E0B]"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>

            {/* Signup Redirect */}
            <div className="text-center mt-6 pt-4 border-t border-[#151E3D]/10">
              <p className="text-[#151E3D]/70 text-sm">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-[#F59E0B] font-semibold hover:text-[#D97706] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 rounded-lg px-2 py-1"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
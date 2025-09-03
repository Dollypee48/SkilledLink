import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

    try {
      await handleLogin(email, password, role);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151E3D]">
      <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-2 text-[#151E3D]">Welcome Back</h2>
        <p className="text-sm text-gray-600 mb-6">Sign in to your account</p>

        {/* Role Toggle */}
        <div className="flex justify-between mb-6 bg-[#F5F5F5] p-1 rounded-full shadow-inner">
          <button
            onClick={() => setRole("customer")}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 ${
              role === "customer"
                ? "bg-[#151E3D] text-white shadow-md"
                : "text-[#151E3D] hover:bg-[#151E3D]/10"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole("artisan")}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 ${
              role === "artisan"
                ? "bg-[#151E3D] text-white shadow-md"
                : "text-[#151E3D] hover:bg-[#151E3D]/10"
            }`}
          >
            Artisan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-[#151E3D]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
                required
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-[#151E3D]">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D] pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-[#151E3D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 rounded"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Redirect */}
        <p className="text-sm mt-4 text-[#151E3D]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#151E3D] font-medium hover:underline transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 rounded">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
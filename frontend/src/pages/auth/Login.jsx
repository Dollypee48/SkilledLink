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
  const [loading, setLoading] = useState(false); // ✅ local loading state
  const navigate = useNavigate();

  const { user, handleLogin } = useAuth();

  // Redirect after login
  useEffect(() => {
    if (user) {
      const role = user.role || "customer";
      navigate(`/${role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const handleRoleChange = (selectedRole) => setRole(selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await handleLogin({ email, password, role }); // ✅ send role
      // no manual navigate here — useEffect handles redirect
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5A1F00]">
      <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-2 text-[#5A1F00]">Welcome Back</h2>
        <p className="text-sm text-gray-600 mb-6">
          Sign in to continue to your account
        </p>

        {/* Role Toggle */}
        <div className="flex justify-between mb-6 bg-[#F5F5F5] p-1 rounded-full shadow-inner">
          <button
            onClick={() => handleRoleChange("customer")}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition ${
              role === "customer"
                ? "bg-[#5A1F00] text-white shadow-md"
                : "text-[#5A1F00]"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleRoleChange("artisan")}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition ${
              role === "artisan"
                ? "bg-[#5A1F00] text-white shadow-md"
                : "text-[#5A1F00]"
            }`}
          >
            Artisan
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-sm font-medium text-[#5A1F00]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#5A1F00]">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-[#5A1F00]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#5A1F00] font-semibold shadow-md transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Redirect */}
        <p className="text-sm mt-4 text-[#5A1F00]">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#5A1F00] font-medium hover:underline transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

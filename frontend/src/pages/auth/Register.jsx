import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please check your network or try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151E3D]">
      <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center mt-16">
        <h2 className="text-lg font-semibold mb-2 text-[#151E3D]">Create Account</h2>
        <p className="text-sm text-gray-600 mb-6">Sign up to join SkilledLink</p>

        {/* Role Toggle */}
        <div className="flex justify-between mb-6 bg-[#F5F5F5] p-1 rounded-full shadow-inner">
          <button
            onClick={() => handleRoleChange('customer')}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 ${
              formData.role === 'customer' ? 'bg-[#151E3D] text-white shadow-md' : 'text-[#151E3D] hover:bg-[#151E3D]/10'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleRoleChange('artisan')}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 ${
              formData.role === 'artisan' ? 'bg-[#151E3D] text-white shadow-md' : 'text-[#151E3D] hover:bg-[#151E3D]/10'
            }`}
          >
            Artisan
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-[#151E3D]">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#151E3D]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-[#151E3D]">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D] pr-10"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-[#151E3D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 rounded"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-[#151E3D]">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#151E3D] pr-10"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-[#151E3D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 rounded"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error Display and Submit Button */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
          >
            Register
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-sm mt-4 text-[#151E3D]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#151E3D] font-medium hover:underline transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 rounded"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
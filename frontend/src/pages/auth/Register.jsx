import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    nationality: 'Nigeria',
    state: '',
    address: '',
    skills: '', // Added for artisans
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const africanCountries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Algeria', 'Egypt', 'Morocco', 'Uganda',
    'Tunisia', 'Ethiopia', 'Senegal', 'Cameroon', 'Angola', 'Zambia', 'Zimbabwe',
  ];

  const nigerianStates = [
    'Lagos', 'Abuja', 'Kano', 'Oyo', 'Rivers', 'Kaduna', 'Delta', 'Ogun', 'Edo', 'Enugu',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'skills' ? value.split(',').map(skill => skill.trim()) : value,
    }));
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, and a special character (!@#$%^&*).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!africanCountries.includes(formData.nationality)) {
      setError('Please select a nationality from African countries only.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Added header for JSON
        body: JSON.stringify(formData), // Send as JSON instead of FormData
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
    <div className="min-h-screen flex items-center justify-center bg-[#5A1F00]">
      <div className="bg-white rounded-md shadow-lg p-8 w-full max-w-md text-center mt-16">
        <h2 className="text-lg font-semibold mb-2 text-[#5A1F00]">Create Account</h2>
        <p className="text-sm text-gray-600 mb-6">Sign up to join SkilledLink</p>

        {/* Role Toggle */}
        <div className="flex justify-between mb-6 bg-[#F5F5F5] p-1 rounded-full shadow-inner">
          <button
            onClick={() => handleRoleChange('customer')}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition ${
              formData.role === 'customer' ? 'bg-[#5A1F00] text-white shadow-md' : 'text-[#5A1F00]'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleRoleChange('artisan')}
            className={`w-1/2 py-2 rounded-full text-sm font-medium transition ${
              formData.role === 'artisan' ? 'bg-[#5A1F00] text-white shadow-md' : 'text-[#5A1F00]'
            }`}
          >
            Artisan
          </button>
        </div>

        {/* Form in One Column */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-[#5A1F00]">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00] pr-10"
                required
              />
              <span
                className="absolute right-2 top-9 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-[#5A1F00]">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00] pr-10"
                required
              />
              <span
                className="absolute right-2 top-9 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              >
                {africanCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              >
                <option value="">Select State</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#5A1F00]">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                required
              />
            </div>
            {formData.role === 'artisan' && (
              <div>
                <label className="text-sm font-medium text-[#5A1F00]">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#5A1F00]"
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                />
              </div>
            )}
          </div>

          {/* Error Display and Submit Button */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#5A1F00] font-semibold shadow-md transition"
          >
            Register
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-sm mt-4 text-[#5A1F00]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#5A1F00] font-medium hover:underline transition"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
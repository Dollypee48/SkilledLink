import React, { useState, useEffect } from "react";
import CustomerLayout from "../../components/common/Layouts/CustomerLayout";
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { User, CheckCircle, Clock, RefreshCw, Calendar, Mail, Shield } from 'lucide-react'; // Import icons

const CustomerProfile = () => {
  const { user, accessToken } = useAuth(); // Get user and accessToken from AuthContext
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const getEmailVerificationDisplay = (isVerified) => {
    if (isVerified) {
      return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>;
    } else {
      return <span className="text-yellow-600 font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>;
    }
  };

  // Fetch current customer profile
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (user?.role === 'customer' && accessToken) {
        try {
          setLoading(true);
          setError(null);
          // For customers, we can use the user data directly or make an API call if needed
          setCurrentProfile(user);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCurrentProfile();
  }, [user?.role, accessToken, user]);

  const refreshProfile = async () => {
    if (user?.role === 'customer' && accessToken) {
      try {
        setLoading(true);
        setError(null);
        // Refresh user data from context or make API call
        setCurrentProfile(user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to refresh profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Verification email sent successfully! Please check your email.');
      } else {
        alert(data.message || 'Failed to send verification email');
      }
    } catch (err) {
      alert('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-8 min-h-screen bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#151E3D] text-center flex-1">My Profile</h1>
          {user?.role === 'customer' && (
            <button
              onClick={refreshProfile}
              disabled={loading}
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Profile</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151E3D] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-4 py-2 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && user ? (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8 pb-6 border-b border-gray-200">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-[#151E3D] shadow-md" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#151E3D] shadow-md">
                  <User className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-lg text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700 mb-8">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-base font-semibold mt-1">{user.phone || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Address</span>
                <span className="text-base font-semibold mt-1">{user.address || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Nationality</span>
                <span className="text-base font-semibold mt-1">{user.nationality || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">State</span>
                <span className="text-base font-semibold mt-1">{user.state || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Occupation</span>
                <span className="text-base font-semibold mt-1">{user.occupation || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Account Status</span>
                <span className={`text-base font-semibold mt-1 ${user.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                  {user.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <span className="text-base font-semibold mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Customer-specific information */}
            <div className="border-t pt-8 mt-8 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Email Verification</span>
                  <div className="mt-1 flex items-center gap-2">
                    {getEmailVerificationDisplay(user.isVerified)}
                    {!user.isVerified && (
                      <button
                        onClick={resendVerificationEmail}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <Mail className="w-3 h-3" />
                        Resend
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Profile Completion</span>
                  <span className="text-base font-semibold mt-1">
                    {(() => {
                      const fields = ['name', 'phone', 'address', 'nationality', 'state', 'occupation'];
                      const completed = fields.filter(field => user[field] && user[field].trim() !== '').length;
                      const percentage = Math.round((completed / fields.length) * 100);
                      return `${percentage}% Complete`;
                    })()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-base font-semibold mt-1">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">User ID</span>
                  <span className="text-base font-semibold mt-1 font-mono text-sm">
                    {user._id ? user._id.slice(-8) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/customer-settings'}
                  className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => window.location.href = '/customer-dashboard'}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg py-12">Please log in to view your profile.</p>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;

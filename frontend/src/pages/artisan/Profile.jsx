import React, { useState, useEffect } from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { User, CheckCircle, XCircle, Clock, Star, Mail, Crown } from 'lucide-react'; // Import icons
import * as artisanService from "../../services/artisanService";
import PremiumBadge from "../../components/PremiumBadge";

const ArtisanProfile = () => {
  const { user, accessToken } = useAuth(); // Get user and accessToken from AuthContext
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getKycStatusDisplay = (status) => {
    switch (status) {
      case 'approved': return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved</span>;
      case 'pending': return <span className="text-yellow-600 font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>;
      case 'rejected': return <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Rejected</span>;
      default: return <span className="text-gray-500 font-medium">Not Submitted</span>;
    }
  };

  const getEmailVerificationDisplay = (isVerified) => {
    if (isVerified) {
      return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>;
    } else {
      return <span className="text-yellow-600 font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>;
    }
  };

  // Fetch current artisan profile with calculated ratings
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (user?.role === 'artisan' && accessToken) {
        try {
          setLoading(true);
          setError(null);
                     const profileData = await artisanService.getProfile(accessToken);
          
          setCurrentProfile(profileData);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCurrentProfile();
  }, [user?.role, accessToken]);

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
    <ArtisanLayout>
      <div className="p-8 min-h-screen bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#151E3D] text-center flex-1">My Profile</h1>
          {user?.role === 'artisan' && (
            <button
              onClick={() => {
                setLoading(true);
                artisanService.getProfile(accessToken)
                  .then(profileData => {
                    setCurrentProfile(profileData);
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.response?.data?.message || 'Failed to refresh profile');
                  })
                  .finally(() => setLoading(false));
              }}
              disabled={loading}
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                  {user.isPremium && (
                    <PremiumBadge size="md" variant="default" showText={true} />
                  )}
                </div>
                <p className="text-lg text-gray-600 mt-1">{user.email}</p>
                {user.isPremium && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      Premium Artisan
                    </span>
                  </div>
                )}
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
                <span className="text-sm font-medium text-gray-500">KYC Status</span>
                <span className="mt-1">{getKycStatusDisplay(user.kycStatus)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Account Status</span>
                <span className={`text-base font-semibold mt-1 ${user.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                  {user.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <span className="text-base font-semibold mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {user.role === 'artisan' && user.artisanProfile && (
              <div className="border-t pt-8 mt-8 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-5">Artisan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Primary Service</span>
                    <span className="text-base font-semibold mt-1">{currentProfile?.artisanProfile?.service || user?.artisanProfile?.service || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Experience</span>
                    <span className="text-base font-semibold mt-1">{currentProfile?.artisanProfile?.experience || user?.artisanProfile?.experience || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">Bio</span>
                    <span className="text-base font-semibold mt-1">{currentProfile?.artisanProfile?.bio || user?.artisanProfile?.bio || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">Skills</span>
                    {(currentProfile?.artisanProfile?.skills || user?.artisanProfile?.skills) && (currentProfile?.artisanProfile?.skills || user?.artisanProfile?.skills).length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(currentProfile?.artisanProfile?.skills || user?.artisanProfile?.skills).map((skill, index) => (
                          <span key={index} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base font-semibold text-gray-500 mt-1">No skills listed.</span>
                    )}
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">Rating & Reviews</span>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-1">
                          {Array(5).fill().map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(currentProfile?.artisanProfile?.rating || 0) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold text-yellow-600 ml-2">
                          {currentProfile?.artisanProfile?.rating ? currentProfile.artisanProfile.rating.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-sm text-yellow-700">/ 5</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on customer reviews
                      </div>
                      {currentProfile?.artisanProfile?.reviewCount && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {currentProfile.artisanProfile.reviewCount} {currentProfile.artisanProfile.reviewCount === 1 ? 'review' : 'reviews'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/artisan-settings'}
                  className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => window.location.href = '/artisan-dashboard'}
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
    </ArtisanLayout>
  );
};

export default ArtisanProfile;

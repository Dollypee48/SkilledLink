import React, { useState, useEffect } from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  User, CheckCircle, XCircle, Clock, Star, Mail, Crown, 
  MapPin, Phone, Calendar, DollarSign, Briefcase, Award,
  Edit3, Shield, Camera, RefreshCw, TrendingUp, Users, 
  Target, Zap, Globe, FileText, CheckCircle2, Wrench
} from 'lucide-react';
import * as artisanService from "../../services/artisanService";
import PremiumBadge from "../../components/PremiumBadge";

const ArtisanProfile = () => {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  // Fetch current artisan profile
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

  // Refresh profile when page becomes visible (e.g., returning from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.role === 'artisan' && accessToken) {
        refreshProfile();
      }
    };

    const handleFocus = () => {
      if (user?.role === 'artisan' && accessToken) {
        refreshProfile();
      }
    };

    // Listen for page visibility changes and focus events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.role, accessToken]);

  // Refresh profile when location changes (e.g., returning from settings)
  useEffect(() => {
    if (location.pathname === '/artisan-profile' && user?.role === 'artisan' && accessToken) {
      refreshProfile();
    }
  }, [location.pathname, user?.role, accessToken]);

  const refreshProfile = async (showLoading = false) => {
    if (user?.role === 'artisan' && accessToken) {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);
        const profileData = await artisanService.getProfile(accessToken);
        setCurrentProfile(profileData);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to refresh profile');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    const requiredFields = [
      'name', 'email', 'phone', 'address', 'nationality', 'state', 'occupation'
    ];
    
    const artisanFields = [
      'service', 'bio', 'experience', 'skills'
    ];
    
    let completedFields = 0;
    let totalFields = requiredFields.length + artisanFields.length;
    
    // Check basic user fields
    requiredFields.forEach(field => {
      if (user[field] && user[field].toString().trim() !== '') {
        completedFields++;
      }
    });
    
    // Check artisan-specific fields
    const artisanProfile = currentProfile?.artisanProfile || user?.artisanProfile;
    if (user.role === 'artisan' && artisanProfile) {
      artisanFields.forEach(field => {
        const value = artisanProfile[field];
        if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '')) {
          completedFields++;
        }
      });
    }
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const artisanProfile = currentProfile?.artisanProfile || user?.artisanProfile;
  
  // Debug logging
  console.log('Profile Debug Info:');
  console.log('currentProfile:', currentProfile);
  console.log('user:', user);
  console.log('artisanProfile:', artisanProfile);
  console.log('artisanProfile?.service:', artisanProfile?.service);
  console.log('artisanProfile?.experience:', artisanProfile?.experience);
  console.log('artisanProfile?.bio:', artisanProfile?.bio);

  return (
    <ArtisanLayout>
      <div className="p-8 min-h-screen bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-[#151E3D]">My Profile</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {user?.role === 'artisan' && (
            <button
              onClick={() => refreshProfile(true)}
              disabled={loading}
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Profile'}</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151E3D] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto text-center">
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
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8 pb-6 border-b border-gray-200">
              <div className="relative">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#151E3D] shadow-md" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#151E3D] shadow-md">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                {user.isPremium && (
                  <div className="absolute -top-2 -right-2">
                    <PremiumBadge size="sm" variant="default" showText={false} />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                  {user.isPremium && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mt-1">{user.email}</p>
                {artisanProfile?.service && (
                  <p className="text-base text-[#151E3D] font-semibold mt-1 flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-4 h-4" />
                    {artisanProfile.service}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start space-x-1 mt-2">
                  {Array(5).fill().map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(artisanProfile?.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    {artisanProfile?.rating ? artisanProfile.rating.toFixed(1) : '0.0'}
                    {artisanProfile?.reviewCount && (
                      <span className="text-gray-500 ml-1">
                        ({artisanProfile.reviewCount} review{artisanProfile.reviewCount !== 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700 mb-8">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-base font-semibold mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Address</span>
                <span className="text-base font-semibold mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {user.address || 'Not provided'}
                </span>
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
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <span className="text-base font-semibold mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Profile Completion</span>
                <span className="text-base font-semibold mt-1">{profileCompletion}% Complete</span>
              </div>
            </div>

            {/* Professional Information */}
            {user.role === 'artisan' && (
              <div className="border-t pt-8 mt-8 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700 mb-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Service Type</span>
                    <span className="text-base font-semibold mt-1">{artisanProfile?.service || 'Not specified'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Years of Experience</span>
                    <span className="text-base font-semibold mt-1">{artisanProfile?.experience || 'Not specified'}</span>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-500">Professional Bio</span>
                  <p className="text-base font-semibold mt-1 text-gray-700 leading-relaxed">
                    {artisanProfile?.bio || 'Not provided'}
                  </p>
                </div>

                {/* Skills Section */}
                {artisanProfile?.skills && artisanProfile.skills.length > 0 && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-500">Skills</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {artisanProfile.skills.map((skill, index) => (
                        <span key={index} className="bg-[#151E3D] text-white px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Information */}
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
                  <span className="text-sm font-medium text-gray-500">KYC Status</span>
                  <div className="mt-1">{getKycStatusDisplay(user.kycStatus)}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Account Status</span>
                  <span className={`text-base font-semibold mt-1 ${user.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-base font-semibold mt-1">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
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
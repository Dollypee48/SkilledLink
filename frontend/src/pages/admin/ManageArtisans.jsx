// frontend/src/pages/admin/ManageArtisans.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Eye, X, Star, MapPin, Phone, Mail, Calendar, Shield, Award, Clock, User, CheckCircle, XCircle, Wrench, DollarSign, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react';

const ManageArtisans = () => {
  const { accessToken } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchArtisans = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await adminService.getAllArtisans(accessToken);
        setArtisans(data);
      } catch (err) {
        setError(err.message || "Failed to fetch artisans");
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [accessToken]);

  const handleView = (artisan) => {
    setSelectedArtisan(artisan);
    setShowViewModal(true);
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return <span className="text-gray-400">No ratings yet</span>;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading artisans...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Artisans</h1>
        
        {artisans.length === 0 ? (
          <p className="text-gray-600">No artisans found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">KYC Verified</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Occupation</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Rating</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artisans.map((artisan) => (
                  <tr key={artisan._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{artisan.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{artisan.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {artisan.kycVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{artisan.occupation || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {renderStars(artisan.artisanProfile?.averageRating)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleView(artisan)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {!artisan.kycVerified && (
                          <button className="text-green-600 hover:text-green-900 flex items-center">
                            <Shield className="w-4 h-4 mr-1" />
                            Verify KYC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Artisan Details Modal */}
        {showViewModal && selectedArtisan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Artisan Details: {selectedArtisan.name}</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedArtisan.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedArtisan.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedArtisan.state ? `${selectedArtisan.state}, Nigeria` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="ml-2 text-sm font-medium">
                          {new Date(selectedArtisan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Account Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Email Verified:</span>
                        <span className="ml-2">
                          {selectedArtisan.isVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">KYC Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedArtisan.kycVerified ? 'bg-green-100 text-green-800' :
                          selectedArtisan.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedArtisan.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedArtisan.kycVerified ? 'Verified' :
                           selectedArtisan.kycStatus === 'pending' ? 'Pending' :
                           selectedArtisan.kycStatus === 'rejected' ? 'Rejected' :
                           'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Account Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedArtisan.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedArtisan.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                {selectedArtisan.artisanProfile && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <Wrench className="w-5 h-5 mr-2" />
                      Professional Information
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Service:</span>
                          <span className="ml-2 text-sm font-medium capitalize">
                            {selectedArtisan.artisanProfile.service || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Experience:</span>
                          <span className="ml-2 text-sm font-medium">
                            {selectedArtisan.artisanProfile.experience || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Hourly Rate:</span>
                          <span className="ml-2 text-sm font-medium">
                            ₦{selectedArtisan.artisanProfile.hourlyRate || '0'}/hour
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Availability:</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedArtisan.artisanProfile.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedArtisan.artisanProfile.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="ml-2">
                            {renderStars(selectedArtisan.artisanProfile.averageRating)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Total Jobs:</span>
                          <span className="ml-2 text-sm font-medium">
                            {selectedArtisan.artisanProfile.totalJobs || '0'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Completed Jobs:</span>
                          <span className="ml-2 text-sm font-medium">
                            {selectedArtisan.artisanProfile.completedJobs || '0'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Total Earnings:</span>
                          <span className="ml-2 text-sm font-medium">
                            ₦{selectedArtisan.artisanProfile.totalEarnings || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {selectedArtisan.artisanProfile.bio && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Bio</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedArtisan.artisanProfile.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedArtisan.artisanProfile.skills && selectedArtisan.artisanProfile.skills.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedArtisan.artisanProfile.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Images */}
                    {selectedArtisan.artisanProfile.portfolioImages && selectedArtisan.artisanProfile.portfolioImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Portfolio</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {selectedArtisan.artisanProfile.portfolioImages.map((image, index) => (
                            <div key={index} className="border rounded-lg p-2">
                              <img 
                                src={image} 
                                alt={`Portfolio ${index + 1}`} 
                                className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="text-xs text-gray-500 mt-1 text-center" style={{display: 'none'}}>
                                <ImageIcon className="w-4 h-4 mx-auto" />
                                Image not available
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* KYC Documents */}
                {(selectedArtisan.kycDocuments?.governmentIdFront || selectedArtisan.kycDocuments?.governmentIdBack || 
                  selectedArtisan.kycDocuments?.addressProof || selectedArtisan.kycDocuments?.faceImage || 
                  selectedArtisan.kycDocuments?.credentials || selectedArtisan.kycDocuments?.portfolio ||
                  selectedArtisan.idProof || selectedArtisan.addressProof || selectedArtisan.faceImage) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <FileText className="w-5 h-5 mr-2" />
                      KYC Documents
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Government ID Front */}
                      {(selectedArtisan.kycDocuments?.governmentIdFront || selectedArtisan.idProof) && (
                        <div className="border rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {selectedArtisan.kycDocuments?.governmentIdType ? 
                              `${selectedArtisan.kycDocuments.governmentIdType.replace('_', ' ').toUpperCase()} - Front` : 
                              'Government ID - Front'
                            }
                          </h5>
                          <img 
                            src={selectedArtisan.kycDocuments?.governmentIdFront || selectedArtisan.idProof} 
                            alt="Government ID Front" 
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(selectedArtisan.kycDocuments?.governmentIdFront || selectedArtisan.idProof, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-2" style={{display: 'none'}}>
                            Document uploaded - Click to view full size
                          </div>
                        </div>
                      )}

                      {/* Address Proof */}
                      {(selectedArtisan.kycDocuments?.addressProof || selectedArtisan.addressProof) && (
                        <div className="border rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {selectedArtisan.kycDocuments?.addressProofType ? 
                              `${selectedArtisan.kycDocuments.addressProofType.replace('_', ' ').toUpperCase()}` : 
                              'Address Proof'
                            }
                          </h5>
                          <img 
                            src={selectedArtisan.kycDocuments?.addressProof || selectedArtisan.addressProof} 
                            alt="Address Proof" 
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(selectedArtisan.kycDocuments?.addressProof || selectedArtisan.addressProof, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-2" style={{display: 'none'}}>
                            Document uploaded - Click to view full size
                          </div>
                        </div>
                      )}

                      {/* Face Image */}
                      {(selectedArtisan.kycDocuments?.faceImage || selectedArtisan.faceImage) && (
                        <div className="border rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Face Recognition Image</h5>
                          <img 
                            src={selectedArtisan.kycDocuments?.faceImage || selectedArtisan.faceImage} 
                            alt="Face Image" 
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(selectedArtisan.kycDocuments?.faceImage || selectedArtisan.faceImage, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-2" style={{display: 'none'}}>
                            Image uploaded - Click to view full size
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                {!selectedArtisan.kycVerified && (
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify KYC
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageArtisans;

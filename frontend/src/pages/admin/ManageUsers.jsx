// frontend/src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
import { Edit, Ban, UserCheck, Eye, X, Shield, Mail, Phone, MapPin, Calendar, FileText, CheckCircle, XCircle, Clock, User } from 'lucide-react'; // Icons for actions

const ManageUsers = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(accessToken);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsSuspended(user.isSuspended);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      if (newRole !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser._id, newRole, accessToken);
      }
      if (isSuspended !== selectedUser.isSuspended) {
        await adminService.suspendUser(selectedUser._id, isSuspended, accessToken);
      }
      // Refresh user list
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const toggleSuspend = async (user) => {
    try {
      await adminService.suspendUser(user._id, !user.isSuspended, accessToken);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle suspension status');
    }
  };

  const handleKycAction = async (userId, action) => {
    try {
      setKycActionLoading(true);
      if (action === 'approve') {
        await adminService.approveKyc(userId, accessToken);
      } else if (action === 'reject') {
        await adminService.rejectKyc(userId, accessToken);
      }
      // Refresh user list and update selected user
      await fetchUsers();
      // Update selected user in the modal
      const updatedUser = users.find(u => u._id === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      setError(err.message || `Failed to ${action} KYC`);
    } finally {
      setKycActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>
          <p>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 text-[#151E3D]">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KYC Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Suspended</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'artisan' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.kycVerified ? 'bg-green-100 text-green-800' :
                      user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.kycVerified ? 'Verified' :
                       user.kycStatus === 'pending' ? 'Pending' :
                       user.kycStatus === 'rejected' ? 'Rejected' :
                       'Not Submitted'}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${user.isSuspended ? 'text-red-900' : 'text-green-900'}`}>
                      <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${user.isSuspended ? 'bg-red-200' : 'bg-green-200'}`}></span>
                      <span className="relative">{user.isSuspended ? 'Yes' : 'No'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleView(user)} 
                        className="text-indigo-600 hover:text-indigo-900" 
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(user)} 
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleSuspend(user)} 
                        className={`${user.isSuspended ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`} 
                        title={user.isSuspended ? "Unsuspend User" : "Suspend User"}
                      >
                        {user.isSuspended ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User: {selectedUser.name}</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="customer">customer</option>
                  <option value="artisan">artisan</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox" checked={isSuspended} onChange={(e) => setIsSuspended(e.target.checked)} />
                  <span className="ml-2 text-gray-700">Suspended</span>
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowEditModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300">Cancel</button>
                <button onClick={handleSaveEdit} className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 transition-all duration-300">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* View User Details Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">User Details: {selectedUser.name}</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          selectedUser.role === 'artisan' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="ml-2 text-sm font-medium">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
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
                          {selectedUser.isVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Account Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KYC Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <FileText className="w-5 h-5 mr-2" />
                    KYC Verification Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">KYC Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.kycVerified ? 'bg-green-100 text-green-800' :
                          selectedUser.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedUser.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.kycVerified ? 'Verified' :
                           selectedUser.kycStatus === 'pending' ? 'Pending' :
                           selectedUser.kycStatus === 'rejected' ? 'Rejected' :
                           'Not Submitted'}
                        </span>
                      </div>
                      
                      {selectedUser.kycStatus && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="ml-2 text-sm font-medium capitalize">{selectedUser.kycStatus}</span>
                        </div>
                      )}

                      {selectedUser.kycVerified && selectedUser.kycVerifiedAt && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Verified On:</span>
                          <span className="ml-2 text-sm font-medium">
                            {new Date(selectedUser.kycVerifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedUser.nationality && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Nationality:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.nationality}</span>
                        </div>
                      )}
                      
                      {selectedUser.state && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">State:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.state}</span>
                        </div>
                      )}

                      {selectedUser.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Address:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.address}</span>
                        </div>
                      )}

                      {selectedUser.occupation && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Occupation:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.occupation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KYC Documents */}
                  {(selectedUser.kycDocuments?.governmentIdFront || selectedUser.kycDocuments?.governmentIdBack || 
                    selectedUser.kycDocuments?.addressProof || selectedUser.kycDocuments?.faceImage || 
                    selectedUser.kycDocuments?.credentials || selectedUser.kycDocuments?.portfolio ||
                    selectedUser.idProof || selectedUser.addressProof || selectedUser.faceImage) && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">KYC Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Government ID Front */}
                        {(selectedUser.kycDocuments?.governmentIdFront || selectedUser.idProof) && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              {selectedUser.kycDocuments?.governmentIdType ? 
                                `${selectedUser.kycDocuments.governmentIdType.replace('_', ' ').toUpperCase()} - Front` : 
                                'Government ID - Front'
                              }
                            </h5>
                            <img 
                              src={selectedUser.kycDocuments?.governmentIdFront || selectedUser.idProof} 
                              alt="Government ID Front" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments?.governmentIdFront || selectedUser.idProof, '_blank')}
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

                        {/* Government ID Back */}
                        {selectedUser.kycDocuments?.governmentIdBack && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              {selectedUser.kycDocuments.governmentIdType ? 
                                `${selectedUser.kycDocuments.governmentIdType.replace('_', ' ').toUpperCase()} - Back` : 
                                'Government ID - Back'
                              }
                            </h5>
                            <img 
                              src={selectedUser.kycDocuments.governmentIdBack} 
                              alt="Government ID Back" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments.governmentIdBack, '_blank')}
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
                        {(selectedUser.kycDocuments?.addressProof || selectedUser.addressProof) && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              {selectedUser.kycDocuments?.addressProofType ? 
                                `${selectedUser.kycDocuments.addressProofType.replace('_', ' ').toUpperCase()}` : 
                                'Address Proof'
                              }
                            </h5>
                            <img 
                              src={selectedUser.kycDocuments?.addressProof || selectedUser.addressProof} 
                              alt="Address Proof" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments?.addressProof || selectedUser.addressProof, '_blank')}
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
                        {(selectedUser.kycDocuments?.faceImage || selectedUser.faceImage) && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Face Recognition Image</h5>
                            <img 
                              src={selectedUser.kycDocuments?.faceImage || selectedUser.faceImage} 
                              alt="Face Image" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments?.faceImage || selectedUser.faceImage, '_blank')}
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

                        {/* Professional Credentials (for artisans) */}
                        {selectedUser.kycDocuments?.credentials && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Professional Credentials</h5>
                            <img 
                              src={selectedUser.kycDocuments.credentials} 
                              alt="Professional Credentials" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments.credentials, '_blank')}
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

                        {/* Portfolio (for artisans) */}
                        {selectedUser.kycDocuments?.portfolio && (
                          <div className="border rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Portfolio</h5>
                            <img 
                              src={selectedUser.kycDocuments.portfolio} 
                              alt="Portfolio" 
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(selectedUser.kycDocuments.portfolio, '_blank')}
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
                      </div>
                      
                      {/* Document Types Summary */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Document Types Submitted:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.kycDocuments?.governmentIdType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {selectedUser.kycDocuments.governmentIdType.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                          {selectedUser.kycDocuments?.addressProofType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {selectedUser.kycDocuments.addressProofType.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                          {selectedUser.kycDocuments?.faceImage && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Face Recognition
                            </span>
                          )}
                          {selectedUser.kycDocuments?.credentials && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Professional Credentials
                            </span>
                          )}
                          {selectedUser.kycDocuments?.portfolio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Portfolio
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedUser.kycVerified && !selectedUser.kycStatus && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        No KYC documents submitted yet
                      </p>
                    </div>
                  )}

                  {/* KYC Action Buttons */}
                  {selectedUser.kycStatus === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="text-sm font-medium text-yellow-800 mb-3">KYC Verification Required</h5>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleKycAction(selectedUser._id, 'approve')}
                          disabled={kycActionLoading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {kycActionLoading ? 'Processing...' : 'Approve KYC'}
                        </button>
                        <button
                          onClick={() => handleKycAction(selectedUser._id, 'reject')}
                          disabled={kycActionLoading}
                          className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {kycActionLoading ? 'Processing...' : 'Reject KYC'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedUser);
                  }} 
                  className="px-4 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;

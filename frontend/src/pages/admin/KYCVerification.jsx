import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { kycService } from '../../services/kycService';
import { CheckCircle, XCircle, Loader2, FileText, Download } from 'lucide-react';

const KYCVerification = () => {
  const { accessToken } = useAuth();
  const [pendingKYC, setPendingKYC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingKYC = async () => {
    if (!accessToken) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await kycService.getPendingKYC(accessToken);
      setPendingKYC(data);
    } catch (err) {
      setError(err.message || "Failed to fetch pending KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKYC();
  }, [accessToken]);

  const handleVerify = async (userId, status) => {
    if (!accessToken) {
      setError("Authentication token is missing.");
      return;
    }
    try {
      const res = await kycService.verifyKYC(userId, status, accessToken);
      // Update the user in the pendingKYC list directly
      setPendingKYC(prev => prev.map(user => user._id === userId ? res.user : user));
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message || `Failed to ${status} KYC request.`);
    }
  };

  const renderDocumentLink = (docPath, docName) => {
    if (!docPath) return 'N/A';
    const fullPath = `http://localhost:5000/${docPath.replace(/\\/g, '/')}`;
    return (
      <a
        href={fullPath}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:text-indigo-900 flex items-center"
      >
        <Download className="w-4 h-4 mr-1" /> {docName}
      </a>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading pending KYC requests...</p>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">KYC Verification</h1>
        
        {pendingKYC.length === 0 ? (
          <p className="text-gray-600">No pending KYC requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID Proof</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Address Proof</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Credentials</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingKYC.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 capitalize">{user.role}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {renderDocumentLink(user.kycDocuments?.idProof, 'ID Proof')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {renderDocumentLink(user.kycDocuments?.addressProof, 'Address Proof')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {user.role === 'artisan' ? renderDocumentLink(user.kycDocuments?.credentials, 'Credentials') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 capitalize">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button
                        onClick={() => handleVerify(user._id, 'approved')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(user._id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default KYCVerification;

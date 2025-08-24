// frontend/src/pages/admin/ManageArtisans.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ManageArtisans = () => {
  const { accessToken } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                    <td className="py-3 px-4 text-sm text-gray-800">{artisan.artisanProfile?.averageRating || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {/* Actions like View Profile, Verify KYC (if not verified) */}
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      {!artisan.kycVerified && (
                        <button className="text-green-600 hover:text-green-900">Verify KYC</button>
                      )}
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

export default ManageArtisans;

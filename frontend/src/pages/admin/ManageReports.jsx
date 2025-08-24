// frontend/src/pages/admin/ManageReports.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ManageReports = () => {
  const { accessToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await adminService.getAllReports(accessToken);
        setReports(data);
      } catch (err) {
        setError(err.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [accessToken]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading reports...</p>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reports</h1>
        
        {reports.length === 0 ? (
          <p className="text-gray-600">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Report ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Reported By</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Reported User</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Reason</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{report._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{report.reportedBy?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{report.reportedUser?.name || 'N/A'} ({report.reportedUser?.role || 'N/A'})</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{report.reason || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900 mr-3">Resolve</button>
                      <button className="text-red-600 hover:text-red-900">Reject</button>
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

export default ManageReports;

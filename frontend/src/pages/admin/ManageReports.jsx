// frontend/src/pages/admin/ManageReports.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, FileText, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

const ManageReports = () => {
  const { accessToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // Fetch both user reports and issues
        const [reportsData, issuesData] = await Promise.all([
          adminService.getAllReports(accessToken),
          adminService.getAllIssues(accessToken)
        ]);
        
        setReports(reportsData.data || []);
        setIssues(issuesData.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleIssueStatusUpdate = async (issueId, newStatus) => {
    try {
      await adminService.updateIssueStatus(issueId, newStatus, null, accessToken);
      // Refresh issues
      const issuesData = await adminService.getAllIssues(accessToken);
      setIssues(issuesData.data || []);
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reports & Issues</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'issues'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Issue Reports ({issues.length})
              </button>
            </nav>
          </div>
        </div>

        {/* User Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {reports.length === 0 ? (
              <p className="text-gray-600">No user reports found.</p>
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
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
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
        )}

        {/* Issue Reports Tab */}
        {activeTab === 'issues' && (
          <div>
            {issues.length === 0 ? (
              <p className="text-gray-600">No issue reports found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Issue ID</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Reporter</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Priority</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">{issue._id.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {issue.reporter?.name || 'N/A'} ({issue.reporter?.role || 'N/A'})
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate" title={issue.title}>
                          {issue.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {issue.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            issue.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1">{issue.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{new Date(issue.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                          {issue.status === 'open' && (
                            <button 
                              onClick={() => handleIssueStatusUpdate(issue._id, 'in-progress')}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Start
                            </button>
                          )}
                          {issue.status === 'in-progress' && (
                            <button 
                              onClick={() => handleIssueStatusUpdate(issue._id, 'resolved')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Resolve
                            </button>
                          )}
                          <button 
                            onClick={() => handleIssueStatusUpdate(issue._id, 'closed')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageReports;

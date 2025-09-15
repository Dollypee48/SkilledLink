// frontend/src/pages/admin/ManageReports.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, FileText, Eye, CheckCircle, Clock, XCircle, X, User, Mail, Phone, Calendar, MessageSquare, Shield, Wrench, Star } from 'lucide-react';

const ManageReports = () => {
  const { accessToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
                        <td className="py-3 px-4 text-sm text-gray-800 font-mono">{report._id.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{report.reportedBy?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{report.reportedUser?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 capitalize">{report.reportedUser?.role || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate" title={report.reason}>
                          {report.reason || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <button 
                            onClick={() => handleViewReport(report)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="View Report Details"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
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
                        <td className="py-3 px-4 text-sm text-gray-800 font-mono">{issue._id.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{issue.reporter?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 capitalize">{issue.reporter?.role || 'N/A'}</div>
                          </div>
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
                            <span className="ml-1 capitalize">{issue.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(issue.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewIssue(issue)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              title="View Issue Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            {issue.status === 'open' && (
                              <button 
                                onClick={() => handleIssueStatusUpdate(issue._id, 'in-progress')}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                                title="Start Working on Issue"
                              >
                                Start
                              </button>
                            )}
                            {issue.status === 'in-progress' && (
                              <button 
                                onClick={() => handleIssueStatusUpdate(issue._id, 'resolved')}
                                className="text-green-600 hover:text-green-900 text-xs"
                                title="Mark as Resolved"
                              >
                                Resolve
                              </button>
                            )}
                            <button 
                              onClick={() => handleIssueStatusUpdate(issue._id, 'closed')}
                              className="text-red-600 hover:text-red-900 text-xs"
                              title="Close Issue"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View Report Details Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Report Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Report ID:</span>
                        <span className="ml-2 text-sm font-medium font-mono">{selectedReport._id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Reason:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reason || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                          {getStatusIcon(selectedReport.status)}
                          <span className="ml-1 capitalize">{selectedReport.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Reported On:</span>
                        <span className="ml-2 text-sm font-medium">
                          {formatDateTime(selectedReport.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Additional Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Description:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReport.description || 'No additional description provided'}
                        </span>
                      </div>
                      {selectedReport.evidence && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Evidence:</span>
                          <span className="ml-2 text-sm font-medium">
                            <a href={selectedReport.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              View Evidence
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Reporter Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedBy?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedBy?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedBy?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="ml-2 text-sm font-medium capitalize">{selectedReport.reportedBy?.role || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Member Since:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReport.reportedBy?.createdAt ? formatDate(selectedReport.reportedBy.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reported User Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Reported User Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedUser?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedUser?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedReport.reportedUser?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="ml-2 text-sm font-medium capitalize">{selectedReport.reportedUser?.role || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Member Since:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedReport.reportedUser?.createdAt ? formatDate(selectedReport.reportedUser.createdAt) : 'N/A'}
                        </span>
                      </div>
                      {selectedReport.reportedUser?.artisanProfile && (
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Service:</span>
                          <span className="ml-2 text-sm font-medium capitalize">
                            {selectedReport.reportedUser.artisanProfile.service || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Issue Details Modal */}
        {showIssueModal && selectedIssue && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                <button 
                  onClick={() => setShowIssueModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Issue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Issue Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Issue ID:</span>
                        <span className="ml-2 text-sm font-medium font-mono">{selectedIssue._id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Title:</span>
                        <span className="ml-2 text-sm font-medium">{selectedIssue.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedIssue.category}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="ml-2 text-sm font-medium">
                          {formatDateTime(selectedIssue.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Status & Priority
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                          {getStatusIcon(selectedIssue.status)}
                          <span className="ml-1 capitalize">{selectedIssue.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Priority:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedIssue.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedIssue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedIssue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedIssue.priority}
                        </span>
                      </div>
                      {selectedIssue.assignedTo && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Assigned To:</span>
                          <span className="ml-2 text-sm font-medium">{selectedIssue.assignedTo.name || 'N/A'}</span>
                        </div>
                      )}
                      {selectedIssue.resolvedAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">Resolved:</span>
                          <span className="ml-2 text-sm font-medium">
                            {formatDateTime(selectedIssue.resolvedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Issue Description
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedIssue.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Reporter Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{selectedIssue.reporter?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{selectedIssue.reporter?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{selectedIssue.reporter?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="ml-2 text-sm font-medium capitalize">{selectedIssue.reporter?.role || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Member Since:</span>
                        <span className="ml-2 text-sm font-medium">
                          {selectedIssue.reporter?.createdAt ? formatDate(selectedIssue.reporter.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Attachment */}
                {selectedIssue.file && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <FileText className="w-5 h-5 mr-2" />
                      Attached File
                    </h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <a 
                        href={selectedIssue.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download Attachment
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowIssueModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageReports;

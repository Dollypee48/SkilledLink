import React, { useState, useEffect, useContext } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import { ReportContext } from "../../context/ReportContext";

const ReportIssue = () => {
  const { submitReport, fetchReports, removeReport, reports, loading, error } = useContext(ReportContext);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState(""); // New state for title
  const [priority, setPriority] = useState("medium"); // New state for priority, with a default

  useEffect(() => {
    fetchReports(); // Fetch existing reports on mount
  }, []);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
      setFile(selectedFile);
      setLocalError("");
    } else {
      setLocalError("Please upload a JPEG or PNG image.");
      setFile(null);
    }
  };

  // Handle issue submission
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!title) return setLocalError("Please provide a title.");
    if (!category) return setLocalError("Please select a category.");
    if (!description.trim()) return setLocalError("Please provide a description.");
    if (!file) return setLocalError("Please upload a file as evidence.");

    setLocalError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("file", file);

    try {
      await submitReport(formData);
      setTitle("");
      setCategory("");
      setDescription("");
      setPriority("medium");
      setFile(null);
      setSuccessMessage("Report submitted successfully!");
    } catch {
      setLocalError("Failed to submit report. Please try again.");
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await removeReport(id);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Report Issue</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Let us know about any problems you’ve encountered so we can assist you quickly.
        </p>

        {/* Report Issue Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit a Report</h2>
          <form onSubmit={handleSubmitIssue} className="space-y-4 text-left">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize the issue..."
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                required
              />
            </div>
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                required
              >
                <option value="">Select a category</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="general">General</option>
                <option value="bug">Bug</option>
                <option value="feature-request">Feature Request</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11] h-28 resize-none"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">Upload Evidence (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
              />
              {file && <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>}
            </div>

            {/* Error & Success Messages */}
            {localError && <p className="text-red-500 text-sm">{localError}</p>}
            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow-md transition"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>

        {/* Reported Issues Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Reported Issues</h2>
          {reports.length === 0 ? (
            <p className="text-gray-600">No issues reported yet.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-[#6b2d11]">{report.category}</h3>
                      <span className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{report.description}</p>
                    {report.file && (
                      <a
                        href={`http://localhost:5000/uploads/${report.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm hover:underline"
                      >
                        View Evidence
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="mt-2 sm:mt-0 sm:ml-4 py-1 px-3 rounded-md bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ReportIssue;

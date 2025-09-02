import React, { useState, useContext, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { IssueContext } from "../../context/IssueContext";
import useAuth from "../../hooks/useAuth";

const ArtisanReport = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [title, setTitle] = useState(""); // New state for title
  const [priority, setPriority] = useState("medium"); // New state for priority, with a default

  const {
    issues,
    loading,
    error: contextError,
    submitIssue,
    fetchMyIssues,
  } = useContext(IssueContext);
  const { user } = useAuth();


  useEffect(() => {
    if (user?.role === "artisan" && fetchMyIssues) {
      fetchMyIssues();
    }
  }, [user, fetchMyIssues]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")
    ) {
      setFile(selectedFile);
      setFormError("");
    } else {
      setFormError("Please upload a JPEG or PNG image.");
      setFile(null);
    }
  };

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!title) {
      setFormError("Please provide a title.");
      return;
    }
    if (!category) {
      setFormError("Please select a category.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please provide a description.");
      return;
    }
    if (!file) {
      setFormError("Please upload a file as evidence.");
      return;
    }

    setFormError("");
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("title", title);
    formData.append("priority", priority);

    try {
      await submitIssue(formData);
      alert("Issue reported successfully!");
      setTitle("");
      setCategory("");
      setDescription("");
      setPriority("medium");
      setFile(null);
    } catch (err) {
      setFormError(contextError || "Failed to submit issue.");
    }
  };

  return (
    <ArtisanLayout>
      <div className="p-6 text-[#151E3D]">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Report Issue</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Let us know about any problems you’ve encountered so we can assist you
          quickly.
        </p>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit a Report</h2>
          <form onSubmit={handleSubmitIssue} className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-[#151E3D]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize the issue..."
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#151E3D]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
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
            <div>
              <label className="text-sm font-medium text-[#151E3D]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#151E3D]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151E3D] h-28 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#151E3D]">
                Upload Evidence (JPEG/PNG)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#F8FAFC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151E3D]"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {(formError || contextError) && <p className="text-red-500 text-sm">{formError || contextError}</p>}

            <button
              type="submit"
              className="w-full py-2 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Reported Issues</h2>
          {loading && <p className="text-gray-600">Loading issues...</p>}
          {contextError && !loading && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{contextError}</div>
          )}
          {!loading && !contextError && issues?.length === 0 ? (
            <p className="text-gray-500">No issues reported yet.</p>
          ) : (
            <div className="space-y-4">
              {issues?.map((issue) => (
                <div key={issue._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <p className="text-sm font-medium text-gray-900">
                    Category: {issue.category}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Description: {issue.description}
                  </p>
                  {issue.imageUrl && (
                    <img
                      src={`http://localhost:5000${issue.imageUrl}`}
                      alt="Evidence"
                      className="mt-2 max-w-xs h-auto rounded-md"
                    />
                  )}
                  <p className={`text-xs mt-1 font-semibold ${
                      issue.status === 'Resolved' ? 'text-green-600' :
                      issue.status === 'Under Review' ? 'text-yellow-600' :
                      'text-red-600'
                  }`}>
                    Status: {issue.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  {issue.resolvedBy && issue.resolutionDetails && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">Resolution:</p>
                      <p>{issue.resolutionDetails}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanReport;
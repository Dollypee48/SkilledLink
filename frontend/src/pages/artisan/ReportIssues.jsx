import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ArtisanLayout from "../../components/common/layouts/ArtisanLayout";

const ArtisanReport = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a JPEG or PNG image.");
      setFile(null);
    }
  };

  // Handle issue submission (mock function, replace with API call)
  const handleSubmitIssue = (e) => {
    e.preventDefault();
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }
    if (!file) {
      setError("Please upload a file as evidence.");
      return;
    }

    setError("");
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("file", file);

    alert(`Issue reported: ${category} - ${description}`); // Replace with API call

    setCategory("");
    setDescription("");
    setFile(null);
  };

  return (
    <ArtisanLayout>
      <div className="p-6 text-[#6b2d11]">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Report Issue</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Let us know about any problems you’ve encountered so we can assist you
          quickly.
        </p>

        {/* Report Issue Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit a Report</h2>
          <form onSubmit={handleSubmitIssue} className="space-y-4 text-left">
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
              >
                <option value="">Select a category</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Scheduling Conflict">Scheduling Conflict</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11] h-28 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-[#6b2d11]">
                Upload Evidence (JPEG/PNG)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow-md transition"
            >
              Submit Report
            </button>
          </form>
        </div>

        {/* Reported Issues Section (mock for now) */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Reported Issues</h2>
          <p className="text-gray-600">
            No issues reported yet. Your reports will appear here once
            submitted.
          </p>
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanReport;

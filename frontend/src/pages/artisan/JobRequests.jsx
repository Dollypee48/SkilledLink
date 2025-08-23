import React, { useState, useEffect } from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import { CalendarCheck, CheckCircle, XCircle } from "lucide-react";

const ArtisanRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  // Example mock data (replace with API fetch)
  useEffect(() => {
    setRequests([
      { id: 1, customerName: "John Doe", service: "Woodwork", date: "2025-08-15", status: "Pending" },
      { id: 2, customerName: "Jane Smith", service: "Pottery", date: "2025-08-14", status: "Accepted" },
      { id: 3, customerName: "Chris Brown", service: "Painting", date: "2025-08-13", status: "Declined" },
    ]);
  }, []);

  const acceptedRequests = requests.filter((r) => r.status === "Accepted").length;
  const declinedRequests = requests.filter((r) => r.status === "Declined").length;

  const filteredRequests =
    filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);

  // Accept request
  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Accepted" } : r))
    );
  };

  // Decline request
  const handleDecline = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Declined" } : r))
    );
  };

  return (
    <ArtisanLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Requests Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-xl font-semibold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Accepted Requests</p>
                <p className="text-xl font-semibold text-gray-900">{acceptedRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Declined Requests</p>
                <p className="text-xl font-semibold text-gray-900">{declinedRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Request List</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests available.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700">
                  <th className="p-3 font-medium">Request ID</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Service</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-gray-600">{request.id}</td>
                    <td className="p-3 text-gray-600">
                      {request.customerName || `Customer ${request.id}`}
                    </td>
                    <td className="p-3 text-gray-600">{request.service}</td>
                    <td className="p-3 text-gray-600">{request.date}</td>
                    <td className="p-3">
                      {request.status === "Accepted" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Accepted
                        </span>
                      )}
                      {request.status === "Pending" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      )}
                      {request.status === "Declined" && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors duration-200"
                        onClick={() => handleAccept(request.id)}
                        disabled={request.status !== "Pending"}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors duration-200"
                        onClick={() => handleDecline(request.id)}
                        disabled={request.status !== "Pending"}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanRequests;

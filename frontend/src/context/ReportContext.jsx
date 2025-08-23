import React, { createContext, useContext, useState } from "react";
import { ReportService } from "../services/reportService";
import useAuth from "../hooks/useAuth";

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { accessToken } = useAuth(); // Get token from auth
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to handle requests with loading/error
  const handleRequest = async (callback) => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error("Please log in to perform this action");
      return await callback(accessToken);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new report
  const submitReport = async (reportData) => {
    const newReport = await handleRequest((token) =>
      ReportService.createReport(reportData, token)
    );
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  // Fetch all reports
  const fetchReports = async () => {
    const data = await handleRequest((token) => ReportService.getReports(token));
    setReports(data);
    return data;
  };

  // Delete a report
  const removeReport = async (id) => {
    await handleRequest((token) => ReportService.deleteReport(id, token));
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        loading,
        error,
        submitReport,
        fetchReports,
        removeReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// Custom hook for easier usage
export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error("useReport must be used within a ReportProvider");
  return context;
};

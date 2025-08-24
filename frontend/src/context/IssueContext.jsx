import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { issueService } from "../services/issueService";
import useAuth from "../hooks/useAuth";

export const IssueContext = createContext();

export const IssueProvider = ({ children }) => {
  const { accessToken, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(
    async (callback) => {
      setLoading(true);
      setError(null);
      try {
        if (!accessToken) {
          throw new Error("Authentication token is required");
        }
        const result = await callback(accessToken);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const submitIssue = useCallback(
    async (issueData) => {
      const newIssue = await handleRequest((token) =>
        issueService.submitIssue(issueData, token)
      );
      setIssues((prev = []) => [...prev, newIssue.data]);
      return newIssue.issue;
    },
    [handleRequest]
  );

  const fetchMyIssues = useCallback(
    async () => {
      const data = await handleRequest((token) => issueService.getMyIssues(token));
      setIssues(Array.isArray(data.data) ? data.data : []);
      return data;
    },
    [handleRequest]
  );

  useEffect(() => {
    if (user && accessToken && fetchMyIssues) {
      fetchMyIssues();
    }
  }, [user, accessToken, fetchMyIssues]);


  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        error,
        submitIssue,
        fetchMyIssues,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
};

export const useIssue = () => {
  const context = useContext(IssueContext);
  if (!context) throw new Error("useIssue must be used within an IssueProvider");
  return context;
};
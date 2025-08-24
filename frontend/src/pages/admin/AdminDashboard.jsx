// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout'; // Assuming AdminLayout exists
import { Users, Briefcase, Star, FileText, CalendarCheck, CircleAlert } from 'lucide-react'; // Import icons
import { adminService } from '../../services/adminService'; // Import admin service
import { useAuth } from '../../context/AuthContext'; // Corrected import path

const AdminDashboard = () => {
  const { accessToken } = useAuth(); // Get access token from auth context
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats(accessToken);
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <p>Loading dashboard statistics...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { name: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-blue-100 text-blue-700" },
    { name: "Total Artisans", value: stats?.totalArtisans, icon: Users, color: "bg-green-100 text-green-700" },
    { name: "Total Customers", value: stats?.totalCustomers, icon: Users, color: "bg-purple-100 text-purple-700" },
    { name: "Total Bookings", value: stats?.totalBookings, icon: Briefcase, color: "bg-yellow-100 text-yellow-700" },
    { name: "Pending Bookings", value: stats?.pendingBookings, icon: CalendarCheck, color: "bg-orange-100 text-orange-700" },
    { name: "Completed Bookings", value: stats?.completedBookings, icon: CalendarCheck, color: "bg-green-100 text-green-700" },
    { name: "Total Reviews", value: stats?.totalReviews, icon: Star, color: "bg-pink-100 text-pink-700" },
    { name: "Total Issues", value: stats?.totalIssues, icon: FileText, color: "bg-red-100 text-red-700" },
    { name: "Pending Issues", value: stats?.pendingIssues, icon: CircleAlert, color: "bg-orange-100 text-orange-700" },
    { name: "Total Reports", value: stats?.totalReports, icon: FileText, color: "bg-red-200 text-red-800" }, // New
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className={`${card.color} rounded-lg p-5 flex items-center shadow-md`}>
              <div className="mr-4">
                {React.createElement(card.icon, { className: "w-8 h-8" })}
              </div>
              <div>
                <p className="text-sm font-medium">{card.name}</p>
                <p className="text-2xl font-bold">{card.value !== undefined ? card.value : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

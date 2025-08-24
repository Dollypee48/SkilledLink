// frontend/src/pages/admin/AdminDashboard.jsx
import React from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout'; // Assuming AdminLayout exists

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">Welcome to the Admin Dashboard.</p>
          <p className="mt-4">Here you can manage various aspects of the application.</p>
          {/* Add admin-specific content and features here */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

// frontend/src/pages/admin/ManageArtisans.jsx
import React from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout'; // Assuming AdminLayout exists

const ManageArtisans = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Artisans</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">This is a placeholder for the Admin page to manage artisans.</p>
          <p className="mt-4">Here, admins can view, approve, reject, or update artisan profiles.</p>
          {/* Add actual artisan management UI and logic here */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageArtisans;

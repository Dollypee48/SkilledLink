// frontend/src/pages/admin/ManageBookings.jsx
import React from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';

const ManageBookings = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Bookings</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">This is a placeholder for the Admin page to manage bookings.</p>
          <p className="mt-4">Here, admins can view, approve, reject, or cancel bookings.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageBookings;
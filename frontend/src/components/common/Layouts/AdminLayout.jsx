// frontend/src/components/common/Layouts/AdminLayout.jsx
import React from 'react';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      {/* You can add common admin layout elements here, e.g., sidebar, header */}
      <header className="admin-header bg-gray-800 text-white p-4">
        <h2>Admin Dashboard</h2>
      </header>
      <div className="admin-content p-4">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

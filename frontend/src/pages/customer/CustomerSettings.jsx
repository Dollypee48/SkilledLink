import React from "react";
import CustomerLayout from "../../components/common/Layouts/CustomerLayout";
import UserProfileEditForm from '../../components/UserProfileEditForm'; // Import UserProfileEditForm

const CustomerSettings = () => {
  return (
    <CustomerLayout>
      <div className="p-6 text-[#151E3D]">
        <h1 className="text-3xl font-bold mb-2">Customer Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your account settings and preferences here.
        </p>

        <div className="mb-8">
          <UserProfileEditForm />
        </div>
        {/* Other customer-specific settings can go here */}
      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;

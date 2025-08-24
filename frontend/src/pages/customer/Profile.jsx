import React from "react";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import UserProfileEditForm from '../../components/UserProfileEditForm'; // Import the new form
import KYCForm from '../../components/KYCForm'; // Import the KYC form

const CustomerProfile = () => {
  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your personal information, account preferences, and KYC documents.
        </p>

        {/* User Profile Editing Form */}
        <div className="mb-8">
          <UserProfileEditForm />
        </div>

        {/* KYC Document Upload Form */}
        <div className="mb-8">
          <KYCForm />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;

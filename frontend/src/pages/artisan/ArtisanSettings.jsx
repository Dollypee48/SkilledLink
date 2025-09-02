import React from "react";
import ArtisanLayout from "../../components/common/Layouts/ArtisanLayout";
import UserProfileEditForm from '../../components/UserProfileEditForm'; // Import UserProfileEditForm

const ArtisanSettings = () => {
  return (
    <ArtisanLayout>
      <div className="p-6 text-[#151E3D]">
        <h1 className="text-3xl font-bold mb-2">Artisan Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your account settings and preferences here.
        </p>

        <div className="mb-8">
          <UserProfileEditForm />
        </div>
        {/* Other artisan-specific settings can go here */}
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanSettings;

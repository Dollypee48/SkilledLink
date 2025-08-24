// frontend/src/pages/artisan/Subscription.jsx
import React from 'react';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout'; // Assuming ArtisanLayout exists

const Subscription = () => {
  return (
    <ArtisanLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Subscription</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">This is a placeholder for the Artisan Subscription management page.</p>
          <p className="mt-4">Here, artisans can view their current subscription, upgrade, or downgrade.</p>
          {/* Add actual subscription management UI and logic here */}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default Subscription;

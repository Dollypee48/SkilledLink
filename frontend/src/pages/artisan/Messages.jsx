// frontend/src/pages/artisan/Messages.jsx
import React from 'react';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout'; // Assuming ArtisanLayout exists

const ArtisanMessages = () => {
  return (
    <ArtisanLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Artisan Messages</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">This is a placeholder for the Artisan Messages page.</p>
          <p className="mt-4">Here, artisans can view and respond to messages from customers.</p>
          {/* Add actual messaging UI and logic here */}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanMessages;

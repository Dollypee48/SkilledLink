// frontend/src/pages/customer/ArtisanDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout'; // Assuming a customer layout or a general layout

const ArtisanDetail = () => {
  const { id } = useParams();

  // In a real application, you would fetch artisan details using the 'id'
  // For now, this is a placeholder.
  const artisan = {
    _id: id,
    name: "Artisan Name Placeholder",
    service: "Service Placeholder",
    rating: 4.5,
    bio: "This is a placeholder for the artisan's biography.",
    // Add more artisan details as needed
  };

  return (
    <ArtisanLayout> {/* You might have a different layout for customer pages */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Artisan Details: {artisan.name}</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p><strong>Service:</strong> {artisan.service}</p>
          <p><strong>Rating:</strong> {artisan.rating}</p>
          <p><strong>Bio:</strong> {artisan.bio}</p>
          <p className="mt-4">More details for artisan with ID: {id}</p>
          {/* Add more details and UI for viewing artisan profile, services, reviews, etc. */}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default ArtisanDetail;

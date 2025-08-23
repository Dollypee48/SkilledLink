// src/pages/customer/FindArtisans.jsx
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import { ArtisanContext } from "../../context/ArtisanContext";
import { useContext } from "react";

const FindArtisans = () => {
  const { artisans, searchArtisans } = useContext(ArtisanContext); // ✅ use context directly
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");

  // Services list
  const services = ["Plumbing", "Electrical", "Painting", "Cleaning", "Carpentry"];

  // Fetch artisans on filter change
  useEffect(() => {
    searchArtisans({ search: searchTerm, location, service });
  }, [searchTerm, location, service]);

  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <h1 className="text-3xl font-bold mb-6">Find Artisans</h1>
        <p className="text-gray-600 mb-6">Discover skilled professionals near you for any service.</p>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#6b2d11] pl-10"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
            >
              <option value="">Select Location</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Kano">Kano</option>
              <option value="Port Harcourt">Port Harcourt</option>
            </select>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#FDF1F2] shadow-md focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
            >
              <option value="">Select Service</option>
              {services.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Artisans List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Artisans</h2>

          {artisans.length === 0 ? (
            <p className="text-gray-600">No artisans found matching your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <div key={artisan._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-medium text-[#6b2d11]">{artisan.name}</h3>
                  <p className="text-sm text-gray-600">Service: {artisan.service}</p>
                  <p className="text-sm text-gray-600">Location: {artisan.location}</p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(artisan.rating || 0) ? "text-yellow-500" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    <span className="text-sm text-gray-600 ml-1">{artisan.rating || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Availability:{" "}
                    <span className={artisan.availability ? "text-green-600" : "text-red-500"}>
                      {artisan.availability ? "Available" : "Not Available"}
                    </span>
                  </p>
                  <button
                    className="mt-4 w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow-md transition"
                    onClick={() => alert(`Booking ${artisan.name} for ${artisan.service}`)} // Replace with real booking
                    disabled={!artisan.availability}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default FindArtisans;

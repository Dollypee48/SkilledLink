import React from 'react';
import Footer from '../components/common/Footer';

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#151E3D] mb-4 sm:mb-6">Our Services</h1>
        <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
          At SkilledLink, we connect you with reliable and skilled artisans for a wide range of services. Whether you need help with home repairs, personal care, or specialized crafts, we've got you covered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">Home Maintenance</h2>
            <p className="text-sm sm:text-base text-gray-600">From plumbing and electrical work to carpentry and painting, find experienced professionals to keep your home in top shape.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">Personal & Lifestyle</h2>
            <p className="text-sm sm:text-base text-gray-600">Discover artisans for beauty services, fitness training, personalized coaching, and other lifestyle enhancements.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">Creative & Custom</h2>
            <p className="text-sm sm:text-base text-gray-600">Connect with artists, designers, and craftspeople for custom projects, unique creations, and artistic services.</p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#151E3D] mb-3 sm:mb-4">Ready to find a skilled artisan?</h2>
          <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">Browse our categories or search directly for your needs.</p>
          <a href="/" className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 shadow-lg hover:shadow-xl">
            Find an Artisan
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;

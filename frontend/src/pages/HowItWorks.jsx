import React from 'react';
import Footer from '../components/common/Footer';
import { Search, Handshake, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#151E3D] mb-4 sm:mb-6">How SkilledLink Works</h1>
        <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
          Connecting with skilled professionals has never been easier. Follow these simple steps to get your tasks done efficiently and reliably.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-[#151E3D] mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">1. Find Your Artisan</h2>
            <p className="text-sm sm:text-base text-gray-600">Browse through our extensive categories or use the search bar to find the perfect artisan for your specific needs.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center">
            <Handshake className="w-12 h-12 sm:w-16 sm:h-16 text-[#151E3D] mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">2. Connect & Book</h2>
            <p className="text-sm sm:text-base text-gray-600">View artisan profiles, read reviews, and easily connect to discuss your project. Book their services directly through our platform.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-[#151E3D] mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-[#151E3D] mb-2 sm:mb-3">3. Get it Done!</h2>
            <p className="text-sm sm:text-base text-gray-600">Relax as your chosen artisan delivers quality work. Enjoy peace of mind with secure payments and reliable service.</p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#151E3D] mb-3 sm:mb-4">Join Our Community</h2>
          <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">Become an artisan and offer your skills, or find the perfect professional for your next project.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="/register" className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 shadow-lg hover:shadow-xl">
              Become an Artisan
            </a>
            <a href="/" className="inline-block border-2 border-[#151E3D] text-[#151E3D] px-6 sm:px-8 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium hover:bg-[#151E3D] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2">
              Find a Service
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;

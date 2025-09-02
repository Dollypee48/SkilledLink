import React from 'react';
import Footer from '../components/common/Footer';
import { Search, Handshake, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#151E3D] mb-6">How SkilledLink Works</h1>
        <p className="text-lg text-gray-700 mb-8">
          Connecting with skilled professionals has never been easier. Follow these simple steps to get your tasks done efficiently and reliably.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <Search className="w-16 h-16 text-[#151E3D] mb-4" />
            <h2 className="text-2xl font-semibold text-[#151E3D] mb-3">1. Find Your Artisan</h2>
            <p className="text-gray-600">Browse through our extensive categories or use the search bar to find the perfect artisan for your specific needs.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <Handshake className="w-16 h-16 text-[#151E3D] mb-4" />
            <h2 className="text-2xl font-semibold text-[#151E3D] mb-3">2. Connect & Book</h2>
            <p className="text-gray-600">View artisan profiles, read reviews, and easily connect to discuss your project. Book their services directly through our platform.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 text-[#151E3D] mb-4" />
            <h2 className="text-2xl font-semibold text-[#151E3D] mb-3">3. Get it Done!</h2>
            <p className="text-gray-600">Relax as your chosen artisan delivers quality work. Enjoy peace of mind with secure payments and reliable service.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-[#151E3D] mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-700 mb-6">Become an artisan and offer your skills, or find the perfect professional for your next project.</p>
          <div className="flex justify-center gap-4">
            <a href="/register" className="inline-block bg-[#F59E0B] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#D97706] transition duration-300">
              Become an Artisan
            </a>
            <a href="/" className="inline-block border border-[#F59E0B] text-[#151E3D] px-8 py-3 rounded-md text-lg font-medium hover:bg-[#F59E0B] hover:text-white transition duration-300">
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

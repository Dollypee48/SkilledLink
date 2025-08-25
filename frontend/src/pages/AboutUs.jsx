import React from 'react';
import Footer from '../components/common/Footer';
import { Users, Lightbulb, Handshake } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#6b2d11] mb-6">About SkilledLink</h1>
        <p className="text-lg text-gray-700 mb-8">
          SkilledLink is dedicated to revolutionizing the way people find and hire skilled professionals. Our platform bridges the gap between talented artisans and those in need of their expertise, ensuring quality service and fair opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <Users className="w-16 h-16 text-[#a0522d] mb-4" />
            <h2 className="text-2xl font-semibold text-[#a0522d] mb-3">Our Mission</h2>
            <p className="text-gray-600">To empower skilled individuals and provide seamless access to reliable services for everyone.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <Lightbulb className="w-16 h-16 text-[#a0522d] mb-4" />
            <h2 className="text-2xl font-semibold text-[#a0522d] mb-3">Our Vision</h2>
            <p className="text-gray-600">To create a thriving community where talent is recognized, and quality service is always within reach.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <Handshake className="w-16 h-16 text-[#a0522d] mb-4" />
            <h2 className="text-2xl font-semibold text-[#a0522d] mb-3">Our Values</h2>
            <p className="text-gray-600">Integrity, Quality, Community, and Innovation are at the core of everything we do.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-[#6b2d11] mb-4">Ready to Experience SkilledLink?</h2>
          <p className="text-lg text-gray-700 mb-6">Join our platform today and connect with the best in the business.</p>
          <a href="/register" className="inline-block bg-[#f5d4aa] text-[#6b2d11] px-8 py-3 rounded-md text-lg font-medium hover:bg-[#e0b48a] transition duration-300">
            Get Started
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;

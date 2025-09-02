import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";   // ✅ adjust path based on your folder
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (service) queryParams.append('service', service);
    if (location) queryParams.append('location', location);
    navigate(`/find-artisans?${queryParams.toString()}`);
  };

  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-[500px] relative"
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2019/11/12/23/00/artist-4622221_1280.jpg')",
        }}
      >
        <div className="bg-black/40 absolute inset-0"></div>
        <div className="relative z-10 text-white text-center px-4 py-20 sm:py-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Find Trusted Local <span className="text-[#F59E0B]">Artisans</span> Near You
          </h1>
          <p className="text-base sm:text-lg mb-6">
            Connect with skilled professionals for your home and personal needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <select
              className="px-4 py-3 rounded-md text-black w-full sm:w-[200px]"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">Select a service</option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Cleaning</option>
              <option>Carpentry</option>
              <option>Painting</option>
              <option>Tailoring</option>
              <option>Mechanic</option>
            </select>
            <input
              type="text"
              placeholder="Your Location"
              className="px-4 py-3 rounded-md text-black w-full sm:w-[200px]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              className="bg-[#151E3D] hover:bg-[#1E2A4A] px-6 py-3 rounded-md text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 w-full sm:w-auto"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          <div className="mt-8 sm:mt-10">
            <Link
              to="/register"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-2 rounded-full font-medium shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 bg-[#F8FAFC] text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
          <div>
            <span className="text-4xl text-green-500">🛡️</span>
            <h3 className="text-xl font-semibold mt-2">Verified Artisans</h3>
            <p className="text-gray-600">
              All professionals on our platform are thoroughly vetted and verified for quality and reliability.
            </p>
          </div>
          <div>
            <span className="text-4xl text-blue-500">🔒</span>
            <h3 className="text-xl font-semibold mt-2">Secure Payments</h3>
            <p className="text-gray-600">
              Our secure payment system ensures your transactions are protected and hassle-free.
            </p>
          </div>
          <div>
            <span className="text-4xl text-yellow-500">⭐</span>
            <h3 className="text-xl font-semibold mt-2">Ratings & Reviews</h3>
            <p className="text-gray-600">
              Make informed decisions based on authentic ratings and reviews from other customers.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Popular Services</h2>
        <p className="text-gray-600 mb-6">Find the right professional for any job</p>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 px-4">
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-blue-500">🚰</span>
            <h4 className="text-lg font-semibold mt-2">Plumbing</h4>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-yellow-500">💡</span>
            <h4 className="text-lg font-semibold mt-2">Electrical</h4>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-green-500">🧹</span>
            <h4 className="text-lg font-semibold mt-2">Cleaning</h4>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-pink-500">✂️</span>
            <h4 className="text-lg font-semibold mt-2">Tailoring</h4>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-red-500">🎨</span>
            <h4 className="text-lg font-semibold mt-2">Painting</h4>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="text-4xl text-gray-500">🔧</span>
            <h4 className="text-lg font-semibold mt-2">Mechanic</h4>
          </div>
        </div>
      </section>

      {/* How SkilledLink Works */}
      <section className="py-12 bg-[#F8FAFC] text-center">
        <h2 className="text-2xl font-bold mb-6">How SkilledLink Works</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
          <div>
            <span className="text-4xl text-yellow-500">1️⃣</span>
            <h3 className="text-xl font-semibold mt-2">Search for a Service</h3>
            <p className="text-gray-600">
              Browse through our wide range of services or search for specific skills you need.
            </p>
          </div>
          <div>
            <span className="text-4xl text-yellow-500">2️⃣</span>
            <h3 className="text-xl font-semibold mt-2">Book an Artisan</h3>
            <p className="text-gray-600">
              Choose from available professionals based on ratings, reviews, and availability.
            </p>
          </div>
          <div>
            <span className="text-4xl text-yellow-500">3️⃣</span>
            <h3 className="text-xl font-semibold mt-2">Get the Job Done</h3>
            <p className="text-gray-600">
              Receive quality service, pay securely, and leave a review to help others.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-yellow-500">★★★★★ 5.0</p>
            <p className="text-gray-600">
              "SkilledLink made it so easy to find a reliable plumber for my emergency. The service was outstanding and highly recommended!"
            </p>
            <p className="text-green-500 mt-2">- Sololake Bose, Lagos</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-yellow-500">★★★★★ 5.0</p>
            <p className="text-gray-600">
              "I needed an electrician to fix some wiring issues. The artisan I found through SkilledLink was knowledgeable and quick!"
            </p>
            <p className="text-green-500 mt-2">- Muyiwa Tomori, Ibadan</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-yellow-500">★★★★ 4.0</p>
            <p className="text-gray-600">
              "The cleaning service I booked through SkilledLink was fantastic. My home has never looked better, will definitely use again!"
            </p>
            <p className="text-green-500 mt-2">- Adam Ridwan, Abuja</p>
          </div>
        </div>
      </section>

      {/* Artisan Call-to-Action */}
      <section className="bg-[#151E3D] text-white py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Are you a Skilled Worker?</h2>
        <p className="mb-6">
          Join SkilledLink and grow your business by connecting with customers looking for <strong>expertise</strong>.
        </p>
        <Link
          to="/register"
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2"
        >
          Join as an Artisan
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

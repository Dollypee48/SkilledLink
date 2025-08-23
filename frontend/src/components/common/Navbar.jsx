import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#5B2104] text-white py-4 shadow">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        <div className="text-2xl font-semibold">
          Skilled<span className="text-[#FEE4C3]">Link</span>
        </div>

        
        <nav className="space-x-10 hidden md:flex">
          <Link to="/" className="hover:text-[#FEE4C3] transition">Home</Link>
          <Link to="/services" className="hover:text-[#FEE4C3] transition">Services</Link>
          <Link to="/how-it-works" className="hover:text-[#FEE4C3] transition">How It works</Link>
          <Link to="/about" className="hover:text-[#FEE4C3] transition">About Us</Link>
        </nav>

        
        <div className="space-x-3">
          <Link to="/login" className="bg-[#FEE4C3] text-[#5B2104] px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Login
          </Link>
          <Link to="/register" className="bg-[#FEE4C3] text-[#5B2104] px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

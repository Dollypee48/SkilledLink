import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
// import { useArtisan } from '../../context/ArtisanContext';
import { User, Power, LogOut, Menu, X } from 'lucide-react';
import PremiumBadge from '../PremiumBadge';
import Logo from './Logo';

const Header = () => {
  const { user, isAuthenticated, handleLogout } = useAuth(); // Get user from AuthContext
  // const { isOnline } = useArtisan(); // Get isOnline status from ArtisanContext
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // const hiddenPaths = ['/services', '/about', '/how-it-works'];

  // if (hiddenPaths.includes(location.pathname)) {
  //   return null; // Don't render Navbar on these pages
  // }

  const getDashboardPath = () => {
    if (user?.role === 'customer') {
      return '/customer-dashboard';
    } else if (user?.role === 'artisan') {
      return '/artisan-dashboard';
    } else if (user?.role === 'admin') {
      return '/admin-dashboard'; 
    }
    return '/'; 
  };

  const onLogout = () => {
    handleLogout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  return (
    <header className="sticky top-0 z-50 bg-[#151E3D] text-white py-4 shadow">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Desktop Header */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo variant="full" size="md" textColor="white" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="space-x-10 hidden lg:flex">
            <Link to="/" className="hover:text-[#F59E0B] transition">Home</Link>
            <Link to="/services" className="hover:text-[#F59E0B] transition">Services</Link>
            <Link to="/how-it-works" className="hover:text-[#F59E0B] transition">How It works</Link>
            <Link to="/about" className="hover:text-[#F59E0B] transition">About Us</Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {!isAuthenticated ? (
              <Link to="/login" className="text-white hover:text-[#F59E0B] transition-colors duration-300">
                Sign in/Register
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Hi, {user.name}</span>
                  {user.isPremium && (
                    <PremiumBadge size="sm" variant="default" showText={false} />
                  )}
                </div>
                <Link to={getDashboardPath()} className="bg-[#F59E0B] text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">
                  Dashboard
                </Link>
                <button onClick={onLogout} className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md hover:bg-[#1E2A4A] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-[#1E2A4A] pt-4">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-4 mb-6">
              <Link 
                to="/" 
                className="text-white hover:text-[#F59E0B] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="text-white hover:text-[#F59E0B] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-white hover:text-[#F59E0B] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It works
              </Link>
              <Link 
                to="/about" 
                className="text-white hover:text-[#F59E0B] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-[#1E2A4A] pt-4">
              {!isAuthenticated ? (
                <Link 
                  to="/login" 
                  className="block text-white hover:text-[#F59E0B] transition-colors duration-300 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in/Register
                </Link>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Hi, {user.name}</span>
                    {user.isPremium && (
                      <PremiumBadge size="sm" variant="default" showText={false} />
                    )}
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Link 
                      to={getDashboardPath()} 
                      className="bg-[#F59E0B] text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={onLogout} 
                      className="flex items-center justify-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
// import { useArtisan } from '../../context/ArtisanContext';
import { User, Power, LogOut } from 'lucide-react';
import PremiumBadge from '../PremiumBadge';

const Header = () => {
  const { user, isAuthenticated, handleLogout } = useAuth(); // Get user from AuthContext
  // const { isOnline } = useArtisan(); // Get isOnline status from ArtisanContext
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

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
  };


  return (
    <header className="sticky top-0 z-50 bg-[#151E3D] text-white py-4 shadow">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        <div className="text-2xl font-semibold">
          <Link to="/" className="hover:text-[#F59E0B] transition">
            Skilled<span className="text-[#F59E0B]">Link</span>
          </Link>
        </div>

        
        <nav className="space-x-10 hidden md:flex">
          <Link to="/" className="hover:text-[#F59E0B] transition">Home</Link>
          <Link to="/services" className="hover:text-[#F59E0B] transition">Services</Link>
          <Link to="/how-it-works" className="hover:text-[#F59E0B] transition">How It works</Link>
          <Link to="/about" className="hover:text-[#F59E0B] transition">About Us</Link>
        </nav>

        
        <div className="space-x-3 flex items-center">
          {!isAuthenticated ? (
            <Link to="/login" className="text-white hover:text-[#F59E0B] transition-colors duration-300">
              Sign in/Get Started
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              {/* {user?.role === 'artisan' && (
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {isOnline ? "Online" : "Offline"}
                </div>
              )} */}
              <div className="flex items-center gap-2 hidden sm:flex">
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
      </div>
    </header>
  );
};

export default Header;

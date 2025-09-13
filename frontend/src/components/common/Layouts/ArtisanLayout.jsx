import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Corrected import path
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Briefcase,
  Star,
  User,
  LogOut,
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown
import ProfileDropdown from "../ProfileDropdown"; // Import ProfileDropdown
import PremiumBadge from "../PremiumBadge"; // Import PremiumBadge
import Logo from "../Logo";

const ArtisanLayout = ({ children }) => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Artisan navigation items
  const navItems = [
    { name: "Dashboard", path: "/artisan-dashboard", icon: LayoutDashboard },
    { name: "My Jobs", path: "/myJobs", icon: Briefcase },
    { name: "Job Requests", path: "/jobRequest", icon: CalendarCheck },
    { name: "Messages", path: "/artisan-messages", icon: MessageSquare }, // New: Point to the artisan-specific messages page
    { name: "My Reviews", path: "/myReview", icon: Star },
    { name: "Profile", path: "/artisan-profile", icon: User },
    { name: "Settings", path: "/artisan-settings", icon: User }, // Using User icon for now, can be changed later
    { name: "Subscription", path: "/subscription", icon: User },
  ];


  const onLogout = () => {  // ✅ optional renaming for clarity
    handleLogout();         // ✅ call the correct function
    navigate("/");
  };

  const isDashboard = location.pathname === "/artisan-dashboard";
  const isHomepage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Navigation */}
      <div className="sticky top-0 z-50">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-lg border-b-4 border-[#151E3D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo Section */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  <Logo variant="icon" size="md" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[#151E3D]">SkilledLink</h1>
                  <p className="text-sm text-gray-600 -mt-1">Artisan Dashboard</p>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-6">
                <NotificationDropdown />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </nav>

        {/* Horizontal Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "border-[#151E3D] text-[#151E3D] font-semibold"
                        : "border-transparent text-gray-600 hover:text-[#151E3D] hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#151E3D]' : 'text-gray-500 group-hover:text-[#151E3D]'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-[#151E3D] rounded-full ml-1"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ArtisanLayout;

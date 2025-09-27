import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Corrected import path
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  CalendarCheck,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown
import ProfileDropdown from "../ProfileDropdown"; // Import ProfileDropdown
import Logo from "../Logo";

const CustomerLayout = ({ children }) => {
  const { user, handleLogout } = useAuth(); // ✅ Corrected here
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Debug logging removed for production

  const navItems = [
    { name: "Dashboard", path: "/customer-dashboard", icon: LayoutDashboard },
    { name: "Messages", path: "/messages", icon: MessageSquare }, // New: Point to the new unified messages page
    { name: "Find Artisans", path: "/artisans", icon: Search },
    { name: "My Bookings", path: "/customer-bookings", icon: CalendarCheck },
    { name: "Profile", path: "/customer-profile", icon: User },
    { name: "Settings", path: "/customer-settings", icon: User }, // Using User icon for now, can be changed later
  ];

  const onLogout = () => {  // ✅ optional renaming for clarity
    handleLogout();         // ✅ call the correct function
    navigate("/");
  };

  const isDashboard = location.pathname === "/customer-dashboard";
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
                  <p className="text-sm text-gray-600 -mt-1">Customer Dashboard</p>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <ProfileDropdown />
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-[#151E3D] hover:bg-gray-100 transition-colors duration-200"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-[#151E3D] text-white"
                          : "text-gray-600 hover:text-[#151E3D] hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#151E3D]'}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </main>

    </div>
  );
};

export default CustomerLayout;

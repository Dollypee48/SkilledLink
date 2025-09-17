import React from "react";
import { useAuth } from "../../../context/AuthContext"; // Corrected import path
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  CalendarCheck,
  AlertTriangle,
  Star, // Added for Manage Reviews
  LogOut,
  FileCheck, // New: Added for KYC Verification
  Home,
  User,
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown
import ProfileDropdown from "../ProfileDropdown"; // Import ProfileDropdown
import Logo from "../Logo";

const AdminLayout = ({ children }) => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Manage Users", path: "/manage-users", icon: Users },
    { name: "Manage Artisans", path: "/manage-artisans", icon: Users }, // Added
    { name: "Manage Bookings", path: "/manage-bookings", icon: CalendarCheck }, // Updated path
    { name: "Manage Reviews", path: "/manage-reviews", icon: Star }, // Added
    { name: "Manage Reports", path: "/manage-reports", icon: AlertTriangle }, // Updated path
    { name: "KYC Verification", path: "/admin/kyc-verification", icon: FileCheck }, // New
    // { name: "Settings", path: "/admin-settings", icon: Settings }, // Commented out, no route/component yet
    // { name: "Messages", path: "/admin-messages", icon: MessageSquare }, // Commented out, no route/component yet
  ];

  const onLogout = () => {
    handleLogout();
    navigate("/");
  };

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
                  <p className="text-sm text-gray-600 -mt-1">Admin Dashboard</p>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-6">
                {/* Home Button */}
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#151E3D] hover:bg-[#1E2A4A] text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  title="Go to Homepage"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Home</span>
                </button>
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

export default AdminLayout;
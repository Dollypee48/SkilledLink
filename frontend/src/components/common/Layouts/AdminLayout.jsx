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
  Home, // New: Added for home icon
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown

const AdminLayout = ({ children }) => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/", icon: Home }, // New: Home button
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151E3D] text-white flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold p-6 text-white">SkilledLink Admin</h1>
          <nav className="flex flex-col space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 p-1 rounded-md transition-colors ${
                    isActive
                      ? "bg-[#F59E0B] text-white font-semibold"
                      : "hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-4 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div>
            <h2 className="text-lg font-semibold text-[#151E3D]">
              Hi, {user?.name || "Admin"} 👋
            </h2>
            <p className="text-sm text-gray-500">Welcome to the admin panel</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationDropdown />
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
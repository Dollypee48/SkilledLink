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
  AlertTriangle,
  LogOut,
  Bell,
  FileText,
  Power,
  Home, // New: Added for home icon
} from "lucide-react";

const ArtisanLayout = ({ children }) => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Artisan navigation items
  const navItems = [
    { name: "Home", path: "/", icon: Home }, // New: Home button
    { name: "Dashboard", path: "/artisan-dashboard", icon: LayoutDashboard },
    { name: "My Jobs", path: "/myJobs", icon: Briefcase },
    { name: "Job Requests", path: "/jobRequest", icon: CalendarCheck },
    { name: "Messages", path: "/artisan/messages", icon: MessageSquare },
    { name: "My Reviews", path: "/myReview", icon: Star },
    { name: "Profile/Settings", path: "/profile", icon: User },
    { name: "Subscription", path: "/subscription", icon: User },
    { name: "Report Issue", path: "/artisan-report", icon: AlertTriangle },
  ];

  const [isOnline, setIsOnline] = useState(true); // default status Online

  const toggleStatus = () => {
    setIsOnline((prev) => !prev);
    // Later you can sync this with backend
  };

  const onLogout = () => {  // ✅ optional renaming for clarity
    handleLogout();         // ✅ call the correct function
    navigate("/");
  };


  return (
    <div className="flex min-h-screen bg-[#f5d4aa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#6b2d11] text-[#FBE0BA] flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold p-6 text-white">SkilledLink</h1>
          <nav className="flex flex-col space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-white text-[#6b2d11] font-semibold"
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
            <h2 className="text-lg font-semibold text-[#6b2d11]">
              Hi, {user?.name || "Artisan"} 👋
            </h2>
            <p className="text-sm text-gray-500">
              Ready to manage your work today?
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="flex items-center gap-1 text-sm text-[#6b2d11] hover:underline">
              <Bell className="w-4 h-4" />
              Notifications
            </button>

            {/* Availability Status */}
            <button
              onClick={toggleStatus}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow transition-colors ${
                isOnline
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              <Power className="w-4 h-4" />
              {isOnline ? "Online" : "Offline"}
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default ArtisanLayout;

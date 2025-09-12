import React, { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // Corrected import path
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  CalendarCheck,
  User,
  LogOut,
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown
import ProfileDropdown from "../ProfileDropdown"; // Import ProfileDropdown

const CustomerLayout = ({ children }) => {
  const { user, handleLogout } = useAuth(); // ✅ Corrected here
  const location = useLocation();
  const navigate = useNavigate();
  
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
    <div className="flex min-h-screen bg-[#F8FAFC] relative"> {/* Added 'relative' */}
      {/* Sidebar */}
      <aside className="w-64 bg-[#151E3D] text-white flex flex-col sticky top-0 h-screen">
          <div>
            <h1 className="text-2xl font-bold p-6 text-white">SkilledLink</h1>
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
            
            <button
              onClick={onLogout}  // ✅ use the corrected function
              className="flex items-center gap-3 p-4 hover:text-white transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col ${isDashboard ? "ml-0" : "ml-auto"}`}>
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div>
            <h2 className="text-lg font-semibold text-[#151E3D]">
              Hi, {user?.name || "Guest"} 👋
            </h2>
            <p className="text-sm text-gray-500">Welcome to your dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </header>
        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default CustomerLayout;

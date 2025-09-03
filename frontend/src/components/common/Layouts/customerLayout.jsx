import React, { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // Corrected import path
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  CalendarCheck,
  Star,
  User,
  AlertTriangle,
  LogOut,
  Home, // New: Added for home icon
  FileText, // Added for KYC Verification
} from "lucide-react";
import NotificationDropdown from "../NotificationDropdown"; // Import NotificationDropdown

const CustomerLayout = ({ children }) => {
  const { user, handleLogout } = useAuth(); // ✅ Corrected here
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging removed for production

  const navItems = [
    { name: "Home", path: "/", icon: Home }, // New: Home button
    { name: "Dashboard", path: "/customer-dashboard", icon: LayoutDashboard },
    { name: "Messages", path: "/messages", icon: MessageSquare }, // New: Point to the new unified messages page
    { name: "Find Artisans", path: "/artisans", icon: Search },
    { name: "My Bookings", path: "/customer-bookings", icon: CalendarCheck },
    { name: "Review/Ratings", path: "/customer-reviews", icon: Star },
    { name: "KYC Verification", path: "/kyc-verification", icon: FileText }, // New: KYC Verification
    { name: "Profile", path: "/customer-profile", icon: User },
    { name: "Settings", path: "/customer-settings", icon: User }, // Using User icon for now, can be changed later
    { name: "Report issue", path: "/customer-report", icon: AlertTriangle },
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
      <aside className="w-64 bg-[#151E3D] text-white flex flex-col justify-between">
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
          </div>

          <button
            onClick={onLogout}  // ✅ use the corrected function
            className="flex items-center gap-3 p-4 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col ${isDashboard ? "ml-0" : "ml-auto"}`}>
        {/* Header */}
        {!isHomepage && (
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div>
            <h2 className="text-lg font-semibold text-[#151E3D]">
              Hi, {user?.name || "Guest"} 👋
            </h2>
            <p className="text-sm text-gray-500">Welcome to your dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationDropdown />
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        </header>
        )}
        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default CustomerLayout;

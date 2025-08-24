import React from "react";
import useAuth from "../../../hooks/useAuth";
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
  Bell,
} from "lucide-react";

const CustomerLayout = ({ children }) => {
  const { user, handleLogout } = useAuth(); // ✅ Corrected here
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/customer-dashboard", icon: LayoutDashboard },
    { name: "Messages", path: "/customer/messages", icon: MessageSquare },
    { name: "Find Artisans", path: "/artisans", icon: Search },
    { name: "My Bookings", path: "/customer-bookings", icon: CalendarCheck },
    { name: "Review/Ratings", path: "/customer-reviews", icon: Star },
    { name: "Profile/Setting", path: "/customer-profile", icon: User },
    { name: "Report issue", path: "/customer-report", icon: AlertTriangle },
  ];

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
          onClick={onLogout}  // ✅ use the corrected function
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
              Hi, {user?.name || "Guest"} 👋
            </h2>
            <p className="text-sm text-gray-500">Welcome to your dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 text-sm text-[#6b2d11] hover:underline">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
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

export default CustomerLayout;

import React, { useEffect } from 'react';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  CalendarCheck,
  Star,
  User,
  AlertTriangle,
  LogOut,
  Home,
  FileText,
} from 'lucide-react';
import NotificationDropdown from '../components/common/NotificationDropdown';

const MessagesPage = () => {
  const { user, handleLogout } = useAuth();
  const { fetchConversation } = useMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { otherUserId } = useParams();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: user?.role === 'artisan' ? "/artisan-dashboard" : "/customer-dashboard", icon: LayoutDashboard },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Find Artisans", path: "/artisans", icon: Search },
    { name: "My Bookings", path: user?.role === 'artisan' ? "/myJobs" : "/customer-bookings", icon: CalendarCheck },
    { name: "Review/Ratings", path: user?.role === 'artisan' ? "/myReview" : "/customer-reviews", icon: Star },
    { name: "KYC Verification", path: "/kyc-verification", icon: FileText },
    { name: "Profile", path: user?.role === 'artisan' ? "/artisan-profile" : "/customer-profile", icon: User },
    { name: "Settings", path: user?.role === 'artisan' ? "/artisan-settings" : "/customer-settings", icon: User },
    { name: "Report issue", path: user?.role === 'artisan' ? "/artisan-report" : "/customer-report", icon: AlertTriangle },
  ];

  // Handle URL parameters for conversation selection
  useEffect(() => {
    if (otherUserId && fetchConversation) {
      fetchConversation(otherUserId);
    }
  }, [otherUserId, fetchConversation]);

  // Prevent navigation when clicking on conversations
  useEffect(() => {
    // Override any navigation that might cause layout issues
    const handleBeforeUnload = (e) => {
      // Prevent page reload that might cause layout issues
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const onLogout = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <div className="h-screen bg-[#F8FAFC] relative">
      {/* Sidebar - Fixed position to prevent disappearing */}
      <aside className="w-64 bg-[#151E3D] text-white flex flex-col justify-between fixed top-0 left-0 h-screen z-30">
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
          onClick={onLogout}
          className="flex items-center gap-3 p-4 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content - Messages Interface */}
      <main className="flex flex-col ml-64 h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div>
            <h2 className="text-lg font-semibold text-[#151E3D]">
              Hi, {user?.name || "User"} 👋
            </h2>
            <p className="text-sm text-gray-500">Messages</p>
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

        {/* Messages Interface */}
        <div className="flex-1 flex bg-gray-100 min-h-0 p-6 gap-6">
          <ConversationList />
          <ChatWindow />
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;

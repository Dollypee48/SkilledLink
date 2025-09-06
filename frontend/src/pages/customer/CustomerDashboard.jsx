// frontend/src/pages/customer/CustomerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import CustomerLayout from "../../components/common/Layouts/CustomerLayout";
import { CalendarCheck, Wallet, Heart, Star } from "lucide-react"; // Removed KYC related icons
import { useBooking } from "../../context/BookingContext"; // Assuming useBooking provides customer's bookings
import { useAuth } from "../../context/AuthContext";
import { ArtisanContext } from "../../context/ArtisanContext";
// import KYCForm from '../../components/KYCForm'; // Removed KYCForm import
import { AlertTriangle, Clock, XCircle, ShieldCheck } from 'lucide-react'; // Import necessary icons for KYC Status

export default function CustomerDashboard() {
  // Destructure 'bookings' as 'myBookings' to avoid conflict and use the correct data for customers
  const { customerBookings, loading: bookingsLoading, error: bookingsError, getBookings } = useBooking();

  // Use ArtisanContext directly for suggestions
  const { suggestions, loadSuggestions } = useContext(ArtisanContext);

  const { user, accessToken } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [artisansError, setArtisansError] = useState(null);

  useEffect(() => {
    if (!hasFetched && user && accessToken) {
      // Fetch bookings for the customer
      // Ensure getBookings is called and error handled
      getBookings().catch((err) => console.error("Failed to fetch customer bookings:", err));

      // Fetch suggested artisans
      setArtisansLoading(true);
      // Ensure loadSuggestions is called and error handled
      loadSuggestions().catch((err) => { // loadSuggestions in ArtisanContext no longer takes token as arg
          console.error("Failed to fetch suggested artisans:", err);
          setArtisansError("Could not load artisans.");
        })
        .finally(() => setArtisansLoading(false));

      setHasFetched(true);
    }
  }, [getBookings, loadSuggestions, hasFetched, user, accessToken]); // Keep dependencies updated

  // Get bookings in progress (Accepted or Pending Confirmation)
  const bookingsInProgress = customerBookings?.filter((b) => 
    b.status === "Accepted" || b.status === "Pending Confirmation"
  ) || [];

  const inProgressBooking = bookingsInProgress[0] || {
    service: "No active bookings",
    date: "All services completed",
  };

  // Count total bookings made
  const totalBookings = customerBookings?.length || 0;

  const loading = bookingsLoading || artisansLoading;
  const error = bookingsError || artisansError;

  const getKYCStatusDisplay = () => {
    if (!user) return null;

    let statusText = "";
    let statusColor = "";
    let statusIcon = null;

    switch (user.kycStatus) {
      case 'pending':
        statusText = 'Your KYC is under review.';
        statusColor = 'bg-yellow-100 text-yellow-800';
        statusIcon = <Clock className="w-5 h-5 mr-2" />;
        break;
      case 'approved':
        statusText = 'Your KYC has been approved!';
        statusColor = 'bg-green-100 text-green-800';
        statusIcon = <ShieldCheck className="w-5 h-5 mr-2" />;
        break;
      case 'rejected':
        statusText = 'Your KYC submission was rejected. Please re-submit.';
        statusColor = 'bg-red-100 text-red-800';
        statusIcon = <XCircle className="w-5 h-5 mr-2" />;
        break;
      default:
        statusText = 'KYC verification is required.';
        statusColor = 'bg-blue-100 text-blue-800';
        statusIcon = <AlertTriangle className="w-5 h-5 mr-2" />;
    }

    return (
      <div className={`p-3 rounded-md mb-4 flex items-center ${statusColor}`}>
        {statusIcon}
        <p className="text-sm font-medium">{statusText}</p>
      </div>
    );
  };

  return (
    <CustomerLayout>
      <div className="p-6">
        {/* KYC Status Indicator */}
        {getKYCStatusDisplay()}

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F59E0B] text-white">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold">Bookings in Progress</h2>
              <p className="text-sm mt-1 text-gray-600">{inProgressBooking.service}</p>
              <p className="text-xs text-gray-400">{inProgressBooking.date}</p>
              {bookingsInProgress.length > 1 && (
                <p className="text-xs text-blue-600 font-medium">+{bookingsInProgress.length - 1} more</p>
              )}
            </div>
          </div>

                     <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
             <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F59E0B] text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
             </div>
             <div>
               <h2 className="font-semibold">Total Bookings</h2>
               <p className="mt-1 text-lg font-bold">{totalBookings}</p>
               <p className="text-xs text-gray-500">All time bookings</p>
             </div>
           </div>

          <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F59E0B] text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold">Favourite Artisan</h2>
              <p className="mt-1 text-gray-500">No favourite yet</p>
            </div>
          </div>
        </div>

        {/* Bookings + Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Booking history */}
          <div className="lg:col-span-2 bg-white shadow rounded-xl p-5">
            <h2 className="font-semibold mb-4">Booking History</h2>
            {loading ? (
              <p className="text-gray-600">Loading bookings...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : customerBookings?.length === 0 ? ( // Use customerBookings here
              <p className="text-gray-600">
                No bookings found. It looks like you haven't made any bookings yet!
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-2">Date</th>
                    <th className="p-2">Artisan</th>
                    <th className="p-2">Service</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerBookings?.map((booking) => ( // Use customerBookings here
                    <tr key={booking._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2">{new Date(booking.date).toLocaleDateString() || "N/A"}</td>
                      <td className="p-2">{booking.artisan?.name || "N/A"}</td>
                      <td className="p-2">{booking.service || "N/A"}</td>
                      <td className="p-2">
                        {booking.status === "Completed" && (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                            Completed
                          </span>
                        )}
                        {booking.status === "Pending" && (
                          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">
                            Pending
                          </span>
                        )}
                        {booking.status === "Accepted" && (
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                            In Progress
                          </span>
                        )}
                        {booking.status === "Pending Confirmation" && (
                          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                            Pending Confirmation
                          </span>
                        )}
                        {booking.status === "Declined" && (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
                            Declined
                          </span>
                        )}
                        {booking.status === "Cancelled" && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                            Cancelled
                          </span>
                        )}
                        {(!booking.status || booking.status === "") && (
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                            Unknown
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Suggested artisans */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="font-semibold mb-4">Suggested Artisans</h2>
            {loading ? (
              <p className="text-gray-600">Loading artisans...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : suggestions?.length === 0 ? (
              <p className="text-gray-600">No artisans found. Please try again later!</p>
            ) : (
              <div className="space-y-3">
                {suggestions?.map((artisan) => (
                  <div
                    key={artisan._id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white font-bold">
                        {artisan.skills?.[0]?.charAt(0) || "A"}
                      </div>
                      <div>
                        <p className="font-medium">{artisan.skills?.join(", ") || "Unknown Artisan"}</p>
                        <p className="text-xs text-gray-500">{artisan.role || "Artisan"}</p>
                      </div>
                    </div>
                    <span className="flex items-center text-yellow-500 text-sm font-semibold">
                      <Star className="w-4 h-4 mr-1" />
                      {artisan.rating || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
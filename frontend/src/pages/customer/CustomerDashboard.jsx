// frontend/src/pages/customer/CustomerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";
import { CalendarCheck, Wallet, Heart, Star } from "lucide-react";
import { useBooking } from "../../context/BookingContext"; // Assuming useBooking provides customer's bookings
import useAuth from "../../hooks/useAuth";
import { ArtisanContext } from "../../context/ArtisanContext";

export default function CustomerDashboard() {
  // Destructure 'bookings' as 'myBookings' to avoid conflict and use the correct data for customers
  const { artisanBookings, loading: bookingsLoading, error: bookingsError, getBookings } = useBooking();

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

  // Safely access myBookings (which will be an array, or empty array initially)
  const upcomingBooking =
    artisanBookings?.find((b) => b.status === "Pending") || {
      service: "Light fixture installation",
      date: "April 3, 2025 at 2:00 PM",
    };

  const totalSpent =
    artisanBookings?.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0).toFixed(2) || "0.00";

  const loading = bookingsLoading || artisansLoading;
  const error = bookingsError || artisansError;

  return (
    <CustomerLayout>
      <div className="p-6">
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5d4aa] text-[#6b2d11]">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold">Upcoming Booking</h2>
              <p className="text-sm mt-1 text-gray-600">{upcomingBooking.service}</p>
              <p className="text-xs text-gray-400">{upcomingBooking.date}</p>
            </div>
          </div>

          <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5d4aa] text-[#6b2d11]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold">Total Spent</h2>
              <p className="mt-1 text-lg font-bold">₦{totalSpent}</p>
            </div>
          </div>

          <div className="bg-white shadow hover:shadow-lg transition rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5d4aa] text-[#6b2d11]">
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
            ) : artisanBookings?.length === 0 ? ( // Use artisanBookings here
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
                  {artisanBookings?.map((booking) => ( // Use artisanBookings here
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
                        {booking.status === "Cancelled" && (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
                            Cancelled
                          </span>
                        )}
                        {!booking.status && <span className="text-gray-500">N/A</span>}
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
                      <div className="w-10 h-10 rounded-full bg-[#f5d4aa] flex items-center justify-center text-[#6b2d11] font-bold">
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
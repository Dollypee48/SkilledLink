import React from "react";
import CustomerLayout from "../../components/common/Layouts/CustomerLayout";
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { User, CheckCircle, XCircle, Clock } from 'lucide-react'; // Import icons

const CustomerProfile = () => {
  const { user } = useAuth(); // Get user from AuthContext

  const getKycStatusDisplay = (status) => {
    switch (status) {
      case 'approved': return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved</span>;
      case 'pending': return <span className="text-yellow-600 font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>;
      case 'rejected': return <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Rejected</span>;
      default: return <span className="text-gray-500 font-medium">Not Submitted</span>;
    }
  };

  return (
    <CustomerLayout>
      <div className="p-8 min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-[#151E3D] mb-8 text-center">My Profile</h1>

        {user ? (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8 pb-6 border-b border-gray-200">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-[#151E3D] shadow-md" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#151E3D] shadow-md">
                  <User className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-lg text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-700">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-base font-semibold mt-1">{user.phone || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Address</span>
                <span className="text-base font-semibold mt-1">{user.address || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Nationality</span>
                <span className="text-base font-semibold mt-1">{user.nationality || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">State</span>
                <span className="text-base font-semibold mt-1">{user.state || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Occupation</span>
                <span className="text-base font-semibold mt-1">{user.occupation || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">KYC Status</span>
                <span className="mt-1">{getKycStatusDisplay(user.kycStatus)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg py-12">Please log in to view your profile.</p>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;

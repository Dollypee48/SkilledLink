import React from "react";
import { useAuth } from "../context/AuthContext";
import CustomerLayout from "../components/common/layouts/CustomerLayout";
import ArtisanLayout from "../components/common/layouts/ArtisanLayout";
import KYCForm from "../components/KYCForm";
import { ShieldCheck, Clock, XCircle, AlertTriangle } from 'lucide-react';

const KYCPage = () => {
  const { user } = useAuth();

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

  if (!user) {
    return <p>Please log in to view this page.</p>;
  }

  const Layout = user.role === 'customer' ? CustomerLayout : ArtisanLayout;

  return (
    <Layout>
      <div className="p-6 text-[#6b2d11]">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-gray-600 mb-6">
          Complete your Know Your Customer (KYC) verification to unlock full platform features.
        </p>

        {getKYCStatusDisplay()}

        {user.kycStatus !== 'approved' && (
          <KYCForm />
        )}
      </div>
    </Layout>
  );
};

export default KYCPage;

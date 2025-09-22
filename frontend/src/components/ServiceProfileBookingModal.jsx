import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceProfileBookingService } from '../services/serviceProfileBookingService';

const ServiceProfileBookingModal = ({ isOpen, onClose, serviceProfile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    description: '',
    estimatedDuration: '',
    specialRequirements: '',
  });

  // Calculate total amount based on duration and hourly rate
  const calculateTotalAmount = () => {
    const duration = parseFloat(bookingDetails.estimatedDuration) || 0;
    // Use service profile hourly rate first, fallback to artisan's hourly rate
    const hourlyRate = serviceProfile?.hourlyRate || 
                      serviceProfile?.artisanId?.artisanProfile?.hourlyRate || 0;
    return duration * hourlyRate;
  };

  // Get the effective hourly rate for display
  const getEffectiveHourlyRate = () => {
    const serviceProfileRate = serviceProfile?.hourlyRate;
    const artisanRate = serviceProfile?.artisanId?.artisanProfile?.hourlyRate;
    const effectiveRate = serviceProfileRate || artisanRate || 0;
    
    // Debug logging
    console.log('Hourly rate calculation:', {
      serviceProfile: serviceProfile,
      serviceProfileRate,
      artisanRate,
      effectiveRate
    });
    
    return effectiveRate;
  };

  const totalAmount = calculateTotalAmount();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setBookingDetails({
        date: '',
        time: '',
        description: '',
        estimatedDuration: '',
        specialRequirements: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceProfile) {
      toast.error("No service profile selected for booking.");
      return;
    }

    // Check KYC verification status
    if (!user?.kycVerified || user?.kycStatus !== 'approved') {
      toast.error("KYC verification required to book services. Please complete your identity verification first.");
      onClose();
      navigate('/customer-settings');
      return;
    }

    // Check if service profile is active
    if (!serviceProfile.isActive) {
      toast.error("This service is currently unavailable for booking.");
      return;
    }

    // Check if estimated duration is provided
    if (!bookingDetails.estimatedDuration || parseFloat(bookingDetails.estimatedDuration) <= 0) {
      toast.error("Please provide a valid estimated duration for the service.");
      return;
    }

    const fullBookingData = {
      serviceProfile: serviceProfile._id, // Service profile ID
      date: bookingDetails.date,
      time: bookingDetails.time,
      description: bookingDetails.description,
      estimatedDuration: parseFloat(bookingDetails.estimatedDuration),
      specialRequirements: bookingDetails.specialRequirements,
      location: serviceProfile.serviceArea?.address || '',
    };

    // Debug logging
    console.log('Service Profile Booking data being sent:', fullBookingData);
    console.log('Selected service profile:', serviceProfile);

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Authentication token is required");
      }

      await ServiceProfileBookingService.createServiceProfileBooking(fullBookingData, token);
      toast.success("Booking created successfully!");
      onClose();
    } catch (error) {
      console.error('Booking creation error:', error);
      if (error.message && error.message.includes('KYC verification required')) {
        toast.error("KYC verification required to book services. Please complete your identity verification first.");
        onClose();
        navigate('/customer-settings');
      } else {
        toast.error(error.message || "Failed to create booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !serviceProfile) return null;

  // Check if KYC is required
  const isKYCRequired = !user?.kycVerified || user?.kycStatus !== 'approved';
  const isServiceUnavailable = !serviceProfile.isActive;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#151E3D] mb-6">
          Book {serviceProfile.serviceName || serviceProfile.title}
        </h2>
        
        {/* Service Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl text-green-600">₦</span>
              <span className="text-gray-700 font-medium">Hourly Rate:</span>
              <span className="font-bold text-green-600">₦{getEffectiveHourlyRate().toLocaleString()}/hour</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">Duration Range:</span>
              <span className="font-bold text-blue-600">{serviceProfile.minimumHours || 1}-{serviceProfile.maximumHours || 8} hours</span>
            </div>
          </div>
        </div>

        {/* KYC Verification Warning */}
        {isKYCRequired && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  KYC Verification Required
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  You need to complete your identity verification before booking services.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/customer-settings');
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Complete KYC Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Unavailable Warning */}
        {isServiceUnavailable && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Service Currently Unavailable
                </h3>
                <p className="text-sm text-red-700">
                  This service is currently not accepting new bookings. Please try again later or contact the artisan directly.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Preferred Date: *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={bookingDetails.date}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-gray-700 text-sm font-bold mb-2">Preferred Time: *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={bookingDetails.time}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                required
              />
            </div>
          </div>

          {/* Duration Section */}
          <div>
            <label htmlFor="estimatedDuration" className="block text-gray-700 text-sm font-bold mb-2">Estimated Duration (hours): *</label>
            <input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              value={bookingDetails.estimatedDuration}
              onChange={handleChange}
              min="1"
              max="24"
              step="0.5"
              placeholder="Enter estimated duration in hours"
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
              required
            />
          </div>

          {/* Pricing Calculation Display */}
          {bookingDetails.estimatedDuration && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">₦</span>
                Pricing Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-700 font-medium">Hourly Rate:</span>
                  <span className="font-bold text-green-600 text-lg">₦{getEffectiveHourlyRate().toLocaleString()}/hour</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-700 font-medium">Estimated Duration:</span>
                  <span className="font-bold text-blue-600 text-lg">{bookingDetails.estimatedDuration} hours</span>
                </div>
                <div className="border-t-2 border-green-200 pt-3">
                  <div className="flex justify-between items-center bg-green-100 p-4 rounded-lg">
                    <span className="text-green-900 font-bold text-xl">Total Amount:</span>
                    <span className="text-green-900 font-bold text-2xl">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Description Section */}
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Service Description: *</label>
            <textarea
              id="description"
              name="description"
              value={bookingDetails.description}
              onChange={handleChange}
              rows="4"
              placeholder="Please describe the service you need in detail..."
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
              required
            ></textarea>
          </div>

          {/* Special Requirements Section */}
          <div>
            <label htmlFor="specialRequirements" className="block text-gray-700 text-sm font-bold mb-2">Special Requirements or Notes:</label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={bookingDetails.specialRequirements}
              onChange={handleChange}
              rows="3"
              placeholder="Any special requirements, access instructions, or additional notes..."
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-bold py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isServiceUnavailable || !bookingDetails.estimatedDuration || parseFloat(bookingDetails.estimatedDuration) <= 0}
            >
              {loading ? 'Creating Booking...' : `Book Service - ₦${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ServiceProfileBookingModal;

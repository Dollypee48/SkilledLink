import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
import { useBooking } from '../context/BookingContext'; // Import useBooking hook
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookingModal = () => {
  const { isBookingModalOpen, closeBookingModal, selectedArtisan, createBooking, loading: bookingLoading } = useBooking();
  const { user } = useAuth();
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    location: '',
    serviceType: '',
    urgencyLevel: 'normal',
    description: '',
    contactPhone: '',
    preferredContactMethod: 'phone',
    estimatedDuration: '',
    specialRequirements: '',
  });

  useEffect(() => {
    if (!isBookingModalOpen) {
      // Reset form when modal closes
      setBookingDetails({
        date: '',
        time: '',
        location: '',
        serviceType: '',
        urgencyLevel: 'normal',
        description: '',
        contactPhone: '',
        preferredContactMethod: 'phone',
        estimatedDuration: '',
        specialRequirements: '',
      });
    }
  }, [isBookingModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedArtisan) {
      toast.error("No artisan selected for booking.");
      return;
    }

    const fullBookingData = {
      artisan: selectedArtisan._id,
      service: selectedArtisan.service, // Use the artisan's primary service directly
      ...bookingDetails,
    };

    try {
      await createBooking(fullBookingData);
      toast.success("Booking created successfully!");
      closeBookingModal();
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  if (!isBookingModalOpen || !selectedArtisan) return null; // Only render if open and artisan is selected

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#151E3D] mb-6">Book {selectedArtisan.name} for {selectedArtisan.service || 'a service'}</h2>
        <button
          onClick={closeBookingModal}
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

          {/* Urgency Section */}
          <div>
            <label htmlFor="urgencyLevel" className="block text-gray-700 text-sm font-bold mb-2">Urgency Level: *</label>
            <select
              id="urgencyLevel"
              name="urgencyLevel"
              value={bookingDetails.urgencyLevel}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
              required
            >
              <option value="low">Low - Can wait a few days</option>
              <option value="normal">Normal - Within 1-2 days</option>
              <option value="high">High - Same day or next day</option>
              <option value="emergency">Emergency - Immediate attention needed</option>
            </select>
          </div>

          {/* Contact Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPhone" className="block text-gray-700 text-sm font-bold mb-2">Contact Phone: *</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={bookingDetails.contactPhone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                required
              />
            </div>
            <div>
              <label htmlFor="preferredContactMethod" className="block text-gray-700 text-sm font-bold mb-2">Preferred Contact Method:</label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={bookingDetails.preferredContactMethod}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
              >
                <option value="phone">Phone Call</option>
                <option value="sms">SMS/Text Message</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

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
              onClick={closeBookingModal}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#151E3D] hover:bg-[#1E2A4A] text-white font-bold py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-[#151E3D] focus:ring-offset-2 transition-all duration-300"
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default BookingModal;

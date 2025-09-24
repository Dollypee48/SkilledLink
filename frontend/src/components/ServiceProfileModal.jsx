import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, MapPin, Calendar } from 'lucide-react';
import serviceProfileService from '../services/serviceProfileService';
import { toast } from 'react-toastify';

const ServiceProfileModal = ({ isOpen, onClose, onSave, profile, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    hourlyRate: '',
    minimumHours: 1,
    maximumHours: 8,
    serviceArea: {
      type: 'local',
      radius: 10,
      specificAreas: []
    },
    requirements: {
      toolsProvided: true,
      materialsProvided: false,
      customerTools: false,
      specialRequirements: ''
    },
    pricing: {
      baseRate: '',
      weekendRate: '',
      holidayRate: '',
      emergencyRate: '',
      travelFee: 0
    },
    responseTime: 'within_4_hours',
    cancellationPolicy: {
      type: 'moderate',
      description: ''
    },
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' },
      saturday: { available: true, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'appliance_repair', label: 'Appliance Repair' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'tiling', label: 'Tiling' },
    { value: 'masonry', label: 'Masonry' },
    { value: 'welding', label: 'Welding' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'computer_repair', label: 'Computer Repair' },
    { value: 'phone_repair', label: 'Phone Repair' },
    { value: 'photography', label: 'Photography' },
    { value: 'catering', label: 'Catering' },
    { value: 'event_planning', label: 'Event Planning' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'massage', label: 'Massage' },
    { value: 'other', label: 'Other' }
  ];

  const responseTimeOptions = [
    { value: 'within_1_hour', label: 'Within 1 hour' },
    { value: 'within_2_hours', label: 'Within 2 hours' },
    { value: 'within_4_hours', label: 'Within 4 hours' },
    { value: 'within_24_hours', label: 'Within 24 hours' },
    { value: 'next_day', label: 'Next day' }
  ];

  const cancellationPolicyTypes = [
    { value: 'flexible', label: 'Flexible' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'strict', label: 'Strict' }
  ];

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        pricing: {
          baseRate: profile.pricing?.baseRate || profile.hourlyRate || '',
          weekendRate: profile.pricing?.weekendRate || '',
          holidayRate: profile.pricing?.holidayRate || '',
          emergencyRate: profile.pricing?.emergencyRate || '',
          travelFee: profile.pricing?.travelFee || 0
        }
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.hourlyRate || formData.hourlyRate <= 0) newErrors.hourlyRate = 'Valid hourly rate is required';
    if (formData.minimumHours >= formData.maximumHours) newErrors.maximumHours = 'Maximum hours must be greater than minimum hours';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData
      };

      if (profile) {
        await serviceProfileService.updateServiceProfile(profile._id, submitData, token);
        toast.success('Service profile updated successfully');
      } else {
        await serviceProfileService.createServiceProfile(submitData, token);
        toast.success('Service profile created successfully');
      }

      onSave();
    } catch (error) {
      toast.error(error.message || 'Failed to save service profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {profile ? 'Edit Service Profile' : 'Create Service Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Professional Plumbing Services"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                placeholder="e.g., Emergency Repairs, Installation"
              />
            </div>

          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Hours</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (₦) *
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] ${
                    errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5000"
                />
                {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Hours
                </label>
                <input
                  type="number"
                  name="minimumHours"
                  value={formData.minimumHours}
                  onChange={handleInputChange}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Hours
                </label>
                <input
                  type="number"
                  name="maximumHours"
                  value={formData.maximumHours}
                  onChange={handleInputChange}
                  min="1"
                  step="0.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] ${
                    errors.maximumHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maximumHours && <p className="text-red-500 text-xs mt-1">{errors.maximumHours}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekend Rate (₦)
                </label>
                <input
                  type="number"
                  name="pricing.weekendRate"
                  value={formData.pricing.weekendRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Fee (₦)
                </label>
                <input
                  type="number"
                  name="pricing.travelFee"
                  value={formData.pricing.travelFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
            
            <div className="space-y-3">
              {days.map(day => (
                <div key={day.key} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availability[day.key].available}
                        onChange={(e) => handleAvailabilityChange(day.key, 'available', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  </div>
                  
                  {formData.availability[day.key].available && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={formData.availability[day.key].startTime}
                        onChange={(e) => handleAvailabilityChange(day.key, 'startTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.availability[day.key].endTime}
                        onChange={(e) => handleAvailabilityChange(day.key, 'endTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Response Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
            
            <select
              name="responseTime"
              value={formData.responseTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D]"
            >
              {responseTimeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceProfileModal;

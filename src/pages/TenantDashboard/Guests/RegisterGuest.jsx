import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';

const RegisterGuest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    expectedArrivalDate: '',
    expectedArrivalTime: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredGuest, setRegisteredGuest] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    // Validate guest name
    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (formData.guestName.trim().length < 2) {
      newErrors.guestName = 'Guest name must be at least 2 characters';
    }

    // Validate phone number
    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.guestPhone.replace(/[\s-]/g, ''))) {
      newErrors.guestPhone = 'Please enter a valid phone number';
    }

    // Validate date
    if (!formData.expectedArrivalDate) {
      newErrors.expectedArrivalDate = 'Expected arrival date is required';
    } else {
      const selectedDate = new Date(formData.expectedArrivalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expectedArrivalDate = 'Arrival date cannot be in the past';
      }
    }

    // Validate time
    if (!formData.expectedArrivalTime) {
      newErrors.expectedArrivalTime = 'Expected arrival time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Combine date and time into ISO string
      const expectedArrival = new Date(`${formData.expectedArrivalDate}T${formData.expectedArrivalTime}`).toISOString();

      const guestData = {
        guestName: formData.guestName.trim(),
        guestPhone: formData.guestPhone.trim(),
        expectedArrival: expectedArrival
      };

      const result = await apiService.registerGuest(guestData);
      
      setRegisteredGuest(result.guest);
      setShowSuccessModal(true);
    } catch (err) {
      alert('Failed to register guest: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/tenant-dashboard/guests');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tenant-dashboard/guests')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Guest List
        </button>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-user-plus text-blue-600 mr-3"></i>
          Register Guest
        </h1>
        <p className="text-gray-600 mt-2">Register a visitor and generate an access code</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <form onSubmit={handleSubmit}>
          {/* Guest Name */}
          <div className="mb-6">
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-user text-gray-400"></i>
              </div>
              <input
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guestName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter guest's full name"
              />
            </div>
            {errors.guestName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.guestName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-6">
            <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-phone text-gray-400"></i>
              </div>
              <input
                type="tel"
                id="guestPhone"
                name="guestPhone"
                value={formData.guestPhone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guestPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+254712345678"
              />
            </div>
            {errors.guestPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.guestPhone}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Access code will be sent to this number via SMS
            </p>
          </div>

          {/* Expected Arrival Date */}
          <div className="mb-6">
            <label htmlFor="expectedArrivalDate" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Arrival Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-calendar text-gray-400"></i>
              </div>
              <input
                type="date"
                id="expectedArrivalDate"
                name="expectedArrivalDate"
                value={formData.expectedArrivalDate}
                onChange={handleChange}
                min={getTodayDate()}
                max={getMaxDate()}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expectedArrivalDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.expectedArrivalDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.expectedArrivalDate}
              </p>
            )}
          </div>

          {/* Expected Arrival Time */}
          <div className="mb-6">
            <label htmlFor="expectedArrivalTime" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Arrival Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-clock text-gray-400"></i>
              </div>
              <input
                type="time"
                id="expectedArrivalTime"
                name="expectedArrivalTime"
                value={formData.expectedArrivalTime}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expectedArrivalTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.expectedArrivalTime && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.expectedArrivalTime}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-blue-600 mt-1"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">What happens next:</p>
                <ul className="space-y-1">
                  <li><i className="fas fa-check text-blue-600 mr-2"></i>A unique 6-digit access code will be generated</li>
                  <li><i className="fas fa-check text-blue-600 mr-2"></i>The code will be sent to your guest via SMS within 1 minute</li>
                  <li><i className="fas fa-check text-blue-600 mr-2"></i>The access code is valid for 24 hours</li>
                  <li><i className="fas fa-check text-blue-600 mr-2"></i>You'll receive a notification when your guest arrives</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tenant-dashboard/guests')}
              disabled={submitting}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Registering...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Register Guest
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Guest Registered!</h3>
              <p className="text-gray-600 mb-6">
                {registeredGuest.guestName} has been successfully registered.
              </p>

              {/* Access Code Display */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Access Code</p>
                <p className="text-4xl font-bold text-blue-600 tracking-wider mb-2">
                  {registeredGuest.accessCode}
                </p>
                <p className="text-xs text-gray-600">
                  <i className="fas fa-clock mr-1"></i>
                  Valid for 24 hours
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-green-700 text-sm">
                  <i className="fas fa-sms text-green-600 mr-2"></i>
                  SMS sent to {registeredGuest.guestPhone}
                </div>
              </div>

              <button
                onClick={handleSuccessClose}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Guest List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterGuest;

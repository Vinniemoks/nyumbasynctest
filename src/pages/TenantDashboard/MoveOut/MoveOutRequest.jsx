import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { useToast } from '../../../components/Toast';
import apiService from '../../../api/api';

const MoveOutRequest = () => {
  const navigate = useNavigate();
  const { property, lease } = useTenant();
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    moveOutDate: '',
    reason: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    // Validate move-out date
    if (!formData.moveOutDate) {
      newErrors.moveOutDate = 'Move-out date is required';
    } else {
      const selectedDate = new Date(formData.moveOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.moveOutDate = 'Move-out date cannot be in the past';
      }
      
      // Check if date is at least 30 days from now (common notice period)
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 30);
      minDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < minDate) {
        newErrors.moveOutDate = 'Move-out date must be at least 30 days from today';
      }
    }
    
    // Validate reason
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for moving out is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason must not exceed 500 characters';
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
    
    // Clear error for this field when user starts typing
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
    
    setLoading(true);
    
    try {
      const response = await apiService.submitMoveOutRequest({
        propertyId: property?.id,
        leaseId: lease?.id,
        moveOutDate: formData.moveOutDate,
        reason: formData.reason
      });
      
      setReferenceNumber(response.referenceNumber);
      setSubmitted(true);
      success('Move-out request submitted successfully');
    } catch (err) {
      console.error('Failed to submit move-out request:', err);
      showError(err.message || 'Failed to submit move-out request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatus = () => {
    navigate('/tenant-dashboard/move-out/status');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <i className="fas fa-check text-green-600 text-2xl"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Move-Out Request Submitted
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your move-out request has been successfully submitted and sent to your property stakeholder.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="text-2xl font-bold text-blue-600">{referenceNumber}</p>
              <p className="text-xs text-gray-500 mt-2">
                Please save this reference number for your records
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Your property stakeholder will review your request</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>You will receive a notification when they respond</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>An inspection will be scheduled before your move-out date</span>
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleViewStatus}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Status
              </button>
              <button
                onClick={() => navigate('/tenant-dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Move-Out Request
          </h1>
          <p className="text-gray-600">
            Submit a formal notice of your intention to vacate the property
          </p>
        </div>

        {/* Property Information */}
        {property && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Current Property</h3>
            <p className="text-sm text-gray-700">{property.address}</p>
            {property.unitNumber && (
              <p className="text-sm text-gray-600">Unit: {property.unitNumber}</p>
            )}
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Important Notice</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• A minimum of 30 days notice is required</li>
                <li>• Your lease agreement terms will apply</li>
                <li>• A property inspection will be scheduled</li>
                <li>• Deposit refund will be processed after inspection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Move-Out Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Move-Out Date */}
          <div>
            <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-2">
              Intended Move-Out Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="moveOutDate"
              name="moveOutDate"
              value={formData.moveOutDate}
              onChange={handleChange}
              min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.moveOutDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.moveOutDate && (
              <p className="mt-1 text-sm text-red-600">{errors.moveOutDate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 30 days from today
            </p>
          </div>

          {/* Reason for Moving Out */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Moving Out <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={5}
              placeholder="Please provide a detailed reason for your move-out request..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/500 characters (minimum 10 characters)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Request
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenant-dashboard')}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveOutRequest;

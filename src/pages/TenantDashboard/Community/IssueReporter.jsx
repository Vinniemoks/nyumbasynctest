import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import FileUploader from '../../../components/shared/FileUploader';

const IssueReporter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    priority: 'normal'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const locations = [
    { value: 'lobby', label: 'Lobby', icon: 'fas fa-door-open' },
    { value: 'parking', label: 'Parking Area', icon: 'fas fa-parking' },
    { value: 'gym', label: 'Gym / Fitness Center', icon: 'fas fa-dumbbell' },
    { value: 'pool', label: 'Swimming Pool', icon: 'fas fa-swimming-pool' },
    { value: 'elevator', label: 'Elevator', icon: 'fas fa-elevator' },
    { value: 'hallway', label: 'Hallway / Corridor', icon: 'fas fa-arrows-alt-h' },
    { value: 'stairwell', label: 'Stairwell', icon: 'fas fa-stairs' },
    { value: 'courtyard', label: 'Courtyard / Garden', icon: 'fas fa-tree' },
    { value: 'laundry', label: 'Laundry Room', icon: 'fas fa-tshirt' },
    { value: 'mailroom', label: 'Mail Room', icon: 'fas fa-mailbox' },
    { value: 'other', label: 'Other', icon: 'fas fa-map-marker-alt' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', description: 'Minor issue, no immediate action needed', color: 'text-green-600' },
    { value: 'normal', label: 'Normal', description: 'Standard issue, address when possible', color: 'text-blue-600' },
    { value: 'high', label: 'High', description: 'Important issue, needs prompt attention', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issue, immediate action required', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleImagesChange = (files) => {
    setImages(files);
  };

  const validateForm = () => {
    if (!formData.location) {
      setError('Please select a location');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description of the issue');
      return false;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const issueData = {
        ...formData,
        images: images.map(img => URL.createObjectURL(img))
      };

      const response = await apiService.reportCommonAreaIssue(issueData);
      
      setSuccess(true);
      setTicketNumber(response.issue.ticketNumber);
      
      // Reset form
      setFormData({
        location: '',
        description: '',
        priority: 'normal'
      });
      setImages([]);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/tenant-dashboard/community');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit issue report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="mb-4">
            <i className="fas fa-check-circle text-green-600 text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Issue Reported Successfully!</h2>
          <p className="text-green-700 mb-4">
            Your report has been submitted and property management has been notified.
          </p>
          <div className="bg-white border border-green-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Ticket Number</p>
            <p className="text-2xl font-bold text-gray-800">{ticketNumber}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            You will receive updates on the status of your report. Please save your ticket number for reference.
          </p>
          <button
            onClick={() => navigate('/tenant-dashboard/community')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/community')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Community
        </button>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-tools text-blue-600 mr-3"></i>
          Report Common Area Issue
        </h1>
        <p className="text-gray-600 mt-2">
          Report problems in shared spaces like lobby, parking, gym, pool, or other common areas
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <i className="fas fa-exclamation-circle text-red-600 mt-0.5 mr-3"></i>
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Location Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Location <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {locations.map((location) => (
              <button
                key={location.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, location: location.value }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.location === location.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className={`${location.icon} text-2xl mb-2 ${
                  formData.location === location.value ? 'text-blue-600' : 'text-gray-400'
                }`}></i>
                <p className={`text-sm font-medium ${
                  formData.location === location.value ? 'text-blue-800' : 'text-gray-700'
                }`}>
                  {location.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            placeholder="Please describe the issue in detail. Include what you observed, when you noticed it, and any other relevant information..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.description.length} characters (minimum 10 required)
          </p>
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  formData.priority === priority.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      priority.value === 'urgent' ? 'bg-red-600' :
                      priority.value === 'high' ? 'bg-orange-600' :
                      priority.value === 'normal' ? 'bg-blue-600' :
                      'bg-green-600'
                    }`}></div>
                    <div>
                      <p className={`font-medium ${priority.color}`}>{priority.label}</p>
                      <p className="text-sm text-gray-600">{priority.description}</p>
                    </div>
                  </div>
                  {formData.priority === priority.value && (
                    <i className="fas fa-check-circle text-blue-600 text-xl"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Upload photos to help illustrate the issue. Maximum 5 images, 10MB each.
          </p>
          <FileUploader
            onFilesChange={handleImagesChange}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            accept="image/*"
            multiple={true}
          />
        </div>

        {/* Info Box */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mt-0.5 mr-3"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Property management will be notified immediately</li>
                <li>You'll receive a ticket number for tracking</li>
                <li>The issue will be assessed and prioritized</li>
                <li>You'll receive updates on the resolution progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/tenant-dashboard/community')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueReporter;

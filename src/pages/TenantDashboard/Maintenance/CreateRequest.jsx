import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import FileUploader from '../../../components/shared/FileUploader';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'medium'
  });
  const [images, setImages] = useState([]);

  const categories = [
    { value: 'plumbing', label: 'Plumbing', icon: 'fa-faucet' },
    { value: 'electrical', label: 'Electrical', icon: 'fa-bolt' },
    { value: 'hvac', label: 'HVAC', icon: 'fa-fan' },
    { value: 'appliances', label: 'Appliances', icon: 'fa-blender' },
    { value: 'other', label: 'Other', icon: 'fa-tools' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', description: 'Can wait a few days', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', description: 'Should be addressed soon', color: 'text-yellow-600' },
    { value: 'high', label: 'High', description: 'Needs immediate attention', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Prepare request data
      const requestData = {
        ...formData,
        ticketNumber,
        images: images.map(img => img.url || img.preview),
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

      // Submit request
      const response = await apiService.createMaintenanceRequest(requestData);

      // Show success and navigate
      navigate(`/tenant-dashboard/maintenance/${response.id}`, {
        state: { 
          message: 'Maintenance request submitted successfully!',
          ticketNumber 
        }
      });
    } catch (err) {
      setError('Failed to submit maintenance request. Please try again.');
      console.error('Error submitting maintenance request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/maintenance')}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Maintenance
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Maintenance Request</h1>
        <p className="text-gray-600 mt-1">Submit a new maintenance request for your property</p>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          role="alert"
          aria-live="assertive"
        >
          <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Maintenance request form">
        {/* Category Selection */}
        <fieldset className="mb-6">
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Category <span className="text-red-500" aria-label="required">*</span>
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3" role="group" aria-label="Issue category selection">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === category.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                aria-label={`Select ${category.label} category`}
                aria-pressed={formData.category === category.value}
              >
                <i className={`fas ${category.icon} text-2xl mb-2`} aria-hidden="true"></i>
                <div className="text-sm font-medium">{category.label}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500" aria-label="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            placeholder="Please describe the issue in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
            aria-required="true"
            aria-describedby="description-help"
          />
          <p id="description-help" className="text-sm text-gray-500 mt-1">
            Provide as much detail as possible to help us address the issue quickly
          </p>
        </div>

        {/* Priority Selection */}
        <fieldset className="mb-6">
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Priority <span className="text-red-500" aria-label="required">*</span>
          </legend>
          <div className="space-y-3" role="radiogroup" aria-label="Request priority level">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.priority === priority.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  aria-label={`${priority.label} priority: ${priority.description}`}
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <i className={`fas fa-flag ${priority.color}`} aria-hidden="true"></i>
                    <span className="font-medium text-gray-900">{priority.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{priority.description}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Image Upload */}
        <div className="mb-6">
          <label id="photos-label" className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <FileUploader
            images={images}
            setImages={setImages}
            maxImages={5}
            maxSizeMB={10}
            ariaLabelledBy="photos-label"
            ariaDescribedBy="photos-help"
          />
          <p id="photos-help" className="text-sm text-gray-500 mt-2">
            Upload up to 5 photos to help illustrate the issue (max 10MB each)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200" role="group" aria-label="Form actions">
          <button
            type="button"
            onClick={() => navigate('/tenant-dashboard/maintenance')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
            aria-label="Cancel and return to maintenance list"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={loading ? 'Submitting maintenance request' : 'Submit maintenance request'}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane" aria-hidden="true"></i>
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your request will be reviewed by the property management team</li>
              <li>• A qualified vendor will be assigned to address the issue</li>
              <li>• You'll receive notifications about the status of your request</li>
              <li>• The vendor will contact you to schedule a visit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;

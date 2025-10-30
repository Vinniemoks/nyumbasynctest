import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportEmergency = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emergencyType: '',
    location: '',
    description: '',
    severity: 'high',
    contactNumber: '',
    requiresImmediate: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  const emergencyTypes = [
    { value: 'fire', label: 'Fire', icon: 'fas fa-fire', color: 'red' },
    { value: 'medical', label: 'Medical Emergency', icon: 'fas fa-ambulance', color: 'red' },
    { value: 'security', label: 'Security Threat', icon: 'fas fa-shield-alt', color: 'red' },
    { value: 'gas_leak', label: 'Gas Leak', icon: 'fas fa-exclamation-triangle', color: 'orange' },
    { value: 'water_leak', label: 'Major Water Leak', icon: 'fas fa-tint', color: 'blue' },
    { value: 'power_outage', label: 'Power Outage', icon: 'fas fa-bolt', color: 'yellow' },
    { value: 'elevator', label: 'Elevator Emergency', icon: 'fas fa-elevator', color: 'orange' },
    { value: 'other', label: 'Other Emergency', icon: 'fas fa-exclamation-circle', color: 'gray' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Import API service dynamically
      const apiService = (await import('../../../api/api')).default;
      
      // Submit emergency report
      const response = await apiService.reportEmergency(formData);
      
      setReportId(response.reportId);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      alert('Failed to submit emergency report. Please call emergency services directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check-circle text-green-600 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Report Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your emergency report has been submitted successfully and notifications have been sent.
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Report ID</p>
              <p className="text-xl font-bold text-blue-600">{reportId}</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-yellow-600 text-xl mt-0.5 mr-3"></i>
                <div>
                  <h3 className="text-yellow-800 font-semibold">Notifications Sent To:</h3>
                  <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                    <li>✓ Property Manager</li>
                    <li>✓ Building Security</li>
                    {formData.emergencyType === 'fire' && <li>✓ Fire Department</li>}
                    {formData.emergencyType === 'medical' && <li>✓ Emergency Medical Services</li>}
                  </ul>
                  <p className="text-yellow-700 text-sm mt-2">
                    Delivery time: Within 30 seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/tenant-dashboard/emergency')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Back to Emergency Contacts
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    emergencyType: '',
                    location: '',
                    description: '',
                    severity: 'high',
                    contactNumber: '',
                    requiresImmediate: true
                  });
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Report Another Emergency
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-red-600 text-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Report Emergency</h1>
            <p className="text-red-100 mt-1">Submit an emergency report to notify property management and security</p>
          </div>
        </div>
      </div>

      {/* Critical Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5 mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Life-Threatening Emergencies</h3>
            <p className="text-red-700 text-sm mt-1">
              For immediate life-threatening emergencies (fire, medical, crime in progress), call 911 or 999 FIRST before submitting this form.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Report Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Emergency Details</h2>

        {/* Emergency Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Emergency Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyTypes.map((type) => (
              <label
                key={type.value}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.emergencyType === type.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="emergencyType"
                  value={type.value}
                  checked={formData.emergencyType === type.value}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600"
                  required
                />
                <i className={`${type.icon} text-${type.color}-500 text-xl`}></i>
                <span className="font-medium text-gray-900">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Unit 305, Lobby, Parking Level 2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Specify the exact location of the emergency</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide detailed information about the emergency situation..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">Include as much detail as possible to help responders</p>
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="+254712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Number where you can be reached immediately</p>
        </div>

        {/* Severity */}
        <div>
          <label htmlFor="severity" className="block text-sm font-semibold text-gray-700 mb-2">
            Severity Level <span className="text-red-500">*</span>
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="critical">Critical - Immediate danger to life or property</option>
            <option value="high">High - Urgent attention required</option>
            <option value="medium">Medium - Serious but not immediately life-threatening</option>
          </select>
        </div>

        {/* Requires Immediate Response */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="requiresImmediate"
            name="requiresImmediate"
            checked={formData.requiresImmediate}
            onChange={handleChange}
            className="w-5 h-5 text-red-600 mt-0.5"
          />
          <label htmlFor="requiresImmediate" className="text-sm text-gray-700">
            <span className="font-semibold">This emergency requires immediate response</span>
            <p className="text-gray-600 mt-1">
              Check this box if the situation requires immediate attention from emergency services or property management.
            </p>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/tenant-dashboard/emergency')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Submit Emergency Report
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Call Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Call Emergency Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="tel:911"
            className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <i className="fas fa-phone text-red-600 text-xl"></i>
            <div>
              <p className="font-semibold text-gray-900">Emergency</p>
              <p className="text-sm text-gray-600">911</p>
            </div>
          </a>
          <a
            href="tel:+254712345670"
            className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <i className="fas fa-shield-alt text-blue-600 text-xl"></i>
            <div>
              <p className="font-semibold text-gray-900">Security</p>
              <p className="text-sm text-gray-600">+254712345670</p>
            </div>
          </a>
          <a
            href="tel:+254722111222"
            className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <i className="fas fa-building text-purple-600 text-xl"></i>
            <div>
              <p className="font-semibold text-gray-900">Property Mgmt</p>
              <p className="text-sm text-gray-600">+254722111222</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportEmergency;

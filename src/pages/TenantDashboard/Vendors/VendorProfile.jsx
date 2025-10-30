import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';

const VendorProfile = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [serviceRequest, setServiceRequest] = useState({
    description: '',
    preferredDate: '',
    urgency: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVendor(vendorId);
      setVendor(data);
    } catch (err) {
      setError(err.message || 'Failed to load vendor details');
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactVendor = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.contactVendor(vendorId, contactMessage);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowContactModal(false);
        setContactMessage('');
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      alert('Failed to send message. Please try again.');
      console.error('Error contacting vendor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestService = async () => {
    if (!serviceRequest.description.trim()) {
      alert('Please describe the service you need');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.requestService(vendorId, serviceRequest);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowServiceModal(false);
        setServiceRequest({ description: '', preferredDate: '', urgency: 'normal' });
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      alert('Failed to submit service request. Please try again.');
      console.error('Error requesting service:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC',
      air_conditioning: 'Air Conditioning',
      general_repair: 'General Repair',
      carpentry: 'Carpentry',
      painting: 'Painting',
      appliances: 'Appliances',
      refrigeration: 'Refrigeration',
      locksmith: 'Locksmith',
      security: 'Security',
      cleaning: 'Cleaning',
      pest_control: 'Pest Control',
      landscaping: 'Landscaping',
      gardening: 'Gardening',
      water_heating: 'Water Heating',
      lighting: 'Lighting'
    };
    return labels[type] || type;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt text-yellow-400"></i>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vendor</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tenant/vendors')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Vendor Directory
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/tenant/vendors')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Back to Vendor Directory</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Header */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start space-x-6">
              <img
                src={vendor.profileImage}
                alt={vendor.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{vendor.name}</h1>
                    <p className="text-lg text-gray-600 mb-3">{vendor.companyName}</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        vendor.availability === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {vendor.availability === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-3 mt-4">
                  <div className="flex space-x-1">{renderStars(vendor.rating)}</div>
                  <span className="text-xl font-bold text-gray-900">{vendor.rating}</span>
                  <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
            <div className="flex flex-wrap gap-3">
              {vendor.serviceTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
                >
                  {getServiceTypeLabel(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
            <ul className="space-y-2">
              {vendor.certifications.map((cert, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-700">
                  <i className="fas fa-certificate text-blue-600"></i>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
            {vendor.reviews && vendor.reviews.length > 0 ? (
              <div className="space-y-4">
                {vendor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">{review.tenantName}</span>
                        <div className="flex space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            
            {/* Contact Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-700">
                <i className="fas fa-phone w-5 text-blue-600"></i>
                <a href={`tel:${vendor.phoneNumber}`} className="hover:text-blue-600">
                  {vendor.phoneNumber}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <i className="fas fa-envelope w-5 text-blue-600"></i>
                <a href={`mailto:${vendor.email}`} className="hover:text-blue-600 break-all">
                  {vendor.email}
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <i className="fas fa-envelope"></i>
                <span>Contact Vendor</span>
              </button>
              <button
                onClick={() => setShowServiceModal(true)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <i className="fas fa-tools"></i>
                <span>Request Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact Vendor</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                <p className="text-lg font-semibold text-gray-900">Message Sent!</p>
                <p className="text-gray-600 mt-2">The vendor will contact you soon.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what you need help with..."
                  ></textarea>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContactVendor}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Service</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                <p className="text-lg font-semibold text-gray-900">Request Submitted!</p>
                <p className="text-gray-600 mt-2">The vendor will review your request and contact you.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Description *
                    </label>
                    <textarea
                      value={serviceRequest.description}
                      onChange={(e) =>
                        setServiceRequest({ ...serviceRequest, description: e.target.value })
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the service you need..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={serviceRequest.preferredDate}
                      onChange={(e) =>
                        setServiceRequest({ ...serviceRequest, preferredDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      value={serviceRequest.urgency}
                      onChange={(e) =>
                        setServiceRequest({ ...serviceRequest, urgency: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low - Can wait a few days</option>
                      <option value="normal">Normal - Within a week</option>
                      <option value="high">High - As soon as possible</option>
                      <option value="urgent">Urgent - Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestService}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;

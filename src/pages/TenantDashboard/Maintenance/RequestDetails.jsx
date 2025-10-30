import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';
import VendorRating from './VendorRating';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  useEffect(() => {
    fetchRequestDetails();
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [id, successMessage]);

  // Simulate WebSocket updates (in real app, this would be actual WebSocket)
  useEffect(() => {
    if (!request) return;

    const interval = setInterval(() => {
      // Simulate status updates for demo purposes
      // In production, this would be replaced with actual WebSocket connection
    }, 30000);

    return () => clearInterval(interval);
  }, [request]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMaintenanceRequest(id);
      setRequest(data);
      setError(null);
    } catch (err) {
      setError('Failed to load request details. Please try again.');
      console.error('Error fetching request details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'plumbing':
        return 'fa-faucet';
      case 'electrical':
        return 'fa-bolt';
      case 'hvac':
        return 'fa-fan';
      case 'appliances':
        return 'fa-blender';
      default:
        return 'fa-tools';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleRatingSubmit = () => {
    setShowRating(false);
    fetchRequestDetails();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error || 'Request not found'}</span>
          <button
            onClick={() => navigate('/tenant-dashboard/maintenance')}
            className="ml-auto text-red-700 hover:text-red-900 font-medium"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

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
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span>{successMessage}</span>
            {location.state?.ticketNumber && (
              <span className="ml-2 font-mono font-semibold">
                {location.state.ticketNumber}
              </span>
            )}
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Request</h1>
            <p className="text-gray-600 mt-1">Ticket #{request.ticketNumber || `REQ-${request.id}`}</p>
          </div>
          <StatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Request Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className={`fas ${getCategoryIcon(request.category)} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {request.description}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <i className="fas fa-calendar"></i>
                  {new Date(request.createdAt || request.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-clock"></i>
                  {request.time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              <i className={`fas ${getCategoryIcon(request.category)}`}></i>
              {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(request.priority)}`}>
              <i className="fas fa-flag"></i>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        {request.statusHistory && request.statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-history"></i>
              Status Timeline
            </h3>
            <div className="space-y-4">
              {request.statusHistory.map((history, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <i className="fas fa-circle text-xs"></i>
                    </div>
                    {index < request.statusHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={history.status} size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{history.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Vendor */}
        {request.assignedVendor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-user-tie"></i>
              Assigned Vendor
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {typeof request.assignedVendor === 'string' 
                    ? request.assignedVendor 
                    : request.assignedVendor.name}
                </p>
                {typeof request.assignedVendor === 'object' && (
                  <>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <i className="fas fa-phone"></i>
                      {request.assignedVendor.phone}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <i className="fas fa-clock"></i> Estimated arrival: {request.assignedVendor.estimatedArrival}
                    </p>
                  </>
                )}
              </div>
              {typeof request.assignedVendor === 'object' && (
                <a
                  href={`tel:${request.assignedVendor.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-phone"></i>
                  Call Vendor
                </a>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-images"></i>
              Photos ({request.images.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {request.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating Section */}
        {request.status === 'completed' && !request.rating && !showRating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Rate This Service
                </h3>
                <p className="text-blue-800">
                  How was your experience with the maintenance service?
                </p>
              </div>
              <button
                onClick={() => setShowRating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <i className="fas fa-star"></i>
                Rate Service
              </button>
            </div>
          </div>
        )}

        {/* Rating Display */}
        {request.rating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              Your Rating
            </h3>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fas fa-star text-2xl ${
                    star <= request.rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                ></i>
              ))}
              <span className="text-lg font-semibold text-gray-900 ml-2">
                {request.rating} / 5
              </span>
            </div>
            {request.feedback && (
              <p className="text-gray-700 mt-3 p-4 bg-gray-50 rounded-lg">
                {request.feedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <VendorRating
          requestId={request.id}
          onClose={() => setShowRating(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default RequestDetails;

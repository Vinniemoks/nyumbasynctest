import { useState } from 'react';
import apiService from '../../../api/api';

const VendorRating = ({ requestId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiService.rateMaintenanceRequest(requestId, rating, feedback);

      // Call onSubmit callback
      if (onSubmit) {
        onSubmit();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select Rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Rate Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate the service? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <i
                    className={`fas fa-star text-5xl ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            <p className="text-center text-lg font-semibold text-gray-900">
              {getRatingLabel(hoveredRating || rating)}
            </p>
          </div>

          {/* Feedback Textarea */}
          <div className="mb-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Tell us more about your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Your feedback helps us improve our service
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
            <span>
              Your rating will help other tenants and improve service quality. 
              It will be shared with the property management team.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorRating;

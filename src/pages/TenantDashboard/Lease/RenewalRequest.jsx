import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import apiService from '../../../api/api';
import DigitalSignature from './DigitalSignature';

const RenewalRequest = () => {
  const navigate = useNavigate();
  const { lease, property, loading: tenantLoading } = useTenant();
  const [step, setStep] = useState(1); // 1: Request, 2: Terms Review, 3: Signature
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [renewalTerms, setRenewalTerms] = useState(null);
  const [renewalRequest, setRenewalRequest] = useState(null);
  
  const [formData, setFormData] = useState({
    message: '',
    preferredTerms: {
      duration: '12',
      moveInDate: ''
    }
  });

  useEffect(() => {
    // Check if there are already proposed terms
    if (lease?.id && step === 2) {
      fetchRenewalTerms();
    }
  }, [lease, step]);

  const fetchRenewalTerms = async () => {
    try {
      setLoading(true);
      const terms = await apiService.getRenewalTerms(lease.id);
      setRenewalTerms(terms);
    } catch (err) {
      setError('Failed to load renewal terms. Please try again.');
      console.error('Error fetching renewal terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferredTerms.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferredTerms: {
          ...prev.preferredTerms,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiService.requestLeaseRenewal({
        leaseId: lease.id,
        message: formData.message,
        preferredTerms: formData.preferredTerms
      });

      setRenewalRequest(response.renewalRequest);
      setSuccess(response.message);
      
      // Move to terms review step after a short delay
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit renewal request. Please try again.');
      console.error('Error submitting renewal request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = () => {
    setStep(3);
  };

  const handleDeclineTerms = async () => {
    if (!window.confirm('Are you sure you want to decline these renewal terms?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.declineRenewalTerms(renewalTerms.id, 'Terms not acceptable');
      setSuccess('Renewal terms declined. The property manager has been notified.');
      setTimeout(() => {
        navigate('/tenant-dashboard/lease');
      }, 2000);
    } catch (err) {
      setError('Failed to decline terms. Please try again.');
      console.error('Error declining terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.acceptRenewalTerms(renewalTerms.id, signatureData);
      
      setSuccess(response.message);
      
      // Redirect to lease info after success
      setTimeout(() => {
        navigate('/tenant-dashboard/lease');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to complete renewal. Please try again.');
      console.error('Error accepting renewal:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-triangle text-yellow-600 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Lease</h2>
          <p className="text-gray-600 mb-4">You need an active lease to request renewal.</p>
          <button
            onClick={() => navigate('/tenant-dashboard/lease')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Lease Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => step === 1 ? navigate('/tenant-dashboard/lease') : setStep(step - 1)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lease Renewal</h1>
        <p className="text-gray-600">Renew your lease and continue your tenancy</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step > 1 ? <i className="fas fa-check"></i> : '1'}
              </div>
              <div className="ml-3">
                <div className="font-semibold">Request</div>
                <div className="text-sm">Submit renewal request</div>
              </div>
            </div>
          </div>
          <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-300'} mx-4`}></div>
          <div className={`flex-1 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step > 2 ? <i className="fas fa-check"></i> : '2'}
              </div>
              <div className="ml-3">
                <div className="font-semibold">Review Terms</div>
                <div className="text-sm">Review proposed terms</div>
              </div>
            </div>
          </div>
          <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-blue-600' : 'border-gray-300'} mx-4`}></div>
          <div className={`flex-1 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <div className="ml-3">
                <div className="font-semibold">Sign</div>
                <div className="text-sm">Digital signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      {/* Step 1: Request Form */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Renewal Request</h2>
          
          {/* Current Lease Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Current Lease Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Property:</span>
                <span className="ml-2 font-medium">{property?.address}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Rent:</span>
                <span className="ml-2 font-medium">KES {lease.monthlyRent?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Lease End Date:</span>
                <span className="ml-2 font-medium">{formatDate(lease.endDate)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest}>
            {/* Preferred Duration */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Lease Duration
              </label>
              <select
                name="preferredTerms.duration"
                value={formData.preferredTerms.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>

            {/* Message to Property Manager */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message to Property Manager (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add any comments or special requests regarding your lease renewal..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will be sent to your property manager along with your renewal request.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/tenant-dashboard/lease')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Renewal Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Review Terms */}
      {step === 2 && renewalTerms && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Proposed Renewal Terms</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Please review the proposed terms carefully before proceeding to sign.
            </p>
          </div>

          {/* Key Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">New Monthly Rent</h3>
              <p className="text-2xl font-bold text-gray-800">KES {renewalTerms.proposedRent?.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                Previous: KES {lease.monthlyRent?.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lease Duration</h3>
              <p className="text-2xl font-bold text-gray-800">{renewalTerms.leaseDuration} Months</p>
              <p className="text-sm text-gray-600 mt-1">
                Start Date: {formatDate(renewalTerms.startDate)}
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Terms and Conditions</h3>
            <ul className="space-y-2">
              {renewalTerms.terms?.map((term, index) => (
                <li key={index} className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span className="text-gray-700">{term}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Notes */}
          {renewalTerms.additionalNotes && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Additional Notes</h3>
              <p className="text-gray-700">{renewalTerms.additionalNotes}</p>
            </div>
          )}

          {/* Expiration Notice */}
          {renewalTerms.expiresAt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <i className="fas fa-clock mr-2"></i>
                This offer expires on {formatDate(renewalTerms.expiresAt)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDeclineTerms}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-300"
            >
              <i className="fas fa-times mr-2"></i>
              Decline Terms
            </button>
            <button
              onClick={handleAcceptTerms}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-300"
            >
              <i className="fas fa-check mr-2"></i>
              Accept & Sign
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Digital Signature */}
      {step === 3 && renewalTerms && (
        <DigitalSignature
          renewalTerms={renewalTerms}
          onComplete={handleSignatureComplete}
          onCancel={() => setStep(2)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default RenewalRequest;

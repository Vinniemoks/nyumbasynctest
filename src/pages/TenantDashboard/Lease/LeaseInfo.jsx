import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';

const LeaseInfo = () => {
  const navigate = useNavigate();
  const { lease, property, loading } = useTenant();
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showRenewalReminder, setShowRenewalReminder] = useState(false);

  useEffect(() => {
    if (lease?.endDate) {
      calculateDaysRemaining();
    }
  }, [lease]);

  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(lease.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(diffDays);
    
    if (diffDays <= 90 && diffDays > 0) {
      setShowRenewalReminder(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLeaseStatus = () => {
    if (daysRemaining < 0) {
      return { text: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (daysRemaining <= 30) {
      return { text: 'Expiring Soon', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (daysRemaining <= 90) {
      return { text: 'Active - Renewal Available', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { text: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  if (loading) {
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
          <p className="text-gray-600">No lease information is currently available.</p>
        </div>
      </div>
    );
  }

  const status = getLeaseStatus();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lease Information</h1>
        <p className="text-gray-600">View your current lease details and renewal options</p>
      </div>

      {showRenewalReminder && daysRemaining > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-500 text-xl mt-1 mr-3"></i>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Lease Renewal Available</h3>
              <p className="text-blue-800 mb-3">
                Your lease expires in {daysRemaining} days. Consider renewing your lease to continue your tenancy without interruption.
              </p>
              <button
                onClick={() => navigate('/tenant-dashboard/lease/renew')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-file-signature mr-2"></i>
                Start Renewal Process
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Lease Status</h2>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${status.bgColor} ${status.color}`}>
            {status.text}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {daysRemaining > 0 ? daysRemaining : 0}
            </div>
            <div className="text-sm text-gray-600">
              {daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {lease.startDate && lease.endDate ? 
                Math.round((new Date(lease.endDate) - new Date(lease.startDate)) / (1000 * 60 * 60 * 24 * 30)) : 0}
            </div>
            <div className="text-sm text-gray-600">Months Total</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              KES {lease.monthlyRent?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Monthly Rent</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lease Details</h2>
        
        <div className="space-y-4">
          {property && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Property</h3>
              <p className="text-gray-800 font-medium">{property.address}</p>
              {property.unitNumber && (
                <p className="text-gray-600">Unit {property.unitNumber}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                <i className="fas fa-calendar-check mr-2"></i>Start Date
              </h3>
              <p className="text-gray-800 font-medium">{formatDate(lease.startDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                <i className="fas fa-calendar-times mr-2"></i>End Date
              </h3>
              <p className="text-gray-800 font-medium">{formatDate(lease.endDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                <i className="fas fa-money-bill-wave mr-2"></i>Monthly Rent
              </h3>
              <p className="text-gray-800 font-medium">KES {lease.monthlyRent?.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                <i className="fas fa-shield-alt mr-2"></i>Security Deposit
              </h3>
              <p className="text-gray-800 font-medium">KES {lease.securityDeposit?.toLocaleString()}</p>
            </div>
          </div>

          {lease.renewalStatus && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                <i className="fas fa-sync-alt mr-2"></i>Renewal Status
              </h3>
              <p className="text-gray-800 font-medium capitalize">{lease.renewalStatus}</p>
            </div>
          )}
        </div>
      </div>

      {lease.documentUrl && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lease Agreement</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-file-pdf text-red-600 text-3xl mr-4"></i>
              <div>
                <p className="font-medium text-gray-800">Lease Agreement.pdf</p>
                <p className="text-sm text-gray-600">Signed on {formatDate(lease.startDate)}</p>
              </div>
            </div>
            <a
              href={lease.documentUrl}
              download
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-download mr-2"></i>
              Download
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {daysRemaining > 0 && daysRemaining <= 90 && (
          <button
            onClick={() => navigate('/tenant-dashboard/lease/renew')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <i className="fas fa-file-signature mr-2"></i>
            Request Lease Renewal
          </button>
        )}
        <button
          onClick={() => navigate('/tenant-dashboard/messages')}
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <i className="fas fa-envelope mr-2"></i>
          Contact Property Manager
        </button>
      </div>
    </div>
  );
};

export default LeaseInfo;

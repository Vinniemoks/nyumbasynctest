import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUtilityBill(id);
      setBill(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bill details:', err);
      setError('Failed to load bill details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUtilityIcon = (type) => {
    const icons = {
      water: 'fas fa-tint',
      electricity: 'fas fa-bolt',
      internet: 'fas fa-wifi',
      gas: 'fas fa-fire'
    };
    return icons[type] || 'fas fa-file-invoice-dollar';
  };

  const getUtilityColor = (type) => {
    const colors = {
      water: 'blue',
      electricity: 'yellow',
      internet: 'purple',
      gas: 'orange'
    };
    return colors[type] || 'gray';
  };

  const handlePayBill = () => {
    navigate('/tenant-dashboard/rent', { state: { utilityBillId: bill.id } });
  };

  const handleSplitCost = () => {
    navigate('/tenant-dashboard/utilities/split', { state: { billId: bill.id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 mb-4">{error || 'Bill not found'}</p>
          <button
            onClick={() => navigate('/tenant-dashboard/utilities')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Utilities
          </button>
        </div>
      </div>
    );
  }

  const billingPeriodStart = formatDate(bill.billingPeriod.startDate);
  const billingPeriodEnd = formatDate(bill.billingPeriod.endDate);
  const usageChange = bill.previousUsage ? ((bill.usage - bill.previousUsage) / bill.previousUsage * 100).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/utilities')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Utilities
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Bill Details</h1>
      </div>

      {/* Bill Header Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-${getUtilityColor(bill.utilityType)}-100 flex items-center justify-center`}>
              <i className={`${getUtilityIcon(bill.utilityType)} text-${getUtilityColor(bill.utilityType)}-600 text-2xl`}></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{bill.utilityType}</h2>
              <p className="text-gray-600">Bill #{bill.id}</p>
            </div>
          </div>
          <StatusBadge status={bill.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Due Date</p>
            <p className="text-xl font-semibold text-gray-900">{formatDate(bill.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-xl font-semibold text-gray-900 capitalize">{bill.status}</p>
            {bill.paidDate && (
              <p className="text-sm text-gray-500">Paid on {formatDate(bill.paidDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Period */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Period</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-lg font-medium text-gray-900">{billingPeriodStart}</p>
          </div>
          <i className="fas fa-arrow-right text-gray-400"></i>
          <div>
            <p className="text-sm text-gray-600">End Date</p>
            <p className="text-lg font-medium text-gray-900">{billingPeriodEnd}</p>
          </div>
        </div>
      </div>

      {/* Usage Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Current Usage</p>
              <i className="fas fa-tachometer-alt text-blue-600"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {bill.usage} <span className="text-lg text-gray-600">{bill.usageUnit}</span>
            </p>
          </div>

          {bill.previousUsage && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Previous Month</p>
                <i className="fas fa-history text-gray-600"></i>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {bill.previousUsage} <span className="text-lg text-gray-600">{bill.usageUnit}</span>
              </p>
            </div>
          )}
        </div>

        {bill.previousUsage && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Usage Comparison</span>
              <span className={`font-semibold ${usageChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                <i className={`fas fa-arrow-${usageChange >= 0 ? 'up' : 'down'} mr-1`}></i>
                {Math.abs(usageChange)}% {usageChange >= 0 ? 'increase' : 'decrease'}
              </span>
            </div>
            {usageChange >= 20 && (
              <p className="text-sm text-yellow-700 mt-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                High usage increase detected. Consider reviewing your consumption.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-700">Base Charge</span>
            <span className="font-semibold text-gray-900">{formatCurrency(bill.amount * 0.3)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-700">Usage Charge ({bill.usage} {bill.usageUnit})</span>
            <span className="font-semibold text-gray-900">{formatCurrency(bill.amount * 0.7)}</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(bill.amount)}</span>
          </div>
        </div>

        {bill.splitWith && bill.splitWith.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <i className="fas fa-users mr-2"></i>
              Split with {bill.splitWith.length} roommate{bill.splitWith.length > 1 ? 's' : ''}
            </p>
            <p className="text-lg font-bold text-green-700">
              Your share: {formatCurrency(bill.amount / (bill.splitWith.length + 1))}
            </p>
          </div>
        )}
      </div>

      {/* Payment Information */}
      {bill.status === 'paid' && bill.paidDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <i className="fas fa-check-circle text-green-600 text-2xl mr-3"></i>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Confirmed</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Payment Date</p>
                  <p className="font-semibold text-green-900">{formatDate(bill.paidDate)}</p>
                </div>
                {bill.paymentMethod && (
                  <div>
                    <p className="text-green-700">Payment Method</p>
                    <p className="font-semibold text-green-900 capitalize">{bill.paymentMethod}</p>
                  </div>
                )}
                {bill.transactionReference && (
                  <div>
                    <p className="text-green-700">Transaction Reference</p>
                    <p className="font-semibold text-green-900">{bill.transactionReference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {bill.status !== 'paid' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePayBill}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <i className="fas fa-credit-card mr-2"></i>
            Pay Bill
          </button>
          <button
            onClick={handleSplitCost}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <i className="fas fa-users mr-2"></i>
            Split with Roommates
          </button>
        </div>
      )}
    </div>
  );
};

export default BillDetails;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';

const UtilityDashboard = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageAlert, setUsageAlert] = useState(null);

  useEffect(() => {
    fetchUtilityBills();
  }, []);

  const fetchUtilityBills = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUtilityBills();
      setBills(data);
      
      // Check for usage alerts (20%+ increase)
      const alert = data.find(bill => bill.usageIncrease && bill.usageIncrease >= 20);
      if (alert) {
        setUsageAlert(alert);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching utility bills:', err);
      setError('Failed to load utility bills. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePayBill = async (billId) => {
    try {
      // Navigate to payment page or open payment modal
      navigate(`/tenant-dashboard/rent`, { state: { utilityBillId: billId } });
    } catch (err) {
      console.error('Error initiating payment:', err);
    }
  };

  const handleViewDetails = (billId) => {
    navigate(`/tenant-dashboard/utilities/${billId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading utility bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchUtilityBills}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.billingPeriod.endDate);
    const now = new Date();
    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
  });

  const totalCurrentBills = currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = currentMonthBills.filter(bill => bill.status === 'pending' || bill.status === 'overdue');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Utility Management</h1>
        <p className="text-gray-600">Track and manage your utility bills</p>
      </div>

      {/* Usage Alert */}
      {usageAlert && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-400 text-xl mr-3 mt-1"></i>
            <div>
              <h3 className="text-yellow-800 font-semibold mb-1">High Usage Alert</h3>
              <p className="text-yellow-700">
                Your {usageAlert.utilityType} usage has increased by {usageAlert.usageIncrease}% 
                compared to last month. Consider reviewing your consumption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total This Month</h3>
            <i className="fas fa-file-invoice-dollar text-blue-600 text-xl"></i>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalCurrentBills)}</p>
          <p className="text-sm text-gray-500 mt-1">{currentMonthBills.length} bills</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Unpaid Bills</h3>
            <i className="fas fa-exclamation-circle text-orange-600 text-xl"></i>
          </div>
          <p className="text-3xl font-bold text-gray-900">{unpaidBills.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(unpaidBills.reduce((sum, bill) => sum + bill.amount, 0))}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Next Due Date</h3>
            <i className="fas fa-calendar-alt text-green-600 text-xl"></i>
          </div>
          {unpaidBills.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-gray-900">
                {getDaysUntilDue(unpaidBills[0].dueDate)} days
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(unpaidBills[0].dueDate)}
              </p>
            </>
          ) : (
            <p className="text-lg text-gray-500">All bills paid</p>
          )}
        </div>
      </div>

      {/* Current Month Bills */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Current Month Bills</h2>
        </div>

        {currentMonthBills.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-file-invoice text-gray-300 text-6xl mb-4"></i>
            <p className="text-gray-500 text-lg">No utility bills for this month</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentMonthBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

              return (
                <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full bg-${getUtilityColor(bill.utilityType)}-100 flex items-center justify-center`}>
                        <i className={`${getUtilityIcon(bill.utilityType)} text-${getUtilityColor(bill.utilityType)}-600 text-xl`}></i>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {bill.utilityType}
                          </h3>
                          <StatusBadge status={bill.status} />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-tachometer-alt mr-1"></i>
                            {bill.usage} {bill.usageUnit}
                          </span>
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            Due: {formatDate(bill.dueDate)}
                          </span>
                          {bill.usageIncrease && bill.usageIncrease > 0 && (
                            <span className={bill.usageIncrease >= 20 ? 'text-red-600' : 'text-yellow-600'}>
                              <i className="fas fa-arrow-up mr-1"></i>
                              +{bill.usageIncrease}% vs last month
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(bill.amount)}
                        </p>
                        {(isOverdue || isDueSoon) && (
                          <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-yellow-600'} font-medium`}>
                            {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `Due in ${daysUntilDue} days`}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewDetails(bill.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View Details
                        </button>
                        
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => handlePayBill(bill.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <i className="fas fa-credit-card mr-2"></i>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roommate Split Info */}
                  {bill.splitWith && bill.splitWith.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-users mr-2"></i>
                        Split with {bill.splitWith.length} roommate{bill.splitWith.length > 1 ? 's' : ''}
                        <span className="ml-2 font-semibold">
                          Your share: {formatCurrency(bill.amount / (bill.splitWith.length + 1))}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/tenant-dashboard/utilities/trends')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Trends</h3>
              <p className="text-gray-600">View your consumption patterns over time</p>
            </div>
            <i className="fas fa-chart-line text-blue-600 text-3xl"></i>
          </div>
        </button>

        <button
          onClick={() => navigate('/tenant-dashboard/utilities/split')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Split Costs</h3>
              <p className="text-gray-600">Divide utility bills with roommates</p>
            </div>
            <i className="fas fa-users text-green-600 text-3xl"></i>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UtilityDashboard;

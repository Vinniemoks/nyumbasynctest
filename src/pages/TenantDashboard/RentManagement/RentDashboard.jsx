import { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import RentAnalytics from './RentAnalytics';
import AutopaySettings from './AutopaySettings';
import InteractiveRentDashboard from './InteractiveRentDashboard';
import ReceiptViewer from './ReceiptViewer';
import apiService from '../../../api/api';

const RentDashboard = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentData, setRentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentData();
  }, []);

  const fetchRentData = async () => {
    try {
      setLoading(true);
      // Fetch current rent status
      const response = await apiService.get('/tenant/rent/current');
      setRentData(response);
    } catch (error) {
      console.error('Error fetching rent data:', error);
      // Use mock data as fallback
      setRentData({
        amount: 50000,
        dueDate: '2025-11-05',
        status: 'due', // 'paid', 'due', 'overdue'
        propertyId: '1',
        lastPaymentDate: '2025-10-05',
        autopayEnabled: false,
        nextAutopayDate: null,
        nextAutopayAmount: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilDue = () => {
    if (!rentData) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(rentData.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  const calculateDaysLate = () => {
    const daysUntilDue = calculateDaysUntilDue();
    return daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;
  };

  const handlePaymentSuccess = (payment) => {
    console.log('Payment successful:', payment);
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    
    // Refresh rent data
    fetchRentData();
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 5000);
  };

  const handleDownloadReceipt = async () => {
    try {
      // Fetch the most recent payment
      const response = await apiService.get('/tenant/rent/history');
      if (response && response.length > 0) {
        setSelectedPayment(response[0]);
        setShowReceipt(true);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      // Use mock data
      setSelectedPayment({
        id: 1,
        amount: rentData.amount,
        paymentDate: rentData.lastPaymentDate,
        dueDate: rentData.dueDate,
        paymentMethod: 'mpesa',
        transactionReference: `TXN-${Date.now()}`,
        status: 'completed',
      });
      setShowReceipt(true);
    }
  };

  const getStatusColor = () => {
    if (!rentData) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rentData.status === 'paid') return 'bg-green-100 text-green-800 border-green-200';
    if (rentData.status === 'overdue') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (!rentData) return <Clock className="w-5 h-5" />;
    if (rentData.status === 'paid') return <CheckCircle className="w-5 h-5" />;
    if (rentData.status === 'overdue') return <AlertCircle className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!rentData) return 'Loading...';
    const daysUntilDue = calculateDaysUntilDue();
    const daysLate = calculateDaysLate();
    
    if (rentData.status === 'paid') return 'Paid';
    if (rentData.status === 'overdue') return `Overdue by ${daysLate} day${daysLate !== 1 ? 's' : ''}`;
    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue === 1) return 'Due Tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const shouldShowRentReminder = () => {
    if (!rentData || rentData.status === 'paid') return false;
    const daysUntilDue = calculateDaysUntilDue();
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showPaymentForm) {
    return (
      <PaymentForm
        amount={rentData.amount}
        dueDate={rentData.dueDate}
        propertyId={rentData.propertyId}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentForm(false)}
      />
    );
  }

  if (showReceipt && selectedPayment) {
    return (
      <ReceiptViewer
        payment={selectedPayment}
        onClose={() => {
          setShowReceipt(false);
          setSelectedPayment(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Rent Management</h2>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 -mx-3 px-3 sm:mx-0 sm:px-0">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors touch-manipulation`}
            style={{ minHeight: '44px' }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors touch-manipulation`}
            style={{ minHeight: '44px' }}
          >
            <span className="hidden sm:inline">Payment History</span>
            <span className="sm:hidden">History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors touch-manipulation`}
            style={{ minHeight: '44px' }}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('autopay')}
            className={`${
              activeTab === 'autopay'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors touch-manipulation`}
            style={{ minHeight: '44px' }}
          >
            Autopay
          </button>
        </nav>
      </div>

      {/* Success Message */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-green-800">Payment Successful!</h3>
              <p className="text-xs sm:text-sm text-green-700 mt-1">
                Your rent payment has been processed successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rent Reminder */}
      {shouldShowRentReminder() && activeTab === 'overview' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-2 sm:gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-yellow-800">Rent Payment Reminder</h3>
                <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                  Your rent is due {getStatusText().toLowerCase()}. Don't forget to make your payment to avoid late fees.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 active:bg-yellow-800 transition-colors text-sm font-medium touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Interactive Rent Dashboard */}
          <InteractiveRentDashboard
            onPayRent={() => setShowPaymentForm(true)}
            onViewHistory={() => setActiveTab('history')}
            onDownloadReceipt={handleDownloadReceipt}
          />

          {/* Rent Status Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Current Rent Status</h3>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Monthly Rent</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    KES {rentData.amount.toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border ${getStatusColor()} self-start sm:self-auto`}>
                  {getStatusIcon()}
                  <span className="font-semibold text-sm sm:text-base">{getStatusText()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Due Date</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(rentData.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">
                      {rentData.status === 'overdue' ? 'Days Late' : 'Days Until Due'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {rentData.status === 'overdue' 
                      ? `${calculateDaysLate()} day${calculateDaysLate() !== 1 ? 's' : ''}`
                      : rentData.status === 'paid'
                      ? 'Paid'
                      : `${calculateDaysUntilDue()} day${calculateDaysUntilDue() !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Last Payment</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {rentData.lastPaymentDate 
                      ? new Date(rentData.lastPaymentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {rentData.status !== 'paid' && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Pay Rent Now
                </button>
              )}
            </div>
          </div>

          {/* Autopay Status */}
          {rentData.autopayEnabled && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Autopay Enabled</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Next payment: {new Date(rentData.nextAutopayDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })} - KES {rentData.nextAutopayAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('autopay')}
                  className="w-full sm:w-auto px-4 py-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors text-sm font-medium touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Manage
                </button>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Payment Methods Available</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-200">
                📱 M-Pesa
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-200">
                📱 Airtel Money
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-200">
                📱 Telkom Money
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-200">
                💳 Card
              </span>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && <PaymentHistory />}
      {activeTab === 'analytics' && <RentAnalytics />}
      {activeTab === 'autopay' && <AutopaySettings rentData={rentData} onUpdate={fetchRentData} />}
    </div>
  );
};

export default RentDashboard;

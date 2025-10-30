import { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, Trash2, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';
import apiService from '../../../api/api';
import scheduledPaymentProcessor from '../../../services/scheduledPaymentProcessor';

const ScheduledPayments = ({ rentData, onUpdate }) => {
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Form state
  const [scheduleDate, setScheduleDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    fetchScheduledPayments();
    
    // Start monitoring scheduled payments
    scheduledPaymentProcessor.startMonitoring(60); // Check every 60 minutes
    
    return () => {
      scheduledPaymentProcessor.stopMonitoring();
    };
  }, []);

  const fetchScheduledPayments = async () => {
    try {
      const payments = await apiService.get('/tenant/rent/scheduled-payments');
      setScheduledPayments(payments || []);
    } catch (error) {
      console.error('Error fetching scheduled payments:', error);
      setScheduledPayments([]);
    }
  };

  const getMaxScheduleDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const getMinScheduleDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const handleSchedulePayment = async (e) => {
    e.preventDefault();
    
    if (!scheduleDate || !paymentMethod) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (['mpesa', 'airtel', 'telkom'].includes(paymentMethod) && !phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter your phone number.' });
      return;
    }

    try {
      setLoading(true);
      const paymentData = {
        scheduledDate: scheduleDate,
        amount: rentData?.amount || 50000,
        paymentMethod,
        phoneNumber: ['mpesa', 'airtel', 'telkom'].includes(paymentMethod) ? phoneNumber : null,
        propertyId: rentData?.propertyId || '1'
      };

      await apiService.post('/tenant/rent/schedule-payment', paymentData);
      setMessage({ type: 'success', text: 'Payment scheduled successfully!' });
      setShowScheduleForm(false);
      
      // Reset form
      setScheduleDate('');
      setPaymentMethod('');
      setPhoneNumber('');
      
      // Refresh list
      fetchScheduledPayments();
      if (onUpdate) onUpdate();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error scheduling payment:', error);
      setMessage({ type: 'error', text: 'Failed to schedule payment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduledPayment = async (paymentId) => {
    if (!confirm('Are you sure you want to cancel this scheduled payment?')) {
      return;
    }

    try {
      await apiService.delete(`/tenant/rent/scheduled-payments/${paymentId}`);
      setMessage({ type: 'success', text: 'Scheduled payment cancelled successfully.' });
      fetchScheduledPayments();
      if (onUpdate) onUpdate();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error cancelling scheduled payment:', error);
      setMessage({ type: 'error', text: 'Failed to cancel scheduled payment. Please try again.' });
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      mpesa: 'M-Pesa',
      airtel: 'Airtel Money',
      telkom: 'Telkom Money',
      card: 'Credit/Debit Card'
    };
    return labels[method] || method;
  };

  const getDaysUntilPayment = (scheduledDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(scheduledDate);
    paymentDate.setHours(0, 0, 0, 0);
    const days = Math.ceil((paymentDate - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Payments</h3>
          <p className="text-sm text-gray-600 mt-1">Schedule rent payments up to 3 months in advance</p>
        </div>
        {!showScheduleForm && (
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Schedule Payment
          </button>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Schedule Form */}
      {showScheduleForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Schedule New Payment</h4>
            <button
              onClick={() => setShowScheduleForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSchedulePayment} className="space-y-6">
            {/* Payment Date */}
            <div>
              <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                id="scheduleDate"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={getMinScheduleDate()}
                max={getMaxScheduleDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                You can schedule payments up to 3 months in advance
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'mpesa', label: 'M-Pesa', icon: '📱' },
                  { value: 'airtel', label: 'Airtel Money', icon: '📱' },
                  { value: 'telkom', label: 'Telkom Money', icon: '📱' },
                  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-gray-900">{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number (for mobile money) */}
            {['mpesa', 'airtel', 'telkom'].includes(paymentMethod) && (
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., 0712345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Payment Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Amount</span>
                <span className="text-lg font-semibold text-gray-900">
                  KES {(rentData?.amount || 50000).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Reminder</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll receive a reminder notification 24 hours before the scheduled payment is processed.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scheduled Payments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Upcoming Scheduled Payments</h4>
        </div>

        {scheduledPayments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No scheduled payments</p>
            <p className="text-sm text-gray-500">
              Schedule payments in advance to never miss a due date
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {scheduledPayments.map((payment) => {
              const daysUntil = getDaysUntilPayment(payment.scheduledDate);
              return (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          KES {payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(payment.scheduledDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            daysUntil <= 1 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelScheduledPayment(payment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel scheduled payment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledPayments;

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, CreditCard, AlertCircle, Info, Bell, Clock } from 'lucide-react';
import apiService from '../../../api/api';
import notificationService from '../../../services/notificationService';
import ReminderSettings from './ReminderSettings';
import ScheduledPayments from './ScheduledPayments';

const AutopaySettings = ({ rentData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('autopay');
  const [autopayEnabled, setAutopayEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (rentData) {
      setAutopayEnabled(rentData.autopayEnabled || false);
      setPaymentMethod(rentData.autopayMethod || '');
      setPaymentDate(rentData.autopayDate || '1');
      setPhoneNumber(rentData.autopayPhone || '');
    }
  }, [rentData]);

  const handleToggleAutopay = async () => {
    if (autopayEnabled) {
      // Disable autopay
      try {
        setLoading(true);
        await apiService.delete('/tenant/rent/autopay');
        setAutopayEnabled(false);
        setMessage({ type: 'success', text: 'Autopay has been disabled successfully.' });
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error disabling autopay:', error);
        setMessage({ type: 'error', text: 'Failed to disable autopay. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveAutopay = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      setMessage({ type: 'error', text: 'Please select a payment method.' });
      return;
    }

    if (['mpesa', 'airtel', 'telkom'].includes(paymentMethod) && !phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter your phone number.' });
      return;
    }

    try {
      setLoading(true);
      const autopayData = {
        enabled: true,
        paymentMethod,
        paymentDate: parseInt(paymentDate),
        phoneNumber: ['mpesa', 'airtel', 'telkom'].includes(paymentMethod) ? phoneNumber : null,
      };

      await apiService.post('/tenant/rent/autopay', autopayData);
      setAutopayEnabled(true);
      setMessage({ type: 'success', text: 'Autopay has been enabled successfully!' });
      
      // Calculate next payment date
      const today = new Date();
      const selectedDate = parseInt(paymentDate);
      let nextPaymentDate;
      if (today.getDate() < selectedDate) {
        nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), selectedDate);
      } else {
        nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, selectedDate);
      }
      
      // Send confirmation notification (simulating 3 days before)
      const daysUntilPayment = Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment <= 3) {
        await notificationService.sendAutopayConfirmation({
          amount: rentData?.amount || 50000,
          nextPaymentDate: nextPaymentDate.toISOString(),
          paymentMethod
        });
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error enabling autopay:', error);
      setMessage({ type: 'error', text: 'Failed to enable autopay. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getNextPaymentDate = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const selectedDate = parseInt(paymentDate);
    
    let nextPaymentDate;
    if (today.getDate() < selectedDate) {
      nextPaymentDate = new Date(currentYear, currentMonth, selectedDate);
    } else {
      nextPaymentDate = new Date(currentYear, currentMonth + 1, selectedDate);
    }
    
    return nextPaymentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('autopay')}
            className={`${
              activeTab === 'autopay'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <CreditCard className="w-4 h-4" />
            Autopay
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`${
              activeTab === 'reminders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <Bell className="w-4 h-4" />
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`${
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <Clock className="w-4 h-4" />
            Scheduled Payments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'autopay' && (
        <>
          {/* Status Card */}
      <div className={`rounded-lg shadow-md overflow-hidden ${
        autopayEnabled ? 'bg-green-50 border-2 border-green-200' : 'bg-white'
      }`}>
        <div className={`px-6 py-4 ${
          autopayEnabled ? 'bg-green-600' : 'bg-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              autopayEnabled ? 'text-white' : 'text-gray-900'
            }`}>
              Autopay Status
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              autopayEnabled 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {autopayEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {autopayEnabled ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-gray-700">Next Payment Date</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {rentData?.nextAutopayDate 
                      ? new Date(rentData.nextAutopayDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : getNextPaymentDate()
                    }
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-gray-700">Payment Amount</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    KES {(rentData?.nextAutopayAmount || rentData?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Autopay Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your rent will be automatically charged on the {paymentDate}
                      {paymentDate === '1' ? 'st' : paymentDate === '2' ? 'nd' : paymentDate === '3' ? 'rd' : 'th'} of each month.
                      You'll receive a confirmation notification 3 days before each payment.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleAutopay}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Disable Autopay'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Autopay Not Enabled</h4>
              <p className="text-gray-600 mb-6">
                Set up automatic rent payments to never miss a due date.
              </p>
            </div>
          )}
        </div>
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

      {/* Setup Form */}
      {!autopayEnabled && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Set Up Autopay</h3>
          
          <form onSubmit={handleSaveAutopay} className="space-y-6">
            {/* Payment Method Selection */}
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

            {/* Payment Date Selection */}
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date (Day of Month)
              </label>
              <select
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map((day) => (
                  <option key={day} value={day}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Next payment will be on: {getNextPaymentDate()}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900">Important Information</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                    <li>You'll receive a notification 3 days before each payment</li>
                    <li>Ensure sufficient funds are available on the payment date</li>
                    <li>You can disable autopay at any time</li>
                    <li>Failed payments will trigger an alert notification</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting Up...' : 'Enable Autopay'}
            </button>
          </form>
        </div>
      )}
        </>
      )}

      {activeTab === 'reminders' && (
        <ReminderSettings onUpdate={onUpdate} />
      )}

      {activeTab === 'scheduled' && (
        <ScheduledPayments rentData={rentData} onUpdate={onUpdate} />
      )}
    </div>
  );
};

export default AutopaySettings;

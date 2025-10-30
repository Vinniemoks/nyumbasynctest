import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import STKPushModal from '../../../components/shared/STKPushModal';
import CardPaymentForm from '../../../components/shared/CardPaymentForm';
import ReceiptViewer from './ReceiptViewer';
import { paymentService } from '../../../services/paymentService';

const PaymentForm = ({ amount, dueDate, propertyId, onSuccess, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showSTKModal, setShowSTKModal] = useState(false);
  const [stkStatus, setSTKStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
    setShowCardForm(method === 'card');
  };

  const handlePhoneNumberChange = (phone) => {
    setPhoneNumber(phone);
  };

  const validatePhoneNumber = (phone) => {
    // Basic Kenyan phone number validation
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone) => {
    // Convert to international format
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }
    return formatted;
  };

  const handleMobileMoneyPayment = async () => {
    setError(null);

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError({
        title: 'Invalid Phone Number',
        message: 'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)',
        type: 'validation',
      });
      return;
    }

    setIsProcessing(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const accountReference = `RENT-${propertyId}-${Date.now()}`;

    try {
      let response;
      
      switch (selectedMethod) {
        case 'mpesa':
          response = await paymentService.initiateMpesaPayment(formattedPhone, amount, accountReference);
          break;
        case 'airtel':
          response = await paymentService.initiateAirtelPayment(formattedPhone, amount, accountReference);
          break;
        case 'telkom':
          response = await paymentService.initiateTelkomPayment(formattedPhone, amount, accountReference);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (response.success) {
        setTransactionId(response.transactionId);
        setSTKStatus('pending');
        setShowSTKModal(true);
        
        // Poll for payment status
        pollPaymentStatus(response.transactionId);
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError({
        title: 'Payment Initiation Failed',
        message: err.message || 'Unable to initiate payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (txnId) => {
    try {
      const result = await paymentService.pollPaymentStatus(txnId, 60, 1000);
      
      setSTKStatus(result.status);
      
      if (result.status === 'success') {
        // Create payment record
        const payment = {
          id: txnId,
          transactionId: txnId,
          amount: amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: selectedMethod,
          transactionReference: txnId,
          status: 'completed',
          propertyId: propertyId,
        };
        
        setCompletedPayment(payment);
        
        // Notify parent component
        if (onSuccess) {
          onSuccess(payment);
        }
      } else if (result.status === 'failed') {
        setError({
          title: 'Payment Failed',
          message: result.message || 'The payment could not be completed. Please try again.',
          type: 'error',
        });
      } else if (result.status === 'timeout') {
        setError({
          title: 'Payment Timeout',
          message: 'The payment request has expired. Please try again.',
          type: 'timeout',
        });
      }
    } catch (err) {
      console.error('Payment status polling error:', err);
      setSTKStatus('failed');
      setError({
        title: 'Payment Status Check Failed',
        message: 'Unable to verify payment status. Please contact support if amount was deducted.',
        type: 'error',
      });
    }
  };

  const handleCardPayment = async (cardToken, cardDetails) => {
    setError(null);
    setIsProcessing(true);

    try {
      const accountReference = `RENT-${propertyId}-${Date.now()}`;
      const response = await paymentService.processCardPayment(cardToken, amount, accountReference);

      if (response.success) {
        const payment = {
          id: response.transactionId,
          transactionId: response.transactionId,
          amount: amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'card',
          transactionReference: response.transactionId,
          status: 'completed',
          propertyId: propertyId,
        };
        
        setCompletedPayment(payment);
        setShowReceipt(true);
        
        if (onSuccess) {
          onSuccess(payment);
        }
      } else {
        throw new Error(response.message || 'Card payment failed');
      }
    } catch (err) {
      console.error('Card payment error:', err);
      setError({
        title: 'Card Payment Failed',
        message: err.message || 'Unable to process card payment. Please check your card details and try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowSTKModal(false);
    setSTKStatus('pending');
    setTransactionId('');
    
    if (selectedMethod === 'card') {
      setShowCardForm(true);
    }
  };

  const handleSTKModalClose = () => {
    setShowSTKModal(false);
    
    if (stkStatus === 'success' && completedPayment) {
      setShowReceipt(true);
    }
  };

  const handleProceed = () => {
    if (!selectedMethod) {
      setError({
        title: 'No Payment Method Selected',
        message: 'Please select a payment method to continue.',
        type: 'validation',
      });
      return;
    }

    if (selectedMethod === 'card') {
      setShowCardForm(true);
    } else {
      handleMobileMoneyPayment();
    }
  };

  if (showReceipt && completedPayment) {
    return <ReceiptViewer payment={completedPayment} onClose={() => setShowReceipt(false)} />;
  }

  if (showCardForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Payment</h2>
          <CardPaymentForm
            amount={amount}
            onSubmit={handleCardPayment}
            onCancel={() => setShowCardForm(false)}
            isProcessing={isProcessing}
          />
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">{error.title}</h3>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pay Rent</h1>

        {/* Payment Summary */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" aria-label="Payment summary">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Amount Due</p>
              <p className="text-3xl font-bold text-gray-900" aria-label={`Amount due: ${amount} Kenyan Shillings`}>
                KES {amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(dueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div 
            className={`mb-6 border rounded-lg p-4 ${
              error.type === 'validation' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex">
              <AlertCircle 
                className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  error.type === 'validation' ? 'text-yellow-600' : 'text-red-600'
                }`}
                aria-hidden="true"
              />
              <div className="flex-1">
                <h2 className={`text-sm font-semibold ${
                  error.type === 'validation' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {error.title}
                </h2>
                <p className={`text-sm mt-1 ${
                  error.type === 'validation' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {error.message}
                </p>
                {error.type !== 'validation' && (
                  <button
                    onClick={handleRetry}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                    aria-label="Retry payment"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selector */}
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={handlePhoneNumberChange}
        />

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3" role="group" aria-label="Payment actions">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Cancel payment"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!selectedMethod || isProcessing}
            className="flex-1 px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label={isProcessing ? 'Processing payment' : `Proceed to pay ${amount} Kenyan Shillings`}
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              `Proceed to Pay KES ${amount.toLocaleString()}`
            )}
          </button>
        </div>
      </div>

      {/* STK Push Modal */}
      <STKPushModal
        isOpen={showSTKModal}
        onClose={handleSTKModalClose}
        paymentMethod={selectedMethod}
        phoneNumber={phoneNumber}
        amount={amount}
        transactionId={transactionId}
        status={stkStatus}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default PaymentForm;

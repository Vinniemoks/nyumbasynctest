import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Smartphone } from 'lucide-react';

const STKPushModal = ({ 
  isOpen, 
  onClose, 
  paymentMethod, 
  phoneNumber, 
  amount, 
  transactionId,
  status,
  onRetry 
}) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isOpen && status === 'pending') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, status]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getMethodName = () => {
    switch (paymentMethod) {
      case 'mpesa':
        return 'M-Pesa';
      case 'airtel':
        return 'Airtel Money';
      case 'telkom':
        return 'Telkom Money';
      default:
        return 'Mobile Money';
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />,
          title: 'Waiting for Payment',
          message: `Check your phone (${phoneNumber}) and enter your ${getMethodName()} PIN to complete the payment.`,
          bgColor: 'bg-blue-50',
          showCountdown: true,
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful!',
          message: `Your payment of KES ${amount.toLocaleString()} has been processed successfully.`,
          bgColor: 'bg-green-50',
          showCountdown: false,
        };
      case 'failed':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          message: 'The payment could not be completed. Please try again or use a different payment method.',
          bgColor: 'bg-red-50',
          showCountdown: false,
        };
      case 'timeout':
        return {
          icon: <XCircle className="w-16 h-16 text-orange-500" />,
          title: 'Payment Timeout',
          message: 'The payment request has expired. Please try again.',
          bgColor: 'bg-orange-50',
          showCountdown: false,
        };
      default:
        return {
          icon: <Smartphone className="w-16 h-16 text-gray-500" />,
          title: 'Processing',
          message: 'Please wait...',
          bgColor: 'bg-gray-50',
          showCountdown: false,
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={status !== 'pending' ? onClose : undefined}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className={`${statusContent.bgColor} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full sm:mx-0 sm:h-16 sm:w-16">
                {statusContent.icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  {statusContent.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {statusContent.message}
                  </p>
                  {transactionId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Transaction ID: {transactionId}
                    </p>
                  )}
                  {statusContent.showCountdown && countdown > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Time remaining</span>
                        <span className="font-semibold">{countdown}s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(countdown / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {statusContent.showCountdown && countdown === 0 && (
                    <div className="mt-4 p-3 bg-orange-100 rounded-md">
                      <p className="text-sm text-orange-800">
                        Request timed out. Please try again.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            {status === 'success' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Done
              </button>
            )}
            {(status === 'failed' || status === 'timeout' || countdown === 0) && (
              <>
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Retry Payment
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            )}
            {status === 'pending' && (
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default STKPushModal;

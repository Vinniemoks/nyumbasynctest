import { useState } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';

const PaymentMethodSelector = ({ selectedMethod, onMethodSelect, phoneNumber, onPhoneNumberChange }) => {
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber || '');

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      color: 'bg-green-500',
      requiresPhone: true,
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: '📱',
      color: 'bg-red-500',
      requiresPhone: true,
    },
    {
      id: 'telkom',
      name: 'Telkom Money',
      icon: '📱',
      color: 'bg-blue-500',
      requiresPhone: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-8 h-8" />,
      color: 'bg-purple-500',
      requiresPhone: false,
    },
  ];

  const handleMethodSelect = (method) => {
    onMethodSelect(method);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setLocalPhoneNumber(value);
    if (onPhoneNumberChange) {
      onPhoneNumberChange(value);
    }
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200
                ${selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`${method.color} text-white p-3 rounded-lg flex items-center justify-center`}>
                  {typeof method.icon === 'string' ? (
                    <span className="text-2xl">{method.icon}</span>
                  ) : (
                    method.icon
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">
                    {method.requiresPhone ? 'Mobile Money' : 'Card Payment'}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMethodData?.requiresPhone && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Smartphone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              value={localPhoneNumber}
              onChange={handlePhoneChange}
              placeholder="+254712345678"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Enter your {selectedMethodData.name} registered phone number
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

const CardPaymentForm = ({ amount, onSubmit, onCancel, isProcessing }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').slice(0, 4);
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation (basic)
    const cardNumberDigits = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Card name validation
    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    // Expiry date validation
    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid expiry date';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In production, this would tokenize the card details
      // For now, we'll pass a mock token
      const cardToken = `tok_${Date.now()}`;
      onSubmit(cardToken, cardDetails);
    }
  };

  const getCardType = (number) => {
    const digits = number.replace(/\s/g, '');
    if (digits.startsWith('4')) return 'Visa';
    if (digits.startsWith('5')) return 'Mastercard';
    if (digits.startsWith('3')) return 'Amex';
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <CreditCard className="w-10 h-10" />
          <span className="text-sm font-semibold">{getCardType(cardDetails.cardNumber)}</span>
        </div>
        <div className="mb-6">
          <div className="text-xl tracking-wider font-mono">
            {cardDetails.cardNumber || '•••• •••• •••• ••••'}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-75 mb-1">Cardholder Name</div>
            <div className="font-semibold uppercase">
              {cardDetails.cardName || 'YOUR NAME'}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">Expires</div>
            <div className="font-semibold">
              {cardDetails.expiryDate || 'MM/YY'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
              errors.cardNumber
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            disabled={isProcessing}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={cardDetails.cardName}
            onChange={handleInputChange}
            placeholder="JOHN DOE"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
              errors.cardName
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            disabled={isProcessing}
          />
          {errors.cardName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              maxLength="5"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                errors.expiryDate
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isProcessing}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              placeholder="123"
              maxLength="4"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                errors.cvv
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isProcessing}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <Lock className="w-4 h-4 mr-2" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-lg font-semibold text-gray-900">
          Total: KES {amount.toLocaleString()}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            `Pay KES ${amount.toLocaleString()}`
          )}
        </button>
      </div>
    </form>
  );
};

export default CardPaymentForm;

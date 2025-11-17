import axios from 'axios';
import { validateInput, RateLimiter } from '../utils/security';
import { auditLogger } from '../utils/auditLogger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock mode for development - controlled by environment variable
const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// Rate limiter for payment requests (max 5 per minute per user)
const paymentRateLimiter = new RateLimiter(5, 60000);

// Mock delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  // Validate payment inputs
  _validatePaymentInput: (phoneNumber, amount, accountReference) => {
    // Validate amount
    if (!validateInput.isValidAmount(amount)) {
      throw new Error('Invalid payment amount');
    }

    // Validate phone number format
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Validate account reference
    if (!accountReference || accountReference.length < 3 || accountReference.length > 50) {
      throw new Error('Invalid account reference');
    }

    // Check for SQL injection attempts
    if (!validateInput.isSQLSafe(accountReference)) {
      throw new Error('Invalid characters in account reference');
    }

    return true;
  },

  // Check rate limit
  _checkRateLimit: (userId) => {
    if (!paymentRateLimiter.isAllowed(userId)) {
      throw new Error('Too many payment requests. Please try again later.');
    }
  },

  // M-Pesa STK Push
  initiateMpesaPayment: async (phoneNumber, amount, accountReference, userId = 'anonymous') => {
    try {
      // Validate inputs
      paymentService._validatePaymentInput(phoneNumber, amount, accountReference);
      
      // Check rate limit
      paymentService._checkRateLimit(userId);

      // Audit log
      auditLogger.logPayment('mpesa_initiated', {
        userId,
        amount: parseFloat(amount).toFixed(2),
        accountReference,
        phoneNumber: phoneNumber.substring(0, 7) + '***' // Mask phone number
      });

      if (USE_MOCK) {
        await delay(1000);
        return {
          success: true,
          transactionId: `MPESA${Date.now()}`,
          message: 'STK push sent successfully',
          status: 'pending',
        };
      }
      const { data } = await axios.post(`${API_URL}/payments/mpesa/stk-push`, {
        phoneNumber,
        amount: parseFloat(amount).toFixed(2),
        accountReference,
      });
      
      auditLogger.logPayment('mpesa_success', {
        userId,
        transactionId: data.transactionId
      });
      
      return data;
    } catch (error) {
      auditLogger.logPayment('mpesa_failed', {
        userId,
        error: error.message
      });
      throw error;
    }
  },

  // Airtel Money STK Push
  initiateAirtelPayment: async (phoneNumber, amount, accountReference, userId = 'anonymous') => {
    // Validate inputs
    paymentService._validatePaymentInput(phoneNumber, amount, accountReference);
    
    // Check rate limit
    paymentService._checkRateLimit(userId);

    if (USE_MOCK) {
      await delay(1000);
      return {
        success: true,
        transactionId: `AIRTEL${Date.now()}`,
        message: 'STK push sent successfully',
        status: 'pending',
      };
    }
    const { data } = await axios.post(`${API_URL}/payments/airtel/stk-push`, {
      phoneNumber,
      amount: parseFloat(amount).toFixed(2),
      accountReference,
    });
    return data;
  },

  // Telkom Money STK Push
  initiateTelkomPayment: async (phoneNumber, amount, accountReference, userId = 'anonymous') => {
    // Validate inputs
    paymentService._validatePaymentInput(phoneNumber, amount, accountReference);
    
    // Check rate limit
    paymentService._checkRateLimit(userId);

    if (USE_MOCK) {
      await delay(1000);
      return {
        success: true,
        transactionId: `TELKOM${Date.now()}`,
        message: 'STK push sent successfully',
        status: 'pending',
      };
    }
    const { data } = await axios.post(`${API_URL}/payments/telkom/stk-push`, {
      phoneNumber,
      amount: parseFloat(amount).toFixed(2),
      accountReference,
    });
    return data;
  },

  // Card Payment
  processCardPayment: async (cardToken, amount, accountReference, userId = 'anonymous') => {
    // Validate amount and account reference
    if (!validateInput.isValidAmount(amount)) {
      throw new Error('Invalid payment amount');
    }
    if (!accountReference || !validateInput.isSQLSafe(accountReference)) {
      throw new Error('Invalid account reference');
    }

    // Check rate limit
    paymentService._checkRateLimit(userId);

    if (USE_MOCK) {
      await delay(2000);
      return {
        success: true,
        transactionId: `CARD${Date.now()}`,
        message: 'Payment processed successfully',
        status: 'success',
      };
    }
    const { data } = await axios.post(`${API_URL}/payments/card/process`, {
      cardToken,
      amount: parseFloat(amount).toFixed(2),
      accountReference,
    });
    return data;
  },

  // Check Payment Status
  checkPaymentStatus: async (transactionId) => {
    if (USE_MOCK) {
      await delay(500);
      // Simulate random success/pending for demo
      const random = Math.random();
      if (random > 0.7) {
        return {
          status: 'success',
          transactionId,
          message: 'Payment completed successfully',
        };
      } else if (random > 0.6) {
        return {
          status: 'failed',
          transactionId,
          message: 'Payment failed',
        };
      } else {
        return {
          status: 'pending',
          transactionId,
          message: 'Payment is being processed',
        };
      }
    }
    const { data } = await axios.get(`${API_URL}/payments/status/${transactionId}`);
    return data;
  },

  // Poll payment status with timeout
  pollPaymentStatus: async (transactionId, maxAttempts = 60, interval = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await paymentService.checkPaymentStatus(transactionId);
      
      if (status.status === 'success' || status.status === 'failed') {
        return status;
      }
      
      await delay(interval);
    }
    
    return {
      status: 'timeout',
      transactionId,
      message: 'Payment request timed out',
    };
  },
};

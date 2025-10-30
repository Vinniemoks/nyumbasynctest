import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock mode for development
const USE_MOCK = true;

// Mock delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  // M-Pesa STK Push
  initiateMpesaPayment: async (phoneNumber, amount, accountReference) => {
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
      amount,
      accountReference,
    });
    return data;
  },

  // Airtel Money STK Push
  initiateAirtelPayment: async (phoneNumber, amount, accountReference) => {
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
      amount,
      accountReference,
    });
    return data;
  },

  // Telkom Money STK Push
  initiateTelkomPayment: async (phoneNumber, amount, accountReference) => {
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
      amount,
      accountReference,
    });
    return data;
  },

  // Card Payment
  processCardPayment: async (cardToken, amount, accountReference) => {
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
      amount,
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

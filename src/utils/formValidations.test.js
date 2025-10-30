import { describe, it, expect } from 'vitest';
import {
  validatePaymentForm,
  validateMaintenanceRequest,
  validateGuestRegistration,
  isValidKenyanPhone,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
  isValidTime
} from './formValidations';

describe('Form Validations', () => {
  describe('validatePaymentForm', () => {
    it('should validate valid payment form with mobile money', () => {
      const formData = {
        amount: 10000,
        paymentMethod: 'mpesa',
        phoneNumber: '0712345678'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate valid payment form with card', () => {
      const formData = {
        amount: 10000,
        paymentMethod: 'card',
        cardNumber: '4532015112830366',
        expiryDate: '12/25',
        cvv: '123'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for missing amount', () => {
      const formData = {
        paymentMethod: 'mpesa',
        phoneNumber: '0712345678'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });

    it('should return error for invalid amount', () => {
      const formData = {
        amount: 0,
        paymentMethod: 'mpesa',
        phoneNumber: '0712345678'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });

    it('should return error for missing payment method', () => {
      const formData = {
        amount: 10000
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.paymentMethod).toBeDefined();
    });

    it('should return error for missing phone number with mobile money', () => {
      const formData = {
        amount: 10000,
        paymentMethod: 'mpesa'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBeDefined();
    });

    it('should return error for invalid phone number', () => {
      const formData = {
        amount: 10000,
        paymentMethod: 'mpesa',
        phoneNumber: '123456'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBeDefined();
    });

    it('should return errors for missing card details', () => {
      const formData = {
        amount: 10000,
        paymentMethod: 'card'
      };
      
      const result = validatePaymentForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.cardNumber).toBeDefined();
      expect(result.errors.expiryDate).toBeDefined();
      expect(result.errors.cvv).toBeDefined();
    });
  });

  describe('validateMaintenanceRequest', () => {
    it('should validate valid maintenance request', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leaking pipe in the kitchen',
        priority: 'high'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for missing category', () => {
      const formData = {
        description: 'Leaking pipe in the kitchen',
        priority: 'high'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.category).toBeDefined();
    });

    it('should return error for missing description', () => {
      const formData = {
        category: 'plumbing',
        priority: 'high'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    it('should return error for short description', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leak',
        priority: 'high'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    it('should return error for missing priority', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leaking pipe in the kitchen'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.priority).toBeDefined();
    });

    it('should return error for invalid priority', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leaking pipe in the kitchen',
        priority: 'super-urgent'
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.priority).toBeDefined();
    });

    it('should return error for too many images', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leaking pipe in the kitchen',
        priority: 'high',
        images: Array(6).fill({ size: 1024 })
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.images).toBeDefined();
    });

    it('should return error for oversized images', () => {
      const formData = {
        category: 'plumbing',
        description: 'Leaking pipe in the kitchen',
        priority: 'high',
        images: [{ size: 11 * 1024 * 1024 }]
      };
      
      const result = validateMaintenanceRequest(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.images).toBeDefined();
    });
  });

  describe('validateGuestRegistration', () => {
    it('should validate valid guest registration', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestName: 'John Doe',
        guestPhone: '0712345678',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for missing guest name', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestPhone: '0712345678',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.guestName).toBeDefined();
    });

    it('should return error for short guest name', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestName: 'J',
        guestPhone: '0712345678',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.guestName).toBeDefined();
    });

    it('should return error for missing phone number', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestName: 'John Doe',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.guestPhone).toBeDefined();
    });

    it('should return error for invalid phone number', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestName: 'John Doe',
        guestPhone: '123456',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.guestPhone).toBeDefined();
    });

    it('should return error for past arrival date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const formData = {
        guestName: 'John Doe',
        guestPhone: '0712345678',
        expectedArrivalDate: yesterday.toISOString().split('T')[0],
        expectedArrivalTime: '14:30'
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.expectedArrivalDate).toBeDefined();
    });

    it('should return error for missing arrival time', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        guestName: 'John Doe',
        guestPhone: '0712345678',
        expectedArrivalDate: tomorrow.toISOString().split('T')[0]
      };
      
      const result = validateGuestRegistration(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.expectedArrivalTime).toBeDefined();
    });
  });

  describe('isValidKenyanPhone', () => {
    it('should validate correct Kenyan phone numbers', () => {
      expect(isValidKenyanPhone('0712345678')).toBe(true);
      expect(isValidKenyanPhone('0112345678')).toBe(true);
      expect(isValidKenyanPhone('+254712345678')).toBe(true);
      expect(isValidKenyanPhone('254712345678')).toBe(true);
    });

    it('should handle phone numbers with spaces and dashes', () => {
      expect(isValidKenyanPhone('0712 345 678')).toBe(true);
      expect(isValidKenyanPhone('0712-345-678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidKenyanPhone('123456')).toBe(false);
      expect(isValidKenyanPhone('0812345678')).toBe(false);
      expect(isValidKenyanPhone('071234567')).toBe(false);
      expect(isValidKenyanPhone('')).toBe(false);
      expect(isValidKenyanPhone(null)).toBe(false);
    });
  });

  describe('isValidCardNumber', () => {
    it('should validate correct card numbers', () => {
      expect(isValidCardNumber('4532015112830366')).toBe(true);
      expect(isValidCardNumber('5425233430109903')).toBe(true);
      expect(isValidCardNumber('374245455400126')).toBe(true);
    });

    it('should handle card numbers with spaces and dashes', () => {
      expect(isValidCardNumber('4532 0151 1283 0366')).toBe(true);
      expect(isValidCardNumber('4532-0151-1283-0366')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(isValidCardNumber('1234567890123456')).toBe(false);
      expect(isValidCardNumber('4532015112830367')).toBe(false);
      expect(isValidCardNumber('123')).toBe(false);
      expect(isValidCardNumber('')).toBe(false);
      expect(isValidCardNumber(null)).toBe(false);
    });
  });

  describe('isValidExpiryDate', () => {
    it('should validate future expiry dates', () => {
      const futureYear = new Date().getFullYear() + 2;
      expect(isValidExpiryDate(`12/${futureYear}`)).toBe(true);
      expect(isValidExpiryDate(`01/${futureYear.toString().slice(-2)}`)).toBe(true);
    });

    it('should reject past expiry dates', () => {
      expect(isValidExpiryDate('12/20')).toBe(false);
      expect(isValidExpiryDate('01/2020')).toBe(false);
    });

    it('should reject invalid month', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(isValidExpiryDate(`13/${futureYear}`)).toBe(false);
      expect(isValidExpiryDate(`00/${futureYear}`)).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(isValidExpiryDate('12-25')).toBe(false);
      expect(isValidExpiryDate('1225')).toBe(false);
      expect(isValidExpiryDate('')).toBe(false);
      expect(isValidExpiryDate(null)).toBe(false);
    });
  });

  describe('isValidCVV', () => {
    it('should validate correct CVV', () => {
      expect(isValidCVV('123')).toBe(true);
      expect(isValidCVV('1234')).toBe(true);
    });

    it('should reject invalid CVV', () => {
      expect(isValidCVV('12')).toBe(false);
      expect(isValidCVV('12345')).toBe(false);
      expect(isValidCVV('abc')).toBe(false);
      expect(isValidCVV('')).toBe(false);
      expect(isValidCVV(null)).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('should validate correct time format', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('12:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
    });

    it('should reject invalid time format', () => {
      expect(isValidTime('24:00')).toBe(false);
      expect(isValidTime('12:60')).toBe(false);
      expect(isValidTime('1:30')).toBe(false);
      expect(isValidTime('12:3')).toBe(false);
      expect(isValidTime('12-30')).toBe(false);
      expect(isValidTime('')).toBe(false);
      expect(isValidTime(null)).toBe(false);
    });
  });
});

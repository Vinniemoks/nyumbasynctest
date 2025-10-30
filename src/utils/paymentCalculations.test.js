import { describe, it, expect } from 'vitest';
import {
  calculateLateFee,
  calculateTotalRent,
  splitCostEqually,
  splitCostByPercentage,
  validatePercentageSum,
  calculateYearToDateRent,
  calculateOnTimePercentage
} from './paymentCalculations';

describe('Payment Calculations', () => {
  describe('calculateLateFee', () => {
    it('should calculate late fee correctly', () => {
      expect(calculateLateFee(10000, 5, 5)).toBe(500);
      expect(calculateLateFee(15000, 10, 5)).toBe(750);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateLateFee(0, 5)).toBe(0);
      expect(calculateLateFee(10000, 0)).toBe(0);
      expect(calculateLateFee(-10000, 5)).toBe(0);
      expect(calculateLateFee(10000, -5)).toBe(0);
    });

    it('should handle different late fee percentages', () => {
      expect(calculateLateFee(10000, 5, 10)).toBe(1000);
      expect(calculateLateFee(10000, 5, 2)).toBe(200);
    });
  });

  describe('calculateTotalRent', () => {
    it('should calculate total rent with late fee', () => {
      expect(calculateTotalRent(10000, 5, 5)).toBe(10500);
      expect(calculateTotalRent(15000, 10, 5)).toBe(15750);
    });

    it('should return rent amount when no days late', () => {
      expect(calculateTotalRent(10000, 0)).toBe(10000);
      expect(calculateTotalRent(10000)).toBe(10000);
    });

    it('should return 0 for invalid rent amount', () => {
      expect(calculateTotalRent(0, 5)).toBe(0);
      expect(calculateTotalRent(-10000, 5)).toBe(0);
    });
  });

  describe('splitCostEqually', () => {
    it('should split cost equally among people', () => {
      expect(splitCostEqually(1000, 2)).toBe(500);
      expect(splitCostEqually(1500, 3)).toBe(500);
      expect(splitCostEqually(1000, 4)).toBe(250);
    });

    it('should handle decimal results', () => {
      expect(splitCostEqually(100, 3)).toBe(33.33);
      expect(splitCostEqually(1000, 7)).toBe(142.86);
    });

    it('should return 0 for invalid inputs', () => {
      expect(splitCostEqually(0, 2)).toBe(0);
      expect(splitCostEqually(1000, 0)).toBe(0);
      expect(splitCostEqually(-1000, 2)).toBe(0);
    });
  });

  describe('splitCostByPercentage', () => {
    it('should split cost by custom percentages', () => {
      const result = splitCostByPercentage(1000, {
        person1: 50,
        person2: 30,
        person3: 20
      });
      
      expect(result.person1).toBe(500);
      expect(result.person2).toBe(300);
      expect(result.person3).toBe(200);
    });

    it('should handle unequal percentages', () => {
      const result = splitCostByPercentage(1000, {
        you: 60,
        roommate: 40
      });
      
      expect(result.you).toBe(600);
      expect(result.roommate).toBe(400);
    });

    it('should return empty object for invalid inputs', () => {
      expect(splitCostByPercentage(0, { person1: 50 })).toEqual({});
      expect(splitCostByPercentage(1000, null)).toEqual({});
      expect(splitCostByPercentage(1000, 'invalid')).toEqual({});
    });

    it('should ignore invalid percentage values', () => {
      const result = splitCostByPercentage(1000, {
        person1: 50,
        person2: 'invalid',
        person3: -10
      });
      
      expect(result.person1).toBe(500);
      expect(result.person2).toBeUndefined();
      expect(result.person3).toBeUndefined();
    });
  });

  describe('validatePercentageSum', () => {
    it('should return true when percentages sum to 100', () => {
      expect(validatePercentageSum({ person1: 50, person2: 50 })).toBe(true);
      expect(validatePercentageSum({ person1: 33.33, person2: 33.33, person3: 33.34 })).toBe(true);
    });

    it('should return false when percentages do not sum to 100', () => {
      expect(validatePercentageSum({ person1: 50, person2: 40 })).toBe(false);
      expect(validatePercentageSum({ person1: 60, person2: 60 })).toBe(false);
    });

    it('should handle floating point precision', () => {
      expect(validatePercentageSum({ person1: 33.33, person2: 33.33, person3: 33.33 })).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(validatePercentageSum(null)).toBe(false);
      expect(validatePercentageSum('invalid')).toBe(false);
      expect(validatePercentageSum([])).toBe(false);
    });
  });

  describe('calculateYearToDateRent', () => {
    it('should calculate year-to-date rent correctly', () => {
      const currentYear = new Date().getFullYear();
      const payments = [
        { date: `${currentYear}-01-01`, amount: 10000 },
        { date: `${currentYear}-02-01`, amount: 10000 },
        { date: `${currentYear}-03-01`, amount: 10000 }
      ];
      
      expect(calculateYearToDateRent(payments)).toBe(30000);
    });

    it('should exclude payments from previous years', () => {
      const currentYear = new Date().getFullYear();
      const payments = [
        { date: `${currentYear}-01-01`, amount: 10000 },
        { date: `${currentYear - 1}-12-01`, amount: 10000 },
        { date: `${currentYear}-02-01`, amount: 10000 }
      ];
      
      expect(calculateYearToDateRent(payments)).toBe(20000);
    });

    it('should return 0 for empty or invalid array', () => {
      expect(calculateYearToDateRent([])).toBe(0);
      expect(calculateYearToDateRent(null)).toBe(0);
      expect(calculateYearToDateRent('invalid')).toBe(0);
    });

    it('should handle payments with missing data', () => {
      const currentYear = new Date().getFullYear();
      const payments = [
        { date: `${currentYear}-01-01`, amount: 10000 },
        { date: null, amount: 10000 },
        { date: `${currentYear}-02-01`, amount: null }
      ];
      
      expect(calculateYearToDateRent(payments)).toBe(10000);
    });
  });

  describe('calculateOnTimePercentage', () => {
    it('should calculate on-time payment percentage', () => {
      const payments = [
        { status: 'paid' },
        { status: 'paid' },
        { status: 'overdue' },
        { status: 'paid' }
      ];
      
      expect(calculateOnTimePercentage(payments)).toBe(75);
    });

    it('should handle all on-time payments', () => {
      const payments = [
        { status: 'paid' },
        { status: 'on_time' },
        { status: 'paid' }
      ];
      
      expect(calculateOnTimePercentage(payments)).toBe(100);
    });

    it('should handle all late payments', () => {
      const payments = [
        { status: 'overdue' },
        { status: 'late' },
        { status: 'overdue' }
      ];
      
      expect(calculateOnTimePercentage(payments)).toBe(0);
    });

    it('should return 0 for empty or invalid array', () => {
      expect(calculateOnTimePercentage([])).toBe(0);
      expect(calculateOnTimePercentage(null)).toBe(0);
      expect(calculateOnTimePercentage('invalid')).toBe(0);
    });
  });
});

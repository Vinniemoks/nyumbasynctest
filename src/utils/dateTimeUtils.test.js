import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDaysUntilDue,
  calculateDaysOverdue,
  calculateLeaseExpiration,
  isLeaseExpiringSoon,
  shouldShowRentReminder,
  getPaymentStatusText,
  calculateMonthsPaid,
  calculateLeaseProgress,
  formatDateDisplay,
  isToday,
  isPastDate,
  addDays,
  getFirstDayOfMonth,
  getLastDayOfMonth
} from './dateTimeUtils';

describe('Date/Time Utilities', () => {
  describe('calculateDaysUntilDue', () => {
    it('should calculate days until future due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      expect(calculateDaysUntilDue(futureDate)).toBe(5);
    });

    it('should return negative days for past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      
      expect(calculateDaysUntilDue(pastDate)).toBe(-3);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      expect(calculateDaysUntilDue(today)).toBe(0);
    });

    it('should return 0 for invalid date', () => {
      expect(calculateDaysUntilDue(null)).toBe(0);
      expect(calculateDaysUntilDue(undefined)).toBe(0);
    });
  });

  describe('calculateDaysOverdue', () => {
    it('should calculate days overdue for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      expect(calculateDaysOverdue(pastDate)).toBe(5);
    });

    it('should return 0 for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      expect(calculateDaysOverdue(futureDate)).toBe(0);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      expect(calculateDaysOverdue(today)).toBe(0);
    });
  });

  describe('calculateLeaseExpiration', () => {
    it('should calculate days remaining until lease end', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      expect(calculateLeaseExpiration(futureDate)).toBe(30);
    });

    it('should return 0 for expired lease', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      expect(calculateLeaseExpiration(pastDate)).toBe(0);
    });

    it('should return 0 for invalid date', () => {
      expect(calculateLeaseExpiration(null)).toBe(0);
    });
  });

  describe('isLeaseExpiringSoon', () => {
    it('should return true for lease expiring within 90 days', () => {
      const date = new Date();
      date.setDate(date.getDate() + 60);
      
      expect(isLeaseExpiringSoon(date)).toBe(true);
    });

    it('should return false for lease expiring after 90 days', () => {
      const date = new Date();
      date.setDate(date.getDate() + 100);
      
      expect(isLeaseExpiringSoon(date)).toBe(false);
    });

    it('should return false for expired lease', () => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      
      expect(isLeaseExpiringSoon(date)).toBe(false);
    });
  });

  describe('shouldShowRentReminder', () => {
    it('should return true for rent due within 7 days', () => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      
      expect(shouldShowRentReminder(date, 'pending')).toBe(true);
    });

    it('should return false for rent due after 7 days', () => {
      const date = new Date();
      date.setDate(date.getDate() + 10);
      
      expect(shouldShowRentReminder(date, 'pending')).toBe(false);
    });

    it('should return false for paid rent', () => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      
      expect(shouldShowRentReminder(date, 'paid')).toBe(false);
    });

    it('should return false for overdue rent', () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      
      expect(shouldShowRentReminder(date, 'pending')).toBe(false);
    });
  });

  describe('getPaymentStatusText', () => {
    it('should return "Paid" for paid status', () => {
      const date = new Date();
      expect(getPaymentStatusText(date, 'paid')).toBe('Paid');
    });

    it('should return "Due Today" for today', () => {
      const today = new Date();
      expect(getPaymentStatusText(today, 'pending')).toBe('Due Today');
    });

    it('should return "Due Tomorrow" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getPaymentStatusText(tomorrow, 'pending')).toBe('Due Tomorrow');
    });

    it('should return days until due for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(getPaymentStatusText(futureDate, 'pending')).toBe('Due in 5 days');
    });

    it('should return overdue message for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(getPaymentStatusText(pastDate, 'pending')).toBe('Overdue by 3 days');
    });

    it('should handle singular day correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(getPaymentStatusText(pastDate, 'pending')).toBe('Overdue by 1 day');
    });
  });

  describe('calculateMonthsPaid', () => {
    it('should calculate number of paid months', () => {
      const startDate = new Date('2024-01-01');
      const payments = [
        { status: 'paid', date: '2024-01-01' },
        { status: 'paid', date: '2024-02-01' },
        { status: 'completed', date: '2024-03-01' },
        { status: 'pending', date: '2024-04-01' }
      ];
      
      expect(calculateMonthsPaid(startDate, payments)).toBe(3);
    });

    it('should return 0 for no payments', () => {
      const startDate = new Date('2024-01-01');
      expect(calculateMonthsPaid(startDate, [])).toBe(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateMonthsPaid(null, [])).toBe(0);
      expect(calculateMonthsPaid(new Date(), null)).toBe(0);
    });
  });

  describe('calculateLeaseProgress', () => {
    it('should calculate lease progress percentage', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 180); // 6 months ago
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 180); // 6 months from now
      
      // Should be approximately 50%
      const progress = calculateLeaseProgress(startDate, endDate);
      expect(progress).toBeGreaterThan(45);
      expect(progress).toBeLessThan(55);
    });

    it('should return 0 for lease not started', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 100);
      
      expect(calculateLeaseProgress(startDate, endDate)).toBe(0);
    });

    it('should return 100 for expired lease', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 100);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 10);
      
      expect(calculateLeaseProgress(startDate, endDate)).toBe(100);
    });

    it('should return 0 for invalid dates', () => {
      expect(calculateLeaseProgress(null, new Date())).toBe(0);
      expect(calculateLeaseProgress(new Date(), null)).toBe(0);
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDateDisplay(date, 'short');
      expect(formatted).toContain('Mar');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date in long format', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDateDisplay(date, 'long');
      expect(formatted).toContain('March');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should return "N/A" for null date', () => {
      expect(formatDateDisplay(null)).toBe('N/A');
    });

    it('should return "Invalid Date" for invalid date', () => {
      expect(formatDateDisplay('invalid')).toBe('Invalid Date');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isToday(null)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('should return true for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isPastDate(today)).toBe(false);
    });

    it('should return false for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPastDate(null)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-03-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should handle negative days', () => {
      const date = new Date('2024-03-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-03-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(3); // April (0-indexed)
      expect(result.getDate()).toBe(4);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('should return first day of current month', () => {
      const firstDay = getFirstDayOfMonth();
      expect(firstDay.getDate()).toBe(1);
    });
  });

  describe('getLastDayOfMonth', () => {
    it('should return last day of current month', () => {
      const lastDay = getLastDayOfMonth();
      const nextMonth = new Date(lastDay);
      nextMonth.setDate(nextMonth.getDate() + 1);
      expect(nextMonth.getDate()).toBe(1);
    });
  });
});

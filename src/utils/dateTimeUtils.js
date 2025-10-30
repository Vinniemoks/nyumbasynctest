/**
 * Date and time utility functions
 */

/**
 * Calculate days until a due date
 * @param {Date|string} dueDate - The due date
 * @returns {number} Number of days until due (negative if overdue)
 */
export const calculateDaysUntilDue = (dueDate) => {
  if (!dueDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate days overdue
 * @param {Date|string} dueDate - The due date
 * @returns {number} Number of days overdue (0 if not overdue)
 */
export const calculateDaysOverdue = (dueDate) => {
  const daysUntilDue = calculateDaysUntilDue(dueDate);
  return daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;
};

/**
 * Calculate days remaining until lease expiration
 * @param {Date|string} leaseEndDate - The lease end date
 * @returns {number} Number of days remaining
 */
export const calculateLeaseExpiration = (leaseEndDate) => {
  if (!leaseEndDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(leaseEndDate);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Check if lease is expiring soon (within 90 days)
 * @param {Date|string} leaseEndDate - The lease end date
 * @returns {boolean} True if expiring within 90 days
 */
export const isLeaseExpiringSoon = (leaseEndDate) => {
  const daysRemaining = calculateLeaseExpiration(leaseEndDate);
  return daysRemaining > 0 && daysRemaining <= 90;
};

/**
 * Check if rent reminder should be shown (within 7 days of due date)
 * @param {Date|string} dueDate - The rent due date
 * @param {string} status - Payment status
 * @returns {boolean} True if reminder should be shown
 */
export const shouldShowRentReminder = (dueDate, status = 'pending') => {
  if (status === 'paid') return false;
  
  const daysUntilDue = calculateDaysUntilDue(dueDate);
  return daysUntilDue <= 7 && daysUntilDue >= 0;
};

/**
 * Get payment status text based on due date
 * @param {Date|string} dueDate - The due date
 * @param {string} status - Current payment status
 * @returns {string} Status text
 */
export const getPaymentStatusText = (dueDate, status = 'pending') => {
  if (status === 'paid') return 'Paid';
  
  const daysUntilDue = calculateDaysUntilDue(dueDate);
  const daysOverdue = calculateDaysOverdue(dueDate);
  
  if (daysOverdue > 0) {
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
  }
  
  if (daysUntilDue === 0) return 'Due Today';
  if (daysUntilDue === 1) return 'Due Tomorrow';
  
  return `Due in ${daysUntilDue} days`;
};

/**
 * Calculate months paid in lease term
 * @param {Date|string} leaseStartDate - Lease start date
 * @param {Array} payments - Array of payment objects with dates
 * @returns {number} Number of months paid
 */
export const calculateMonthsPaid = (leaseStartDate, payments) => {
  if (!leaseStartDate || !Array.isArray(payments)) return 0;
  
  const startDate = new Date(leaseStartDate);
  const paidPayments = payments.filter(p => p.status === 'paid' || p.status === 'completed');
  
  return paidPayments.length;
};

/**
 * Calculate lease progress percentage
 * @param {Date|string} leaseStartDate - Lease start date
 * @param {Date|string} leaseEndDate - Lease end date
 * @returns {number} Progress percentage (0-100)
 */
export const calculateLeaseProgress = (leaseStartDate, leaseEndDate) => {
  if (!leaseStartDate || !leaseEndDate) return 0;
  
  const start = new Date(leaseStartDate);
  const end = new Date(leaseEndDate);
  const today = new Date();
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // If lease hasn't started yet
  if (today < start) return 0;
  
  // If lease has ended
  if (today > end) return 100;
  
  const totalDays = (end - start) / (1000 * 60 * 60 * 24);
  const daysPassed = (today - start) / (1000 * 60 * 60 * 24);
  
  const progress = (daysPassed / totalDays) * 100;
  return Math.round(progress * 100) / 100;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} Formatted date string
 */
export const formatDateDisplay = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate();
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get first day of current month
 * @returns {Date} First day of current month
 */
export const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get last day of current month
 * @returns {Date} Last day of current month
 */
export const getLastDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

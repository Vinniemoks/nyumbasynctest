/**
 * Payment calculation utilities
 */

/**
 * Calculate late fee based on days overdue
 * @param {number} rentAmount - Monthly rent amount
 * @param {number} daysLate - Number of days payment is late
 * @param {number} lateFeePercentage - Late fee percentage (default 5%)
 * @returns {number} Late fee amount
 */
export const calculateLateFee = (rentAmount, daysLate, lateFeePercentage = 5) => {
  if (!rentAmount || rentAmount <= 0) return 0;
  if (!daysLate || daysLate <= 0) return 0;
  
  // Calculate late fee as percentage of rent
  const lateFee = (rentAmount * lateFeePercentage) / 100;
  
  return Math.round(lateFee * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate total rent amount including late fees
 * @param {number} rentAmount - Monthly rent amount
 * @param {number} daysLate - Number of days payment is late
 * @param {number} lateFeePercentage - Late fee percentage (default 5%)
 * @returns {number} Total amount due
 */
export const calculateTotalRent = (rentAmount, daysLate = 0, lateFeePercentage = 5) => {
  if (!rentAmount || rentAmount <= 0) return 0;
  
  const lateFee = calculateLateFee(rentAmount, daysLate, lateFeePercentage);
  const total = rentAmount + lateFee;
  
  return Math.round(total * 100) / 100;
};

/**
 * Split utility cost equally among roommates
 * @param {number} totalAmount - Total utility bill amount
 * @param {number} numberOfPeople - Number of people splitting the bill
 * @returns {number} Amount per person
 */
export const splitCostEqually = (totalAmount, numberOfPeople) => {
  if (!totalAmount || totalAmount <= 0) return 0;
  if (!numberOfPeople || numberOfPeople <= 0) return 0;
  
  const amountPerPerson = totalAmount / numberOfPeople;
  return Math.round(amountPerPerson * 100) / 100;
};

/**
 * Split utility cost by custom percentages
 * @param {number} totalAmount - Total utility bill amount
 * @param {Object} percentages - Object with person keys and percentage values
 * @returns {Object} Object with person keys and calculated amounts
 */
export const splitCostByPercentage = (totalAmount, percentages) => {
  if (!totalAmount || totalAmount <= 0) return {};
  if (!percentages || typeof percentages !== 'object') return {};
  
  const result = {};
  
  Object.keys(percentages).forEach(person => {
    const percentage = percentages[person];
    if (typeof percentage === 'number' && percentage >= 0) {
      result[person] = Math.round((totalAmount * percentage / 100) * 100) / 100;
    }
  });
  
  return result;
};

/**
 * Validate that percentages sum to 100
 * @param {Object} percentages - Object with person keys and percentage values
 * @returns {boolean} True if percentages sum to 100
 */
export const validatePercentageSum = (percentages) => {
  if (!percentages || typeof percentages !== 'object') return false;
  
  const total = Object.values(percentages).reduce((sum, val) => {
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  
  // Allow small floating point differences
  return Math.abs(total - 100) < 0.1;
};

/**
 * Calculate year-to-date rent paid
 * @param {Array} payments - Array of payment objects with amount and date
 * @returns {number} Total amount paid this year
 */
export const calculateYearToDateRent = (payments) => {
  if (!Array.isArray(payments)) return 0;
  
  const currentYear = new Date().getFullYear();
  
  const total = payments.reduce((sum, payment) => {
    if (!payment.date || !payment.amount) return sum;
    
    const paymentYear = new Date(payment.date).getFullYear();
    if (paymentYear === currentYear) {
      return sum + payment.amount;
    }
    
    return sum;
  }, 0);
  
  return Math.round(total * 100) / 100;
};

/**
 * Calculate on-time payment percentage
 * @param {Array} payments - Array of payment objects with status
 * @returns {number} Percentage of on-time payments
 */
export const calculateOnTimePercentage = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) return 0;
  
  const onTimePayments = payments.filter(p => p.status === 'paid' || p.status === 'on_time').length;
  const percentage = (onTimePayments / payments.length) * 100;
  
  return Math.round(percentage * 100) / 100;
};

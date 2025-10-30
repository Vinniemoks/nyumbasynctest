/**
 * Form validation utilities
 */

/**
 * Validate payment form data
 * @param {Object} formData - Payment form data
 * @returns {Object} Validation result with errors object
 */
export const validatePaymentForm = (formData) => {
  const errors = {};
  
  // Validate amount
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  // Validate payment method
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }
  
  // Validate phone number for mobile money payments
  if (['mpesa', 'airtel', 'telkom'].includes(formData.paymentMethod)) {
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!isValidKenyanPhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }
  }
  
  // Validate card details for card payments
  if (formData.paymentMethod === 'card') {
    if (!formData.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!isValidCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!isValidExpiryDate(formData.expiryDate)) {
      errors.expiryDate = 'Invalid or expired card';
    }
    
    if (!formData.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!isValidCVV(formData.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate maintenance request form data
 * @param {Object} formData - Maintenance request form data
 * @returns {Object} Validation result with errors object
 */
export const validateMaintenanceRequest = (formData) => {
  const errors = {};
  
  // Validate category
  if (!formData.category) {
    errors.category = 'Category is required';
  }
  
  // Validate description
  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  
  // Validate priority
  if (!formData.priority) {
    errors.priority = 'Priority is required';
  } else if (!['low', 'medium', 'high', 'urgent'].includes(formData.priority)) {
    errors.priority = 'Invalid priority level';
  }
  
  // Validate images (optional but if provided, check count and size)
  if (formData.images && Array.isArray(formData.images)) {
    if (formData.images.length > 5) {
      errors.images = 'Maximum 5 images allowed';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedImages = formData.images.filter(img => img.size > maxSize);
    if (oversizedImages.length > 0) {
      errors.images = 'Each image must be less than 10MB';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate guest registration form data
 * @param {Object} formData - Guest registration form data
 * @returns {Object} Validation result with errors object
 */
export const validateGuestRegistration = (formData) => {
  const errors = {};
  
  // Validate guest name
  if (!formData.guestName || formData.guestName.trim().length === 0) {
    errors.guestName = 'Guest name is required';
  } else if (formData.guestName.trim().length < 2) {
    errors.guestName = 'Guest name must be at least 2 characters';
  }
  
  // Validate phone number
  if (!formData.guestPhone) {
    errors.guestPhone = 'Phone number is required';
  } else if (!isValidKenyanPhone(formData.guestPhone)) {
    errors.guestPhone = 'Invalid phone number format';
  }
  
  // Validate arrival date
  if (!formData.expectedArrivalDate) {
    errors.expectedArrivalDate = 'Expected arrival date is required';
  } else {
    const arrivalDate = new Date(formData.expectedArrivalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (arrivalDate < today) {
      errors.expectedArrivalDate = 'Arrival date cannot be in the past';
    }
  }
  
  // Validate arrival time
  if (!formData.expectedArrivalTime) {
    errors.expectedArrivalTime = 'Expected arrival time is required';
  } else if (!isValidTime(formData.expectedArrivalTime)) {
    errors.expectedArrivalTime = 'Invalid time format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate Kenyan phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidKenyanPhone = (phone) => {
  if (!phone) return false;
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Kenyan phone number patterns:
  // +254712345678, 254712345678, 0712345678
  const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
  
  return phoneRegex.test(cleaned);
};

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
export const isValidCardNumber = (cardNumber) => {
  if (!cardNumber) return false;
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's all digits and has valid length
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate card expiry date
 * @param {string} expiryDate - Expiry date in MM/YY or MM/YYYY format
 * @returns {boolean} True if valid and not expired
 */
export const isValidExpiryDate = (expiryDate) => {
  if (!expiryDate) return false;
  
  const parts = expiryDate.split('/');
  if (parts.length !== 2) return false;
  
  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);
  
  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += 2000;
  }
  
  // Validate month
  if (month < 1 || month > 12) return false;
  
  // Check if expired
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

/**
 * Validate CVV
 * @param {string} cvv - CVV to validate
 * @returns {boolean} True if valid
 */
export const isValidCVV = (cvv) => {
  if (!cvv) return false;
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time to validate
 * @returns {boolean} True if valid
 */
export const isValidTime = (time) => {
  if (!time) return false;
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

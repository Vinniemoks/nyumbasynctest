// Password Policy Management - Grade A Security
// Enforces password expiration, history, and complexity requirements

import { auditLogger } from './auditLogger';
import { checkPasswordStrength } from './security';

/**
 * Password Policy Configuration
 */
export const PASSWORD_POLICY = {
  // Admin-specific policies
  ADMIN: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    MIN_UPPERCASE: 2,
    MIN_LOWERCASE: 2,
    MIN_NUMBERS: 2,
    MIN_SPECIAL: 2,
    EXPIRY_DAYS: 30, // Password expires every 30 days
    HISTORY_COUNT: 5, // Cannot reuse last 5 passwords
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    REQUIRE_MFA: true,
    WARNING_DAYS: 7 // Warn 7 days before expiry
  },
  
  // Regular user policies
  USER: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    MIN_UPPERCASE: 1,
    MIN_LOWERCASE: 1,
    MIN_NUMBERS: 1,
    MIN_SPECIAL: 1,
    EXPIRY_DAYS: 90, // Password expires every 90 days
    HISTORY_COUNT: 3,
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000,
    REQUIRE_MFA: false,
    WARNING_DAYS: 14
  }
};

/**
 * Validate password against policy
 */
export const validatePasswordPolicy = (password, userRole = 'user') => {
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(userRole);
  const policy = isAdmin ? PASSWORD_POLICY.ADMIN : PASSWORD_POLICY.USER;
  
  const errors = [];
  const warnings = [];
  
  // Check length
  if (password.length < policy.MIN_LENGTH) {
    errors.push(`Password must be at least ${policy.MIN_LENGTH} characters long`);
  }
  if (password.length > policy.MAX_LENGTH) {
    errors.push(`Password must not exceed ${policy.MAX_LENGTH} characters`);
  }
  
  // Check uppercase letters
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < policy.MIN_UPPERCASE) {
    errors.push(`Password must contain at least ${policy.MIN_UPPERCASE} uppercase letter${policy.MIN_UPPERCASE > 1 ? 's' : ''}`);
  }
  
  // Check lowercase letters
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < policy.MIN_LOWERCASE) {
    errors.push(`Password must contain at least ${policy.MIN_LOWERCASE} lowercase letter${policy.MIN_LOWERCASE > 1 ? 's' : ''}`);
  }
  
  // Check numbers
  const numberCount = (password.match(/[0-9]/g) || []).length;
  if (numberCount < policy.MIN_NUMBERS) {
    errors.push(`Password must contain at least ${policy.MIN_NUMBERS} number${policy.MIN_NUMBERS > 1 ? 's' : ''}`);
  }
  
  // Check special characters
  const specialCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  if (specialCount < policy.MIN_SPECIAL) {
    errors.push(`Password must contain at least ${policy.MIN_SPECIAL} special character${policy.MIN_SPECIAL > 1 ? 's' : ''} (!@#$%^&*)`);
  }
  
  // Check for common patterns
  const commonPatterns = [
    'password', 'admin', 'user', 'login', '12345', 'qwerty', 
    'abc123', 'letmein', 'welcome', 'monkey', 'dragon'
  ];
  
  for (const pattern of commonPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      errors.push('Password contains common patterns that are easily guessed');
      break;
    }
  }
  
  // Check for repeating characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains repeating characters (e.g., aaa, 111)');
  }
  
  // Check for sequential characters
  if (/(abc|bcd|cde|def|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Password contains sequential characters (e.g., abc, 123)');
  }
  
  // Check strength
  const strength = checkPasswordStrength(password, isAdmin);
  if (!strength.isValid) {
    errors.push('Password does not meet minimum strength requirements');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    strength: strength.score,
    policy: isAdmin ? 'ADMIN' : 'USER'
  };
};

/**
 * Check if password has expired
 */
export const isPasswordExpired = (lastChangedDate, userRole = 'user') => {
  if (!lastChangedDate) return true; // No date = expired
  
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(userRole);
  const policy = isAdmin ? PASSWORD_POLICY.ADMIN : PASSWORD_POLICY.USER;
  
  const lastChanged = new Date(lastChangedDate);
  const now = new Date();
  const daysSinceChange = Math.floor((now - lastChanged) / (1000 * 60 * 60 * 24));
  
  return daysSinceChange >= policy.EXPIRY_DAYS;
};

/**
 * Get days until password expires
 */
export const getDaysUntilExpiry = (lastChangedDate, userRole = 'user') => {
  if (!lastChangedDate) return 0;
  
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(userRole);
  const policy = isAdmin ? PASSWORD_POLICY.ADMIN : PASSWORD_POLICY.USER;
  
  const lastChanged = new Date(lastChangedDate);
  const now = new Date();
  const daysSinceChange = Math.floor((now - lastChanged) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, policy.EXPIRY_DAYS - daysSinceChange);
};

/**
 * Check if password expiry warning should be shown
 */
export const shouldShowExpiryWarning = (lastChangedDate, userRole = 'user') => {
  const daysUntilExpiry = getDaysUntilExpiry(lastChangedDate, userRole);
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(userRole);
  const policy = isAdmin ? PASSWORD_POLICY.ADMIN : PASSWORD_POLICY.USER;
  
  return daysUntilExpiry > 0 && daysUntilExpiry <= policy.WARNING_DAYS;
};

/**
 * Hash password for history comparison
 */
export const hashPasswordForHistory = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if password was used recently
 */
export const isPasswordInHistory = async (password, passwordHistory = [], userRole = 'user') => {
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(userRole);
  const policy = isAdmin ? PASSWORD_POLICY.ADMIN : PASSWORD_POLICY.USER;
  
  const hashedPassword = await hashPasswordForHistory(password);
  const recentHistory = passwordHistory.slice(0, policy.HISTORY_COUNT);
  
  return recentHistory.includes(hashedPassword);
};

/**
 * Password Expiration Manager
 */
export class PasswordExpirationManager {
  constructor() {
    this.PASSWORD_EXPIRY_KEY = 'password_expiry_data';
  }

  /**
   * Store password change date
   */
  setPasswordChanged(userId, userRole) {
    const data = this.getExpiryData();
    data[userId] = {
      lastChanged: new Date().toISOString(),
      role: userRole,
      notificationShown: false
    };
    localStorage.setItem(this.PASSWORD_EXPIRY_KEY, JSON.stringify(data));
    
    auditLogger.logSecurity('password_changed', {
      userId,
      role: userRole,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get expiry data for all users
   */
  getExpiryData() {
    const data = localStorage.getItem(this.PASSWORD_EXPIRY_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Get expiry data for specific user
   */
  getUserExpiryData(userId) {
    const data = this.getExpiryData();
    return data[userId] || null;
  }

  /**
   * Check if password is expired
   */
  isExpired(userId) {
    const userData = this.getUserExpiryData(userId);
    if (!userData) return true;
    
    return isPasswordExpired(userData.lastChanged, userData.role);
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(userId) {
    const userData = this.getUserExpiryData(userId);
    if (!userData) return 0;
    
    return getDaysUntilExpiry(userData.lastChanged, userData.role);
  }

  /**
   * Should show warning
   */
  shouldShowWarning(userId) {
    const userData = this.getUserExpiryData(userId);
    if (!userData) return false;
    
    return shouldShowExpiryWarning(userData.lastChanged, userData.role);
  }

  /**
   * Mark notification as shown
   */
  markNotificationShown(userId) {
    const data = this.getExpiryData();
    if (data[userId]) {
      data[userId].notificationShown = true;
      localStorage.setItem(this.PASSWORD_EXPIRY_KEY, JSON.stringify(data));
    }
  }

  /**
   * Get expiry status
   */
  getExpiryStatus(userId) {
    const userData = this.getUserExpiryData(userId);
    if (!userData) {
      return {
        expired: true,
        daysUntilExpiry: 0,
        showWarning: false,
        lastChanged: null
      };
    }

    const expired = this.isExpired(userId);
    const daysUntilExpiry = this.getDaysUntilExpiry(userId);
    const showWarning = this.shouldShowWarning(userId);

    return {
      expired,
      daysUntilExpiry,
      showWarning,
      lastChanged: userData.lastChanged,
      role: userData.role
    };
  }
}

export const passwordExpirationManager = new PasswordExpirationManager();

/**
 * Generate strong password suggestion
 */
export const generateStrongPassword = (length = 16, isAdmin = false) => {
  const minLength = isAdmin ? 12 : 8;
  const actualLength = Math.max(length, minLength);
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  const array = new Uint8Array(actualLength);
  crypto.getRandomValues(array);
  
  // Ensure minimum requirements
  const minCounts = isAdmin ? { upper: 2, lower: 2, num: 2, spec: 2 } : { upper: 1, lower: 1, num: 1, spec: 1 };
  
  // Add required characters
  for (let i = 0; i < minCounts.upper; i++) {
    password += uppercase[array[i] % uppercase.length];
  }
  for (let i = 0; i < minCounts.lower; i++) {
    password += lowercase[array[i + minCounts.upper] % lowercase.length];
  }
  for (let i = 0; i < minCounts.num; i++) {
    password += numbers[array[i + minCounts.upper + minCounts.lower] % numbers.length];
  }
  for (let i = 0; i < minCounts.spec; i++) {
    password += special[array[i + minCounts.upper + minCounts.lower + minCounts.num] % special.length];
  }
  
  // Fill remaining with random characters
  const remaining = actualLength - password.length;
  for (let i = 0; i < remaining; i++) {
    password += allChars[array[password.length] % allChars.length];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export default {
  PASSWORD_POLICY,
  validatePasswordPolicy,
  isPasswordExpired,
  getDaysUntilExpiry,
  shouldShowExpiryWarning,
  hashPasswordForHistory,
  isPasswordInHistory,
  passwordExpirationManager,
  generateStrongPassword
};

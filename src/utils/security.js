// Security utilities

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Kenyan format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Check password strength - Grade A Level for Admins
 */
export const checkPasswordStrength = (password, isAdmin = false) => {
  let strength = 0;
  const checks = {
    length: password.length >= (isAdmin ? 12 : 8),
    minLength: password.length >= (isAdmin ? 12 : 8),
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noCommonPatterns: !/(password|admin|12345|qwerty|abc123)/i.test(password),
    noRepeating: !/(.)\1{2,}/.test(password), // No 3+ repeating chars
    noSequential: !/(abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password)
  };

  // Admin requirements (stricter)
  if (isAdmin) {
    const adminChecks = {
      ...checks,
      minUppercase: (password.match(/[A-Z]/g) || []).length >= 2,
      minLowercase: (password.match(/[a-z]/g) || []).length >= 2,
      minNumbers: (password.match(/[0-9]/g) || []).length >= 2,
      minSpecial: (password.match(/[^A-Za-z0-9]/g) || []).length >= 2,
      maxLength: password.length <= 128
    };
    
    Object.values(adminChecks).forEach(check => {
      if (check) strength += 100 / Object.keys(adminChecks).length;
    });
    
    return {
      score: Math.round(strength),
      level: strength < 60 ? 'weak' : strength < 85 ? 'medium' : 'strong',
      checks: adminChecks,
      isValid: strength >= 85, // Admin passwords must be "strong"
      requirements: {
        minLength: 12,
        uppercase: 2,
        lowercase: 2,
        numbers: 2,
        special: 2,
        noCommonPatterns: true,
        noRepeating: true,
        noSequential: true
      }
    };
  }

  // Regular user requirements
  Object.values(checks).forEach(check => {
    if (check) strength += 100 / Object.keys(checks).length;
  });

  return {
    score: Math.round(strength),
    level: strength < 40 ? 'weak' : strength < 70 ? 'medium' : 'strong',
    checks,
    isValid: strength >= 70
  };
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

/**
 * Secure storage wrapper with encryption
 * Note: For production, consider using httpOnly cookies for sensitive tokens
 */
export const secureStorage = {
  // Simple encryption key derivation (in production, use a proper key management system)
  _getKey: () => {
    const userAgent = navigator.userAgent;
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Changes daily
    return btoa(userAgent + timestamp).substring(0, 32);
  },

  // XOR encryption (basic obfuscation - not cryptographically secure)
  _encrypt: (text, key) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  },

  _decrypt: (encrypted, key) => {
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return null;
    }
  },

  set: (key, value, options = {}) => {
    try {
      const { encrypt = true, expiresIn = null } = options;
      const data = {
        value,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : null
      };
      
      const serialized = JSON.stringify(data);
      const stored = encrypt ? secureStorage._encrypt(serialized, secureStorage._getKey()) : btoa(serialized);
      
      localStorage.setItem(key, stored);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded');
      }
      return false;
    }
  },
  
  get: (key, options = {}) => {
    try {
      const { decrypt = true } = options;
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const serialized = decrypt ? secureStorage._decrypt(stored, secureStorage._getKey()) : atob(stored);
      if (!serialized) return null;
      
      const data = JSON.parse(serialized);
      
      // Check expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        secureStorage.remove(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      return null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  },

  // Check if storage is available
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Token management with automatic expiration
 */
export class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'auth_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.TOKEN_EXPIRY_KEY = 'token_expiry';
  }

  setToken(token, expiresIn = 3600000) { // Default 1 hour
    const expiryTime = Date.now() + expiresIn;
    secureStorage.set(this.TOKEN_KEY, token, { expiresIn });
    secureStorage.set(this.TOKEN_EXPIRY_KEY, expiryTime, { encrypt: false });
  }

  getToken() {
    const token = secureStorage.get(this.TOKEN_KEY);
    if (!token) return null;

    // Check if token is expired
    if (this.isTokenExpired()) {
      this.clearTokens();
      return null;
    }

    return token;
  }

  setRefreshToken(refreshToken) {
    secureStorage.set(this.REFRESH_TOKEN_KEY, refreshToken, { expiresIn: 604800000 }); // 7 days
  }

  getRefreshToken() {
    return secureStorage.get(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired() {
    const expiry = secureStorage.get(this.TOKEN_EXPIRY_KEY, { decrypt: false });
    if (!expiry) return true;
    return Date.now() > expiry;
  }

  getTimeUntilExpiry() {
    const expiry = secureStorage.get(this.TOKEN_EXPIRY_KEY, { decrypt: false });
    if (!expiry) return 0;
    return Math.max(0, expiry - Date.now());
  }

  clearTokens() {
    secureStorage.remove(this.TOKEN_KEY);
    secureStorage.remove(this.REFRESH_TOKEN_KEY);
    secureStorage.remove(this.TOKEN_EXPIRY_KEY);
  }
}

/**
 * Enhanced input validation
 */
export const validateInput = {
  // Prevent SQL injection patterns
  isSQLSafe: (input) => {
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)|(-{2})|(\*\/)|(\bOR\b.*=.*)|(\bAND\b.*=.*)/gi;
    return !sqlPatterns.test(input);
  },

  // Prevent XSS patterns
  isXSSSafe: (input) => {
    const xssPatterns = /<script|javascript:|onerror=|onload=|<iframe|eval\(|expression\(/gi;
    return !xssPatterns.test(input);
  },

  // Validate URL
  isValidURL: (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  // Sanitize filename
  sanitizeFilename: (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
  },

  // Validate amount (for payments)
  isValidAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 10000000 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
  }
};

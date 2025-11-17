/**
 * CSRF Protection Implementation
 * Protects against Cross-Site Request Forgery attacks
 */

class CSRFProtection {
  constructor() {
    this.TOKEN_KEY = 'csrf_token';
    this.TOKEN_HEADER = 'X-CSRF-Token';
    this.TOKEN_EXPIRY = 3600000; // 1 hour
  }

  /**
   * Generate a cryptographically secure CSRF token
   */
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store with expiry
    const tokenData = {
      token,
      expiresAt: Date.now() + this.TOKEN_EXPIRY,
      createdAt: Date.now()
    };
    
    sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    return token;
  }

  /**
   * Get current CSRF token, generate new one if expired
   */
  getToken() {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY);
      if (!stored) {
        return this.generateToken();
      }

      const tokenData = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() > tokenData.expiresAt) {
        return this.generateToken();
      }

      return tokenData.token;
    } catch (error) {
      return this.generateToken();
    }
  }

  /**
   * Validate CSRF token
   */
  validateToken(token) {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY);
      if (!stored) return false;

      const tokenData = JSON.parse(stored);
      
      // Check expiry
      if (Date.now() > tokenData.expiresAt) {
        return false;
      }

      // Constant-time comparison to prevent timing attacks
      return this.constantTimeCompare(token, tokenData.token);
    } catch (error) {
      return false;
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Clear CSRF token
   */
  clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Rotate token (generate new one)
   */
  rotateToken() {
    this.clearToken();
    return this.generateToken();
  }

  /**
   * Get token for request headers
   */
  getHeaderValue() {
    return {
      [this.TOKEN_HEADER]: this.getToken()
    };
  }
}

export const csrfProtection = new CSRFProtection();

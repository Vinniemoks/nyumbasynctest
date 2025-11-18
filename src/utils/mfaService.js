// Multi-Factor Authentication Service
// Implements TOTP (Time-based One-Time Password) for admin security

import { auditLogger } from './auditLogger';

/**
 * Generate a random secret key for TOTP
 * @returns {string} Base32 encoded secret
 */
export const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 alphabet
  let secret = '';
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < array.length; i++) {
    secret += chars[array[i] % chars.length];
  }
  
  return secret;
};

/**
 * Generate TOTP URI for QR code
 * @param {string} secret - Base32 encoded secret
 * @param {string} email - User email
 * @param {string} issuer - Application name
 * @returns {string} TOTP URI
 */
export const generateTOTPUri = (secret, email, issuer = 'NyumbaSync Admin') => {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
};

/**
 * Base32 decode helper
 */
const base32Decode = (encoded) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  
  for (let i = 0; i < encoded.length; i++) {
    const val = alphabet.indexOf(encoded.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  
  return bytes;
};

/**
 * Generate HMAC-SHA1
 */
const hmacSha1 = async (key, message) => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
};

/**
 * Generate TOTP code
 * @param {string} secret - Base32 encoded secret
 * @param {number} timeStep - Time step (default 30 seconds)
 * @returns {Promise<string>} 6-digit TOTP code
 */
export const generateTOTP = async (secret, timeStep = 30) => {
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / timeStep);
    
    // Convert time to 8-byte buffer
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, time, false);
    
    // Generate HMAC
    const hmac = await hmacSha1(key, new Uint8Array(timeBuffer));
    
    // Dynamic truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = (
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)
    ) % 1000000;
    
    return code.toString().padStart(6, '0');
  } catch (error) {
    console.error('TOTP generation error:', error);
    throw new Error('Failed to generate TOTP code');
  }
};

/**
 * Verify TOTP code with time window
 * @param {string} token - User provided token
 * @param {string} secret - Base32 encoded secret
 * @param {number} window - Time window (default 1 = ±30 seconds)
 * @returns {Promise<boolean>} Verification result
 */
export const verifyTOTP = async (token, secret, window = 1) => {
  try {
    const timeStep = 30;
    const epoch = Math.floor(Date.now() / 1000);
    const currentTime = Math.floor(epoch / timeStep);
    
    // Check current time and ±window
    for (let i = -window; i <= window; i++) {
      const time = currentTime + i;
      const key = base32Decode(secret);
      
      const timeBuffer = new ArrayBuffer(8);
      const timeView = new DataView(timeBuffer);
      timeView.setUint32(4, time, false);
      
      const hmac = await hmacSha1(key, new Uint8Array(timeBuffer));
      const offset = hmac[hmac.length - 1] & 0x0f;
      const code = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
      ) % 1000000;
      
      if (code.toString().padStart(6, '0') === token) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};

/**
 * Generate backup codes
 * @param {number} count - Number of codes to generate
 * @returns {string[]} Array of backup codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    
    for (let j = 0; j < 8; j++) {
      code += chars[array[j] % chars.length];
      if (j === 3) code += '-'; // Format: XXXX-XXXX
    }
    
    codes.push(code);
  }
  
  return codes;
};

/**
 * Hash backup code for storage
 * @param {string} code - Backup code
 * @returns {Promise<string>} Hashed code
 */
export const hashBackupCode = async (code) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify backup code
 * @param {string} code - User provided code
 * @param {string[]} hashedCodes - Array of hashed backup codes
 * @returns {Promise<{valid: boolean, index: number}>} Verification result
 */
export const verifyBackupCode = async (code, hashedCodes) => {
  const hashedInput = await hashBackupCode(code.toUpperCase().replace(/\s/g, ''));
  
  for (let i = 0; i < hashedCodes.length; i++) {
    if (hashedCodes[i] === hashedInput) {
      return { valid: true, index: i };
    }
  }
  
  return { valid: false, index: -1 };
};

/**
 * MFA Session Manager
 */
export class MFASessionManager {
  constructor() {
    this.MFA_PENDING_KEY = 'mfa_pending_session';
    this.MFA_VERIFIED_KEY = 'mfa_verified';
    this.MFA_ATTEMPTS_KEY = 'mfa_attempts';
    this.MAX_ATTEMPTS = 5;
    this.LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Store pending MFA session
   */
  setPendingSession(sessionData) {
    const data = {
      ...sessionData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    sessionStorage.setItem(this.MFA_PENDING_KEY, JSON.stringify(data));
    
    auditLogger.logAuth('mfa_session_created', {
      userId: sessionData.userId,
      email: sessionData.email
    });
  }

  /**
   * Get pending MFA session
   */
  getPendingSession() {
    const data = sessionStorage.getItem(this.MFA_PENDING_KEY);
    if (!data) return null;
    
    try {
      const session = JSON.parse(data);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.clearPendingSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Clear pending MFA session
   */
  clearPendingSession() {
    sessionStorage.removeItem(this.MFA_PENDING_KEY);
  }

  /**
   * Mark MFA as verified
   */
  setMFAVerified(userId) {
    const data = {
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem(this.MFA_VERIFIED_KEY, JSON.stringify(data));
    
    auditLogger.logAuth('mfa_verified', { userId });
  }

  /**
   * Check if MFA is verified
   */
  isMFAVerified(userId) {
    const data = localStorage.getItem(this.MFA_VERIFIED_KEY);
    if (!data) return false;
    
    try {
      const verified = JSON.parse(data);
      
      if (verified.userId !== userId) return false;
      if (Date.now() > verified.expiresAt) {
        this.clearMFAVerified();
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear MFA verified status
   */
  clearMFAVerified() {
    localStorage.removeItem(this.MFA_VERIFIED_KEY);
  }

  /**
   * Track failed MFA attempts
   */
  recordFailedAttempt(userId) {
    const key = `${this.MFA_ATTEMPTS_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    
    let attempts = { count: 0, firstAttempt: Date.now(), lockedUntil: null };
    
    if (data) {
      try {
        attempts = JSON.parse(data);
      } catch {
        // Reset if corrupted
      }
    }
    
    attempts.count++;
    
    // Lock account after max attempts
    if (attempts.count >= this.MAX_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
      
      auditLogger.logSecurity('mfa_account_locked', {
        userId,
        attempts: attempts.count,
        lockoutDuration: this.LOCKOUT_DURATION
      });
    }
    
    localStorage.setItem(key, JSON.stringify(attempts));
    
    auditLogger.logAuth('mfa_failed_attempt', {
      userId,
      attemptCount: attempts.count
    });
    
    return attempts;
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(userId) {
    const key = `${this.MFA_ATTEMPTS_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return false;
    
    try {
      const attempts = JSON.parse(data);
      
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        return {
          locked: true,
          remainingTime: attempts.lockedUntil - Date.now()
        };
      }
      
      // Clear expired lockout
      if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
        this.clearFailedAttempts(userId);
      }
      
      return { locked: false };
    } catch {
      return { locked: false };
    }
  }

  /**
   * Clear failed attempts
   */
  clearFailedAttempts(userId) {
    const key = `${this.MFA_ATTEMPTS_KEY}_${userId}`;
    localStorage.removeItem(key);
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(userId) {
    const key = `${this.MFA_ATTEMPTS_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return this.MAX_ATTEMPTS;
    
    try {
      const attempts = JSON.parse(data);
      return Math.max(0, this.MAX_ATTEMPTS - attempts.count);
    } catch {
      return this.MAX_ATTEMPTS;
    }
  }
}

export const mfaSessionManager = new MFASessionManager();

export default {
  generateSecret,
  generateTOTPUri,
  generateTOTP,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  mfaSessionManager
};

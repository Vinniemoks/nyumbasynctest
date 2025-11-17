/**
 * Security Audit Logger
 * Logs security-relevant events for monitoring and compliance
 */

class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.endpoint = import.meta.env.VITE_AUDIT_LOG_ENDPOINT;
  }

  /**
   * Log a security event
   */
  log(event) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...event
    };

    // Add to local logs
    this.logs.push(logEntry);
    
    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Send to server in production
    if (import.meta.env.VITE_ENVIRONMENT === 'production' && this.endpoint) {
      this.sendToServer(logEntry);
    }

    // Log to console in development
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.log('[Audit]', logEntry);
    }

    return logEntry;
  }

  /**
   * Log authentication events
   */
  logAuth(action, details = {}) {
    return this.log({
      category: 'authentication',
      action,
      severity: this.getAuthSeverity(action),
      ...details
    });
  }

  /**
   * Log payment events
   */
  logPayment(action, details = {}) {
    return this.log({
      category: 'payment',
      action,
      severity: 'high',
      ...details
    });
  }

  /**
   * Log security violations
   */
  logViolation(type, details = {}) {
    return this.log({
      category: 'security_violation',
      type,
      severity: 'critical',
      ...details
    });
  }

  /**
   * Log data access
   */
  logDataAccess(resource, action, details = {}) {
    return this.log({
      category: 'data_access',
      resource,
      action,
      severity: 'medium',
      ...details
    });
  }

  /**
   * Log failed attempts (rate limiting, validation, etc.)
   */
  logFailedAttempt(type, details = {}) {
    return this.log({
      category: 'failed_attempt',
      type,
      severity: 'medium',
      ...details
    });
  }

  /**
   * Get severity for auth actions
   */
  getAuthSeverity(action) {
    const highSeverity = ['login_failed', 'logout', 'token_expired', 'unauthorized_access'];
    return highSeverity.includes(action) ? 'high' : 'medium';
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send log to server
   */
  async sendToServer(logEntry) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      // Fail silently to not disrupt user experience
      console.error('Failed to send audit log:', error);
    }
  }

  /**
   * Get logs (for debugging)
   */
  getLogs(filter = {}) {
    let filtered = [...this.logs];

    if (filter.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter.severity) {
      filtered = filtered.filter(log => log.severity === filter.severity);
    }

    if (filter.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }

    return filtered;
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditLogger = new AuditLogger();

// Convenience methods
export const logAuth = (action, details) => auditLogger.logAuth(action, details);
export const logPayment = (action, details) => auditLogger.logPayment(action, details);
export const logViolation = (type, details) => auditLogger.logViolation(type, details);
export const logDataAccess = (resource, action, details) => auditLogger.logDataAccess(resource, action, details);
export const logFailedAttempt = (type, details) => auditLogger.logFailedAttempt(type, details);

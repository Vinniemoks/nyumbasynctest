/**
 * Secure Headers Utility
 * Helps configure and validate security headers
 */

export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Restrict browser features
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  
  // Force HTTPS (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Validate that security headers are present
 */
export async function validateSecurityHeaders(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = response.headers;
    
    const results = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Check each security header
    Object.entries(SECURITY_HEADERS).forEach(([header, expectedValue]) => {
      const actualValue = headers.get(header);
      
      if (!actualValue) {
        results.failed.push({
          header,
          reason: 'Header not present',
          severity: 'high'
        });
      } else if (header === 'Strict-Transport-Security' && !actualValue.includes('max-age')) {
        results.warnings.push({
          header,
          reason: 'HSTS max-age not set',
          severity: 'medium'
        });
      } else {
        results.passed.push(header);
      }
    });

    // Check for CSP
    const csp = headers.get('Content-Security-Policy');
    if (!csp) {
      results.failed.push({
        header: 'Content-Security-Policy',
        reason: 'CSP not configured',
        severity: 'critical'
      });
    } else {
      results.passed.push('Content-Security-Policy');
    }

    return results;
  } catch (error) {
    return {
      error: 'Failed to validate headers',
      message: error.message
    };
  }
}

/**
 * Check if running on HTTPS
 */
export function isSecureContext() {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext || window.location.protocol === 'https:';
}

/**
 * Enforce HTTPS in production
 */
export function enforceHTTPS() {
  if (typeof window === 'undefined') return;
  
  const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
  const isHTTP = window.location.protocol === 'http:';
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

  if (isProduction && isHTTP && !isLocalhost) {
    // Redirect to HTTPS
    window.location.href = window.location.href.replace('http://', 'https://');
  }
}

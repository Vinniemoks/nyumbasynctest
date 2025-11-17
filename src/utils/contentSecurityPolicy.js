/**
 * Content Security Policy (CSP) Configuration
 * Helps prevent XSS, clickjacking, and other code injection attacks
 */

export const CSP_CONFIG = {
  // Production CSP
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React
      'https://cdnjs.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled components
      'https://fonts.googleapis.com',
      'https://cdnjs.cloudflare.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'https://api.nyumbasync.com',
      'https://nyumbasync-backend.onrender.com',
      'wss://api.nyumbasync.com',
      'wss://nyumbasync-backend.onrender.com',
      'https://sentry.io',
      'https://*.sentry.io',
      'https://www.google-analytics.com'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': []
  },

  // Development CSP (more permissive)
  development: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:*', 'ws://localhost:*'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:', 'http:', 'blob:'],
    'connect-src': ["'self'", 'http://localhost:*', 'ws://localhost:*', 'wss://localhost:*'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(environment = 'production') {
  const config = CSP_CONFIG[environment] || CSP_CONFIG.production;
  
  return Object.entries(config)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * CSP violation reporter
 */
export function setupCSPReporting() {
  if (typeof window === 'undefined') return;

  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', (e) => {
    const violation = {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
      timestamp: new Date().toISOString()
    };

    // Log to console in development
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.warn('CSP Violation:', violation);
    }

    // Send to monitoring service in production
    if (import.meta.env.VITE_ENVIRONMENT === 'production') {
      // Send to Sentry or your monitoring service
      if (window.Sentry) {
        window.Sentry.captureMessage('CSP Violation', {
          level: 'warning',
          extra: violation
        });
      }
    }
  });
}

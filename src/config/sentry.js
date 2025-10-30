/**
 * Sentry Configuration for Error Tracking and Performance Monitoring
 * Install: npm install @sentry/react
 */

import environment from './environment';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Call this function in your main.jsx before rendering the app
 */
export const initSentry = async () => {
  // Only initialize Sentry if DSN is configured
  if (!environment.sentry.dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    // Dynamically import Sentry to avoid bundling in development
    const Sentry = await import('@sentry/react');

    Sentry.init({
      dsn: environment.sentry.dsn,
      environment: environment.sentry.environment,
      
      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: environment.sentry.tracesSampleRate,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: environment.sentry.replaysSessionSampleRate,
      replaysOnErrorSampleRate: environment.sentry.replaysOnErrorSampleRate,

      // Release tracking
      release: `nyumbasync@${environment.cache.version}`,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Don't send events in development
        if (environment.isDevelopment) {
          return null;
        }

        // Filter out sensitive information from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              // Remove sensitive payment data
              delete breadcrumb.data.cardNumber;
              delete breadcrumb.data.cvv;
              delete breadcrumb.data.pin;
              delete breadcrumb.data.password;
            }
            return breadcrumb;
          });
        }

        // Filter out sensitive information from request data
        if (event.request && event.request.data) {
          const data = event.request.data;
          if (typeof data === 'object') {
            delete data.cardNumber;
            delete data.cvv;
            delete data.pin;
            delete data.password;
          }
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Network errors that are expected
        'NetworkError',
        'Network request failed',
        // Cancelled requests
        'Request aborted',
        'AbortError',
      ],

      // Deny URLs - don't track errors from these sources
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
      ],
    });

    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Capture an exception manually
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export const captureException = async (error, context = {}) => {
  if (!environment.sentry.dsn) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.captureException(error, {
      contexts: context,
    });
  } catch (err) {
    console.error('Failed to capture exception:', err);
  }
};

/**
 * Capture a message manually
 * @param {string} message - The message to capture
 * @param {string} level - The severity level (info, warning, error)
 */
export const captureMessage = async (message, level = 'info') => {
  if (!environment.sentry.dsn) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.captureMessage(message, level);
  } catch (err) {
    console.error('Failed to capture message:', err);
  }
};

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
export const setUser = async (user) => {
  if (!environment.sentry.dsn) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    console.error('Failed to set user context:', err);
  }
};

/**
 * Clear user context
 */
export const clearUser = async () => {
  if (!environment.sentry.dsn) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.setUser(null);
  } catch (err) {
    console.error('Failed to clear user context:', err);
  }
};

/**
 * Add breadcrumb for debugging
 * @param {Object} breadcrumb - Breadcrumb data
 */
export const addBreadcrumb = async (breadcrumb) => {
  if (!environment.sentry.dsn) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.addBreadcrumb(breadcrumb);
  } catch (err) {
    console.error('Failed to add breadcrumb:', err);
  }
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
};

/**
 * Google Analytics Configuration
 * Handles analytics tracking for user interactions and page views
 */

import environment from './environment';

/**
 * Initialize Google Analytics
 */
export const initAnalytics = () => {
  if (!environment.analytics.enabled || !environment.analytics.googleAnalyticsId) {
    console.warn('Google Analytics not configured or disabled');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.analytics.googleAnalyticsId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', environment.analytics.googleAnalyticsId, {
    send_page_view: false, // We'll manually track page views
    anonymize_ip: true, // Anonymize IP addresses for privacy
  });

  console.log('Google Analytics initialized');
};

/**
 * Track page view
 * @param {string} path - The page path
 * @param {string} title - The page title
 */
export const trackPageView = (path, title) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
};

/**
 * Track custom event
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Event label (optional)
 * @param {number} value - Event value (optional)
 */
export const trackEvent = (category, action, label = null, value = null) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  const eventParams = {
    event_category: category,
    event_label: label,
  };

  if (value !== null) {
    eventParams.value = value;
  }

  window.gtag('event', action, eventParams);
};

/**
 * Track payment event
 * @param {string} method - Payment method (mpesa, airtel, telkom, card)
 * @param {number} amount - Payment amount
 * @param {string} status - Payment status (success, failed)
 */
export const trackPayment = (method, amount, status) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'payment', {
    payment_method: method,
    value: amount,
    currency: 'KES',
    status: status,
  });
};

/**
 * Track maintenance request
 * @param {string} category - Maintenance category
 * @param {string} priority - Request priority
 */
export const trackMaintenanceRequest = (category, priority) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'maintenance_request', {
    category: category,
    priority: priority,
  });
};

/**
 * Track document upload
 * @param {string} category - Document category
 * @param {string} fileType - File type
 */
export const trackDocumentUpload = (category, fileType) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'document_upload', {
    category: category,
    file_type: fileType,
  });
};

/**
 * Track user timing (performance metrics)
 * @param {string} category - Timing category
 * @param {string} variable - Timing variable
 * @param {number} time - Time in milliseconds
 */
export const trackTiming = (category, variable, time) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'timing_complete', {
    name: variable,
    value: time,
    event_category: category,
  });
};

/**
 * Track errors
 * @param {string} description - Error description
 * @param {boolean} fatal - Whether the error is fatal
 */
export const trackError = (description, fatal = false) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('event', 'exception', {
    description: description,
    fatal: fatal,
  });
};

/**
 * Set user properties
 * @param {Object} properties - User properties
 */
export const setUserProperties = (properties) => {
  if (!environment.analytics.enabled || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackPayment,
  trackMaintenanceRequest,
  trackDocumentUpload,
  trackTiming,
  trackError,
  setUserProperties,
};

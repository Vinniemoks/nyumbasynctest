# Monitoring and Error Tracking Setup Guide

This guide covers the setup and configuration of monitoring, error tracking, and analytics for the NyumbaSync Tenant Portal.

## Table of Contents

1. [Sentry Error Tracking](#sentry-error-tracking)
2. [Google Analytics](#google-analytics)
3. [Performance Monitoring](#performance-monitoring)
4. [Custom Monitoring](#custom-monitoring)
5. [Alerts and Notifications](#alerts-and-notifications)

## Sentry Error Tracking

### Installation

```bash
npm install @sentry/react
```

### Configuration

The Sentry configuration is already set up in `src/config/sentry.js`. To enable it:

1. **Create Sentry Account**
   - Visit https://sentry.io/
   - Create a new project (React)
   - Copy your DSN

2. **Configure Environment Variables**
   ```env
   VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
   VITE_SENTRY_ENVIRONMENT=production
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
   VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
   VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
   ```

3. **Initialize in Application**
   
   Update `src/main.jsx`:
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import { initSentry } from './config/sentry';
   import './index.css';

   // Initialize Sentry before rendering
   initSentry().then(() => {
     ReactDOM.createRoot(document.getElementById('root')).render(
       <React.StrictMode>
         <App />
       </React.StrictMode>
     );
   });
   ```

### Usage Examples

#### Capture Exceptions
```javascript
import { captureException } from './config/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, {
    tags: {
      section: 'payment',
      method: 'mpesa'
    }
  });
}
```

#### Capture Messages
```javascript
import { captureMessage } from './config/sentry';

captureMessage('Payment processing started', 'info');
```

#### Set User Context
```javascript
import { setUser } from './config/sentry';

// After user logs in
setUser({
  id: user.id,
  email: user.email,
  username: user.username
});
```

#### Add Breadcrumbs
```javascript
import { addBreadcrumb } from './config/sentry';

addBreadcrumb({
  category: 'payment',
  message: 'User initiated M-Pesa payment',
  level: 'info',
  data: {
    amount: 5000,
    method: 'mpesa'
  }
});
```

### Sentry Dashboard Configuration

1. **Set Up Alerts**
   - Go to Alerts > Create Alert Rule
   - Configure for:
     - New issues
     - High error rate
     - Performance degradation

2. **Configure Integrations**
   - Slack: Get notifications in Slack
   - Email: Email notifications for critical errors
   - PagerDuty: For on-call alerts

3. **Set Up Releases**
   ```bash
   # Install Sentry CLI
   npm install -g @sentry/cli

   # Create release
   sentry-cli releases new "nyumbasync@1.0.0"
   
   # Upload source maps
   sentry-cli releases files "nyumbasync@1.0.0" upload-sourcemaps ./docs/assets
   
   # Finalize release
   sentry-cli releases finalize "nyumbasync@1.0.0"
   ```

## Google Analytics

### Configuration

The Google Analytics configuration is already set up in `src/config/analytics.js`.

1. **Create GA4 Property**
   - Visit https://analytics.google.com/
   - Create new GA4 property
   - Copy Measurement ID (G-XXXXXXXXXX)

2. **Configure Environment Variables**
   ```env
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   VITE_ENABLE_ANALYTICS=true
   ```

3. **Initialize in Application**
   
   Update `src/main.jsx`:
   ```javascript
   import { initAnalytics } from './config/analytics';

   // Initialize analytics
   initAnalytics();
   ```

### Usage Examples

#### Track Page Views
```javascript
import { trackPageView } from './config/analytics';

// In your router or component
trackPageView('/tenant/dashboard', 'Tenant Dashboard');
```

#### Track Events
```javascript
import { trackEvent } from './config/analytics';

trackEvent('Payment', 'Initiated', 'M-Pesa', 5000);
```

#### Track Payments
```javascript
import { trackPayment } from './config/analytics';

trackPayment('mpesa', 5000, 'success');
```

#### Track Maintenance Requests
```javascript
import { trackMaintenanceRequest } from './config/analytics';

trackMaintenanceRequest('plumbing', 'high');
```

### Google Analytics Dashboard Setup

1. **Create Custom Reports**
   - Payment success rate
   - Maintenance request volume
   - User engagement metrics
   - Page load times

2. **Set Up Goals**
   - Successful payment completion
   - Maintenance request submission
   - Document upload
   - Lease renewal

3. **Configure Audiences**
   - Active tenants
   - High-value tenants
   - Tenants with pending payments

## Performance Monitoring

### Web Vitals Tracking

Create `src/utils/webVitals.js`:

```javascript
import { trackTiming } from '../config/analytics';
import { addBreadcrumb } from '../config/sentry';

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Track Web Vitals
export const trackWebVitals = () => {
  reportWebVitals((metric) => {
    // Send to Google Analytics
    trackTiming('Web Vitals', metric.name, Math.round(metric.value));

    // Add breadcrumb to Sentry
    addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${Math.round(metric.value)}ms`,
      level: 'info',
      data: metric
    });

    // Log poor performance
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name}:`, metric.value);
    }
  });
};
```

Initialize in `src/main.jsx`:
```javascript
import { trackWebVitals } from './utils/webVitals';

// Track Web Vitals
trackWebVitals();
```

### Custom Performance Tracking

```javascript
import { trackTiming } from './config/analytics';

// Track API response time
const startTime = performance.now();
await api.get('/tenant/rent/current');
const endTime = performance.now();
trackTiming('API', 'rent_current', endTime - startTime);

// Track component render time
const renderStart = performance.now();
// Component render
const renderEnd = performance.now();
trackTiming('Component', 'RentDashboard', renderEnd - renderStart);
```

## Custom Monitoring

### API Monitoring

Create `src/utils/apiMonitoring.js`:

```javascript
import { captureException, addBreadcrumb } from '../config/sentry';
import { trackEvent, trackTiming } from '../config/analytics';

export const monitorApiCall = async (endpoint, method, requestFn) => {
  const startTime = performance.now();
  
  addBreadcrumb({
    category: 'api',
    message: `${method} ${endpoint}`,
    level: 'info'
  });

  try {
    const response = await requestFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track successful API call
    trackTiming('API', endpoint, duration);
    trackEvent('API', 'Success', endpoint);

    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track failed API call
    trackEvent('API', 'Error', endpoint);
    trackTiming('API', `${endpoint}_error`, duration);

    // Capture exception
    captureException(error, {
      tags: {
        endpoint,
        method,
        duration
      }
    });

    throw error;
  }
};
```

Usage:
```javascript
import { monitorApiCall } from './utils/apiMonitoring';

const fetchRentData = () => {
  return monitorApiCall('/tenant/rent/current', 'GET', () => {
    return api.get('/tenant/rent/current');
  });
};
```

### Payment Monitoring

Create `src/utils/paymentMonitoring.js`:

```javascript
import { captureException, addBreadcrumb } from '../config/sentry';
import { trackPayment, trackEvent } from '../config/analytics';

export const monitorPayment = async (method, amount, paymentFn) => {
  addBreadcrumb({
    category: 'payment',
    message: `Initiating ${method} payment for ${amount}`,
    level: 'info',
    data: { method, amount }
  });

  const startTime = performance.now();

  try {
    const result = await paymentFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track successful payment
    trackPayment(method, amount, 'success');
    trackEvent('Payment', 'Success', method, amount);

    addBreadcrumb({
      category: 'payment',
      message: `Payment successful: ${method}`,
      level: 'info',
      data: { method, amount, duration, transactionId: result.transactionId }
    });

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track failed payment
    trackPayment(method, amount, 'failed');
    trackEvent('Payment', 'Failed', method, amount);

    // Capture exception with context
    captureException(error, {
      tags: {
        payment_method: method,
        amount,
        duration
      },
      contexts: {
        payment: {
          method,
          amount,
          duration,
          error_message: error.message
        }
      }
    });

    throw error;
  }
};
```

## Alerts and Notifications

### Sentry Alerts

Configure alerts in Sentry dashboard:

1. **Critical Errors**
   - Condition: New issue with level = error
   - Action: Send to Slack + Email
   - Frequency: Immediately

2. **High Error Rate**
   - Condition: Error rate > 5% in 5 minutes
   - Action: Send to Slack + PagerDuty
   - Frequency: Once per hour

3. **Performance Degradation**
   - Condition: P95 response time > 3 seconds
   - Action: Send to Slack
   - Frequency: Once per 30 minutes

### Custom Alerts

Create `src/utils/alerting.js`:

```javascript
import { captureMessage } from '../config/sentry';

export const sendAlert = (level, message, context = {}) => {
  // Log to console
  console[level](message, context);

  // Send to Sentry
  captureMessage(message, level);

  // Could also send to custom alerting service
  if (level === 'error' || level === 'critical') {
    // Send to custom alerting endpoint
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, context, timestamp: new Date() })
    }).catch(console.error);
  }
};

// Usage
sendAlert('error', 'Payment gateway timeout', {
  gateway: 'mpesa',
  amount: 5000,
  userId: 'user123'
});
```

### Health Check Monitoring

Create `src/utils/healthCheck.js`:

```javascript
import environment from '../config/environment';

export const performHealthCheck = async () => {
  const checks = {
    api: false,
    socket: false,
    storage: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Check API
    const apiResponse = await fetch(`${environment.api.baseUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });
    checks.api = apiResponse.ok;
  } catch (error) {
    console.error('API health check failed:', error);
  }

  try {
    // Check WebSocket
    checks.socket = socketService.getConnectionStatus();
  } catch (error) {
    console.error('Socket health check failed:', error);
  }

  try {
    // Check file storage
    const storageResponse = await fetch(`${environment.storage.url}/health.txt`, {
      method: 'HEAD',
      timeout: 5000
    });
    checks.storage = storageResponse.ok;
  } catch (error) {
    console.error('Storage health check failed:', error);
  }

  return checks;
};

// Run health check every 5 minutes
setInterval(async () => {
  const health = await performHealthCheck();
  
  if (!health.api || !health.socket) {
    sendAlert('warning', 'Service health check failed', health);
  }
}, 5 * 60 * 1000);
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Application Health**
   - Uptime percentage
   - Error rate
   - Response time (P50, P95, P99)
   - Active users

2. **Payment Metrics**
   - Payment success rate by method
   - Average payment processing time
   - Failed payment reasons
   - Total transaction volume

3. **User Engagement**
   - Daily active users
   - Feature usage (maintenance requests, document uploads, etc.)
   - Session duration
   - Bounce rate

4. **Performance Metrics**
   - Page load time
   - Time to interactive
   - Largest contentful paint
   - Cumulative layout shift

5. **Business Metrics**
   - Rent collection rate
   - Maintenance request resolution time
   - Document upload volume
   - Lease renewal rate

### Recommended Tools

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and engagement
- **Datadog**: Infrastructure and application monitoring
- **Grafana**: Custom dashboards and visualizations
- **PagerDuty**: Incident management and on-call alerts

## Best Practices

1. **Don't Over-Monitor**
   - Focus on actionable metrics
   - Avoid alert fatigue
   - Set appropriate thresholds

2. **Privacy Considerations**
   - Anonymize user data
   - Don't log sensitive information (passwords, card numbers, PINs)
   - Comply with GDPR/data protection regulations

3. **Performance Impact**
   - Use sampling for high-volume events
   - Batch analytics events
   - Lazy-load monitoring scripts

4. **Regular Review**
   - Review alerts weekly
   - Adjust thresholds based on patterns
   - Archive old data

5. **Documentation**
   - Document what each metric means
   - Create runbooks for common issues
   - Keep contact information updated

## Troubleshooting

### Sentry Not Receiving Events

- Verify DSN is correct
- Check network requests in browser DevTools
- Ensure Sentry is initialized before errors occur
- Check browser console for Sentry errors

### Google Analytics Not Tracking

- Verify Measurement ID is correct
- Check if ad blockers are interfering
- Ensure gtag script is loaded
- Check Real-Time reports in GA dashboard

### High Error Rate

- Check Sentry dashboard for error patterns
- Review recent deployments
- Check API server status
- Review error logs

## Support

For monitoring setup support:
- Sentry Documentation: https://docs.sentry.io/
- Google Analytics Help: https://support.google.com/analytics/
- Internal Support: support@nyumbasync.com

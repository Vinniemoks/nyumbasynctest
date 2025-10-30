# Integration Guide - Sentry and Analytics

This guide shows you how to integrate Sentry error tracking and Google Analytics into your NyumbaSync application.

## Prerequisites

The configuration files are already created:
- `src/config/sentry.js` - Sentry configuration
- `src/config/analytics.js` - Google Analytics configuration
- `src/config/environment.js` - Environment variables

## Step 1: Install Sentry (Optional but Recommended)

```bash
npm install @sentry/react
```

## Step 2: Update main.jsx

Replace your current `src/main.jsx` with the following:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry } from './config/sentry';
import { initAnalytics } from './config/analytics';
import './index.css';

// Initialize monitoring services
const initializeApp = async () => {
  // Initialize Sentry for error tracking (if configured)
  await initSentry();

  // Initialize Google Analytics (if configured)
  initAnalytics();

  // Render the application
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start the application
initializeApp();
```

## Step 3: Configure Environment Variables

### For Development (Optional)

Create or update `.env`:

```env
# Monitoring (optional in development)
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
VITE_ENABLE_ANALYTICS=false
```

### For Production (Required)

Update `.env.production`:

```env
# Monitoring (required for production)
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true
```

## Step 4: Track Page Views (Optional)

Update your router to track page views automatically.

In `src/App.jsx`, add:

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './config/analytics';

function App() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  // ... rest of your App component
}
```

## Step 5: Track User Context (Optional)

After user login, set user context for better error tracking.

In your login/authentication logic:

```javascript
import { setUser } from './config/sentry';
import { setUserProperties } from './config/analytics';

// After successful login
const handleLoginSuccess = (user) => {
  // Set user context in Sentry
  setUser({
    id: user.id,
    email: user.email,
    username: user.username
  });

  // Set user properties in Analytics
  setUserProperties({
    user_role: user.role,
    user_type: user.type
  });

  // ... rest of your login logic
};
```

## Step 6: Track Custom Events (Optional)

### Track Payment Events

In your payment components:

```javascript
import { trackPayment } from './config/analytics';
import { addBreadcrumb } from './config/sentry';

const handlePayment = async (method, amount) => {
  try {
    // Add breadcrumb for debugging
    addBreadcrumb({
      category: 'payment',
      message: `Initiating ${method} payment`,
      data: { method, amount }
    });

    // Process payment
    const result = await processPayment(method, amount);

    // Track successful payment
    trackPayment(method, amount, 'success');

    return result;
  } catch (error) {
    // Track failed payment
    trackPayment(method, amount, 'failed');
    throw error;
  }
};
```

### Track Maintenance Requests

In your maintenance request components:

```javascript
import { trackMaintenanceRequest } from './config/analytics';

const handleSubmitRequest = async (category, priority) => {
  // Submit request
  await submitMaintenanceRequest(category, priority);

  // Track the event
  trackMaintenanceRequest(category, priority);
};
```

### Track Document Uploads

In your document upload components:

```javascript
import { trackDocumentUpload } from './config/analytics';

const handleDocumentUpload = async (category, file) => {
  // Upload document
  await uploadDocument(category, file);

  // Track the event
  trackDocumentUpload(category, file.type);
};
```

## Step 7: Enhanced Error Handling (Optional)

Wrap critical operations with error tracking:

```javascript
import { captureException } from './config/sentry';

const criticalOperation = async () => {
  try {
    // Your critical code
    await someImportantOperation();
  } catch (error) {
    // Capture exception with context
    captureException(error, {
      tags: {
        operation: 'critical_operation',
        severity: 'high'
      },
      contexts: {
        operation: {
          name: 'someImportantOperation',
          timestamp: new Date().toISOString()
        }
      }
    });

    // Re-throw or handle the error
    throw error;
  }
};
```

## Step 8: Test the Integration

### Test Sentry (if installed)

1. Add a test error button in your app:
   ```javascript
   <button onClick={() => {
     throw new Error('Test Sentry Error');
   }}>
     Test Sentry
   </button>
   ```

2. Click the button
3. Check your Sentry dashboard for the error

### Test Google Analytics

1. Visit your application
2. Navigate to different pages
3. Check Google Analytics Real-Time reports
4. Verify page views are being tracked

## Step 9: Production Deployment

When deploying to production:

1. Ensure Sentry DSN is configured
2. Ensure Google Analytics ID is configured
3. Build with production environment:
   ```bash
   npm run build:production
   ```

4. Deploy the `docs` directory

## Monitoring Best Practices

### What to Track

**Always Track:**
- Critical errors
- Payment transactions
- User authentication events
- API failures

**Consider Tracking:**
- Feature usage
- User flows
- Performance metrics
- Business metrics

### What NOT to Track

**Never Track:**
- Passwords
- Credit card numbers
- CVV codes
- PINs
- Personal identification numbers
- Social security numbers

### Privacy Considerations

- Anonymize IP addresses (already configured)
- Don't track sensitive user data
- Comply with GDPR/privacy regulations
- Provide opt-out mechanisms if required

## Troubleshooting

### Sentry Not Working

**Issue**: Errors not appearing in Sentry

**Solutions**:
1. Verify Sentry is installed: `npm list @sentry/react`
2. Check DSN is correct in environment variables
3. Ensure `initSentry()` is called before app renders
4. Check browser console for Sentry errors
5. Verify network requests in DevTools

### Analytics Not Working

**Issue**: Page views not appearing in Google Analytics

**Solutions**:
1. Verify GA ID is correct
2. Check if ad blockers are interfering
3. Ensure `initAnalytics()` is called
4. Check Real-Time reports (not historical)
5. Verify gtag script is loaded in Network tab

### Performance Impact

**Issue**: Monitoring slowing down the app

**Solutions**:
1. Use sampling for high-volume events
2. Lazy-load monitoring scripts
3. Batch analytics events
4. Reduce trace sample rate in Sentry

## Optional Enhancements

### Web Vitals Tracking

Create `src/utils/webVitals.js`:

```javascript
import { trackTiming } from '../config/analytics';

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

export const trackWebVitals = () => {
  reportWebVitals((metric) => {
    trackTiming('Web Vitals', metric.name, Math.round(metric.value));
  });
};
```

Then in `main.jsx`:
```javascript
import { trackWebVitals } from './utils/webVitals';

// After app initialization
trackWebVitals();
```

### Custom Error Boundary

Create `src/components/ErrorBoundary.jsx`:

```javascript
import React from 'react';
import { captureException } from '../config/sentry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We've been notified and are working on a fix.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Wrap your app:
```javascript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Summary

You now have:
- ✅ Sentry error tracking configured
- ✅ Google Analytics configured
- ✅ Custom event tracking
- ✅ User context tracking
- ✅ Performance monitoring
- ✅ Privacy-compliant tracking

The monitoring will work automatically once you:
1. Install Sentry (optional): `npm install @sentry/react`
2. Update `main.jsx` with initialization code
3. Configure environment variables
4. Deploy to production

For more details, see:
- [MONITORING_SETUP.md](MONITORING_SETUP.md) - Complete monitoring guide
- [DEPLOYMENT_CONFIGURATION.md](DEPLOYMENT_CONFIGURATION.md) - Deployment setup

---

**Note**: Monitoring is optional but highly recommended for production applications. It helps you identify and fix issues quickly, improving user experience.

# Error Handling and Loading States Guide

This guide explains the error handling and loading state system implemented for the Tenant Portal.

## Overview

The error handling system provides:
- **Error Boundaries**: Catch React component errors without crashing the app
- **API Error Handling**: Standardized handling of HTTP errors (401, 403, 404, 500, etc.)
- **Loading States**: Spinners and skeleton screens for better UX
- **User-Friendly Messages**: Clear, actionable error messages for users

## Components

### 1. ErrorBoundary (Global)
Located: `src/components/ErrorBoundary.jsx`

Catches errors at the application level. Already implemented in `App.jsx`.

**Usage:**
```jsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 2. SectionErrorBoundary
Located: `src/components/SectionErrorBoundary.jsx`

Catches errors in specific sections without affecting the entire app.

**Usage:**
```jsx
<SectionErrorBoundary 
  section="Rent Management" 
  title="Rent Dashboard Error"
  message="Unable to load rent information"
  onRetry={handleRetry}
>
  <RentDashboard />
</SectionErrorBoundary>
```

**Props:**
- `section` (string): Name of the section for logging
- `title` (string): Error title to display
- `message` (string): Error message to display
- `onRetry` (function): Optional retry callback

### 3. LoadingSpinner
Located: `src/components/LoadingSpinner.jsx`

Displays a loading spinner with optional text.

**Usage:**
```jsx
import LoadingSpinner from './components/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With custom size and text
<LoadingSpinner size="lg" text="Loading data..." />

// Full screen overlay
<LoadingSpinner fullScreen text="Processing payment..." />
```

**Props:**
- `size` (string): 'sm', 'md', 'lg', 'xl' (default: 'md')
- `text` (string): Loading message (default: 'Loading...')
- `fullScreen` (boolean): Show as full-screen overlay (default: false)

### 4. Skeleton Loaders
Located: `src/components/SkeletonLoader.jsx`

Provides skeleton screens for different content types.

**Available Components:**
- `Skeleton`: Base skeleton element
- `SkeletonCard`: Card layout skeleton
- `SkeletonTable`: Table skeleton
- `SkeletonList`: List skeleton
- `SkeletonDashboard`: Dashboard skeleton
- `SkeletonForm`: Form skeleton

**Usage:**
```jsx
import { SkeletonCard, SkeletonList } from './components/SkeletonLoader';

{loading ? (
  <SkeletonCard />
) : (
  <ActualCard data={data} />
)}
```

### 5. ErrorDisplay
Located: `src/components/ErrorDisplay.jsx`

Displays user-friendly error messages with retry options.

**Usage:**
```jsx
import ErrorDisplay from './components/ErrorDisplay';

{error && (
  <ErrorDisplay
    error={error}
    onRetry={handleRetry}
    onDismiss={() => setError(null)}
    showDetails={process.env.NODE_ENV === 'development'}
  />
)}
```

**Props:**
- `error` (object): Error object from API handler
- `onRetry` (function): Retry callback
- `onDismiss` (function): Dismiss callback
- `showDetails` (boolean): Show technical details (default: false)

## Hooks

### useApiCall
Located: `src/hooks/useApiCall.js`

Custom hook for handling API calls with automatic error handling and loading states.

**Usage:**
```jsx
import { useApiCall } from './hooks/useApiCall';
import api from './api/api';

function MyComponent() {
  const { data, loading, error, execute, reset } = useApiCall(
    api.getRentPayments,
    {
      onSuccess: (data) => {
        console.log('Success:', data);
      },
      onError: (error) => {
        console.error('Error:', error);
      }
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={execute} />;
  
  return <div>{/* Render data */}</div>;
}
```

**Returns:**
- `data`: Response data
- `loading`: Loading state (boolean)
- `error`: Error object (null if no error)
- `execute`: Function to call the API
- `reset`: Function to reset state

### useFetch
Located: `src/hooks/useApiCall.js`

Automatically fetches data on component mount.

**Usage:**
```jsx
import { useFetch } from './hooks/useApiCall';
import api from './api/api';

function MyComponent() {
  const { data, loading, error, refetch } = useFetch(
    api.getMaintenanceRequests,
    {
      dependencies: [], // Re-fetch when these change
      skip: false, // Skip initial fetch if true
      onSuccess: (data) => console.log('Loaded:', data)
    }
  );

  if (loading) return <SkeletonList />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  
  return <div>{/* Render data */}</div>;
}
```

## API Error Handler
Located: `src/utils/apiErrorHandler.js`

Standardizes API error handling across the application.

**Error Types:**
- `network`: No internet connection
- `auth`: 401 - Authentication required
- `forbidden`: 403 - Access denied
- `not_found`: 404 - Resource not found
- `validation`: 422 - Validation error
- `rate_limit`: 429 - Too many requests
- `server`: 500+ - Server error

**Usage:**
```jsx
import { handleApiError } from './utils/apiErrorHandler';

try {
  const data = await api.getSomething();
} catch (err) {
  const error = handleApiError(err, navigate);
  setError(error);
}
```

## Common Patterns

### Pattern 1: Simple Data Fetching
```jsx
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getData();
        setData(result);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchData} />;
  
  return <div>{/* Render data */}</div>;
}
```

### Pattern 2: Using useApiCall Hook
```jsx
function MyComponent() {
  const { data, loading, error, execute } = useApiCall(api.getData);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={execute} />;
  
  return <div>{/* Render data */}</div>;
}
```

### Pattern 3: Form Submission with Error Handling
```jsx
function MyForm() {
  const { loading, error, execute } = useApiCall(api.submitForm);

  const handleSubmit = async (formData) => {
    const result = await execute(formData);
    
    if (result.success) {
      // Handle success
      navigate('/success');
    }
    // Error is automatically set in state
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorDisplay error={error} onDismiss={() => {}} />}
      
      {/* Form fields */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Pattern 4: Skeleton Loading
```jsx
function MyList() {
  const { data, loading, error, refetch } = useFetch(api.getList);

  if (loading) return <SkeletonList items={5} />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  
  return (
    <div>
      {data.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## HTTP Status Code Handling

The system automatically handles these status codes:

- **401 Unauthorized**: Redirects to login, clears auth token
- **403 Forbidden**: Shows access denied message
- **404 Not Found**: Shows resource not found message
- **422 Validation Error**: Shows validation errors with field details
- **429 Too Many Requests**: Shows rate limit message with retry time
- **500-504 Server Errors**: Shows server error with retry option
- **Network Error**: Shows offline message with retry option

## Best Practices

1. **Always wrap routes in SectionErrorBoundary** (already done in TenantDashboard)
2. **Use skeleton loaders for better perceived performance**
3. **Provide retry options for recoverable errors**
4. **Show specific error messages when possible**
5. **Log errors to console in development mode**
6. **Use useApiCall hook for consistent error handling**
7. **Test error scenarios during development**

## Testing Error Scenarios

To test different error scenarios:

1. Navigate to `/error-demo` (if route is added)
2. Use the ErrorHandlingDemo component
3. Simulate different error types
4. Verify error messages and retry functionality

## Future Enhancements

- Error reporting to external service (e.g., Sentry)
- Offline mode detection and handling
- Retry with exponential backoff
- Error analytics and monitoring
- Custom error pages for specific scenarios

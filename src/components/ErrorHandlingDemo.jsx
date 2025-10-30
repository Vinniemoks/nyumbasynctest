import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { SkeletonCard, SkeletonList, SkeletonTable, SkeletonDashboard } from './SkeletonLoader';
import ErrorDisplay from './ErrorDisplay';
import SectionErrorBoundary from './SectionErrorBoundary';

/**
 * Demo component showing error handling and loading states
 * This is for demonstration purposes only
 */
const ErrorHandlingDemo = () => {
  const [showError, setShowError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [errorType, setErrorType] = useState('network');

  const mockErrors = {
    network: {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'network',
      statusCode: 0,
      canRetry: true
    },
    auth: {
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      type: 'auth',
      statusCode: 401,
      canRetry: false,
      action: 'redirect_login'
    },
    forbidden: {
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
      type: 'forbidden',
      statusCode: 403,
      canRetry: false
    },
    not_found: {
      title: 'Not Found',
      message: 'The requested resource was not found.',
      type: 'not_found',
      statusCode: 404,
      canRetry: false
    },
    server: {
      title: 'Server Error',
      message: 'The server encountered an error. Please try again later.',
      type: 'server',
      statusCode: 500,
      canRetry: true
    },
    validation: {
      title: 'Validation Error',
      message: 'Please check your input and try again.',
      type: 'validation',
      statusCode: 422,
      canRetry: true,
      errors: {
        email: 'Invalid email format',
        password: 'Password must be at least 8 characters'
      }
    }
  };

  const ComponentThatThrows = () => {
    throw new Error('This is a test error from a component');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Error Handling & Loading States Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the error handling and loading state components
          implemented for the tenant portal.
        </p>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Error Type
            </label>
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="network">Network Error</option>
              <option value="auth">Authentication Error (401)</option>
              <option value="forbidden">Forbidden (403)</option>
              <option value="not_found">Not Found (404)</option>
              <option value="server">Server Error (500)</option>
              <option value="validation">Validation Error (422)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Toggle States
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setShowError(!showError)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                {showError ? 'Hide' : 'Show'} Error
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loading States
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setShowLoading(!showLoading)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {showLoading ? 'Hide' : 'Show'} Spinner
              </button>
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                {showSkeleton ? 'Hide' : 'Show'} Skeleton
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {showError && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Display</h2>
          <ErrorDisplay
            error={mockErrors[errorType]}
            onRetry={() => alert('Retry clicked')}
            onDismiss={() => setShowError(false)}
            showDetails={true}
          />
        </div>
      )}

      {/* Loading Spinner */}
      {showLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loading Spinners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small</p>
              <LoadingSpinner size="sm" text="" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium</p>
              <LoadingSpinner size="md" text="" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large</p>
              <LoadingSpinner size="lg" text="" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Extra Large</p>
              <LoadingSpinner size="xl" text="" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">With Text</p>
            <LoadingSpinner size="md" text="Loading data..." />
          </div>
        </div>
      )}

      {/* Skeleton Loaders */}
      {showSkeleton && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skeleton Card</h2>
            <SkeletonCard />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skeleton List</h2>
            <SkeletonList items={3} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skeleton Table</h2>
            <SkeletonTable rows={5} columns={4} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skeleton Dashboard</h2>
            <SkeletonDashboard />
          </div>
        </div>
      )}

      {/* Error Boundary Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Section Error Boundary
        </h2>
        <p className="text-gray-600 mb-4">
          This demonstrates how errors in individual sections are caught and displayed
          without crashing the entire application.
        </p>
        
        <SectionErrorBoundary
          section="Demo Section"
          title="Section Error"
          message="This section encountered an error. You can retry or continue using other parts of the application."
        >
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">
              This content is wrapped in an error boundary. Click the button below to
              trigger an error and see how it's handled.
            </p>
            <button
              onClick={() => {
                throw new Error('Test error from button click');
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Trigger Error
            </button>
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Usage Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Usage Examples
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">1. Using LoadingSpinner</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-x-auto">
{`import LoadingSpinner from './components/LoadingSpinner';

{loading && <LoadingSpinner size="md" text="Loading..." />}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">2. Using ErrorDisplay</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-x-auto">
{`import ErrorDisplay from './components/ErrorDisplay';

{error && (
  <ErrorDisplay
    error={error}
    onRetry={handleRetry}
    onDismiss={() => setError(null)}
  />
)}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">3. Using useApiCall Hook</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-x-auto">
{`import { useApiCall } from './hooks/useApiCall';
import api from './api/api';

const { data, loading, error, execute } = useApiCall(
  api.getRentPayments,
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  }
);

// Call the API
await execute();`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">4. Using Skeleton Loaders</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-x-auto">
{`import { SkeletonCard } from './components/SkeletonLoader';

{loading ? <SkeletonCard /> : <ActualContent data={data} />}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;

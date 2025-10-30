// API Error Handler Utility

export class ApiError extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export const handleApiError = (error, navigate = null) => {
  // Network error (no response from server)
  if (!error.response && error.message === 'Network Error') {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'network',
      statusCode: 0,
      canRetry: true
    };
  }

  // No response object (generic error)
  if (!error.response) {
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      statusCode: 0,
      canRetry: true
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      // Unauthorized - redirect to login
      if (navigate) {
        localStorage.removeItem('authToken');
        navigate('/login', { 
          state: { message: 'Your session has expired. Please log in again.' }
        });
      }
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again.',
        type: 'auth',
        statusCode: 401,
        canRetry: false,
        action: 'redirect_login'
      };

    case 403:
      // Forbidden - access denied
      return {
        title: 'Access Denied',
        message: data?.message || 'You do not have permission to access this resource.',
        type: 'forbidden',
        statusCode: 403,
        canRetry: false
      };

    case 404:
      // Not found
      return {
        title: 'Not Found',
        message: data?.message || 'The requested resource was not found.',
        type: 'not_found',
        statusCode: 404,
        canRetry: false
      };

    case 422:
      // Validation error
      return {
        title: 'Validation Error',
        message: data?.message || 'Please check your input and try again.',
        type: 'validation',
        statusCode: 422,
        canRetry: true,
        errors: data?.errors || {}
      };

    case 429:
      // Too many requests
      return {
        title: 'Too Many Requests',
        message: 'You have made too many requests. Please wait a moment and try again.',
        type: 'rate_limit',
        statusCode: 429,
        canRetry: true,
        retryAfter: error.response.headers['retry-after'] || 60
      };

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      return {
        title: 'Server Error',
        message: data?.message || 'The server encountered an error. Please try again later.',
        type: 'server',
        statusCode: status,
        canRetry: true
      };

    default:
      // Other errors
      return {
        title: 'Error',
        message: data?.message || 'An error occurred. Please try again.',
        type: 'unknown',
        statusCode: status,
        canRetry: true
      };
  }
};

export const getErrorMessage = (error) => {
  const errorInfo = handleApiError(error);
  return errorInfo.message;
};

export const isNetworkError = (error) => {
  return !error.response && error.message === 'Network Error';
};

export const isAuthError = (error) => {
  return error.response?.status === 401;
};

export const shouldRetry = (error) => {
  const errorInfo = handleApiError(error);
  return errorInfo.canRetry;
};

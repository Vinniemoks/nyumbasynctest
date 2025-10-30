import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    initialData = null,
    handleAuth = true
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = handleAuth ? useNavigate() : null;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorInfo = handleApiError(err, navigate);
      setError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, navigate]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Custom hook for fetching data on component mount
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (apiFunction, options = {}) => {
  const {
    dependencies = [],
    skip = false,
    ...apiCallOptions
  } = options;

  const { data, loading, error, execute, reset } = useApiCall(apiFunction, apiCallOptions);
  const [mounted, setMounted] = useState(false);

  // Fetch data on mount or when dependencies change
  useState(() => {
    if (!skip && !mounted) {
      execute();
      setMounted(true);
    }
  }, [skip, mounted, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    reset
  };
};

export default useApiCall;

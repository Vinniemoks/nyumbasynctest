import { ApiError } from '../utils/apiErrorHandler';
import { TokenManager } from '../utils/security';
import { csrfProtection } from '../utils/csrfProtection';
import { auditLogger } from '../utils/auditLogger';

/**
 * Enhanced API client with security features
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.tokenManager = new TokenManager();
    this.requestTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  setAuthToken(token, expiresIn) {
    if (token) {
      this.tokenManager.setToken(token, expiresIn);
    } else {
      this.tokenManager.clearTokens();
    }
  }

  getAuthToken() {
    return this.tokenManager.getToken();
  }

  setRefreshToken(refreshToken) {
    this.tokenManager.setRefreshToken(refreshToken);
  }

  async refreshAccessToken() {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setAuthToken(data.token, data.expiresIn);
      return data.token;
    } catch (error) {
      this.tokenManager.clearTokens();
      throw error;
    }
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add CSRF token for state-changing requests
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase());
    const csrfHeaders = isStateChanging ? csrfProtection.getHeaderValue() : {};
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
        ...csrfHeaders,
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle 401 - Try to refresh token
      if (response.status === 401 && retryCount === 0) {
        auditLogger.logAuth('token_expired', { endpoint });
        try {
          await this.refreshAccessToken();
          return this.request(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          // Refresh failed, clear tokens and throw
          this.tokenManager.clearTokens();
          auditLogger.logAuth('session_expired', { endpoint });
          throw {
            response: {
              status: 401,
              data: { message: 'Session expired. Please login again.' },
              headers: response.headers
            },
            message: 'Session expired'
          };
        }
      }

      // Handle 403 - Forbidden
      if (response.status === 403) {
        auditLogger.logViolation('unauthorized_access', { endpoint, status: 403 });
      }

      if (!response.ok) {
        // Create structured error response
        throw {
          response: {
            status: response.status,
            data: typeof data === 'string' ? { message: data } : data,
            headers: response.headers
          },
          message: data.message || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          response: null
        };
      }

      // Network error - retry with exponential backoff
      if (!error.response && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, options, retryCount + 1);
      }

      // Network error (no response)
      if (!error.response) {
        throw {
          message: 'Network Error - Please check your connection',
          response: null
        };
      }
      
      // Re-throw the error for handling by useApiCall
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
      },
    });
  }

  clearAuth() {
    this.tokenManager.clearTokens();
  }
}

export default ApiClient;

/**
 * Unified API Service for NyumbaSync
 * This service works across web, mobile, and desktop applications
 */

import { API_CONFIG, STORAGE_KEYS, PLATFORM } from '../config/apiConfig';

class UnifiedApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.MAX_RETRIES;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Storage abstraction (works on web, mobile, desktop)
  async getStorageItem(key) {
    if (PLATFORM.isMobile) {
      // React Native AsyncStorage
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key);
    } else {
      // Web localStorage
      return localStorage.getItem(key);
    }
  }

  async setStorageItem(key, value) {
    if (PLATFORM.isMobile) {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeStorageItem(key) {
    if (PLATFORM.isMobile) {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }

  // Token management
  async getAuthToken() {
    return await this.getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setAuthToken(token) {
    if (token) {
      await this.setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await this.removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  async getRefreshToken() {
    return await this.getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setRefreshToken(token) {
    if (token) {
      await this.setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } else {
      await this.removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  // HTTP request method
  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle 401 - Try to refresh token
      if (response.status === 401 && retryCount === 0) {
        try {
          await this.refreshAccessToken();
          return this.request(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          await this.clearAuth();
          throw {
            response: {
              status: 401,
              data: { message: 'Session expired. Please login again.' },
            },
            message: 'Session expired'
          };
        }
      }

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: typeof data === 'string' ? { message: data } : data,
          },
          message: data.message || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          response: null
        };
      }

      // Retry on network error
      if (!error.response && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, options, retryCount + 1);
      }

      if (!error.response) {
        throw {
          message: 'Network Error - Please check your connection',
          response: null
        };
      }
      
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
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
    return this.request(endpoint, { method: 'DELETE' });
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

    const token = await this.getAuthToken();
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  // Auth methods
  async login(credentials) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.token) {
      await this.setAuthToken(response.token);
      if (response.refreshToken) {
        await this.setRefreshToken(response.refreshToken);
      }
      if (response.user) {
        await this.setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
    }
    return response;
  }

  async signup(userData) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, userData);
    if (response.token) {
      await this.setAuthToken(response.token);
      if (response.refreshToken) {
        await this.setRefreshToken(response.refreshToken);
      }
      if (response.user) {
        await this.setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
    }
    return response;
  }

  async logout() {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await this.clearAuth();
    }
  }

  async refreshAccessToken() {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, { refreshToken });
    if (response.token) {
      await this.setAuthToken(response.token);
    }
    return response.token;
  }

  async getCurrentUser() {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  async clearAuth() {
    await this.removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    await this.removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    await this.removeStorageItem(STORAGE_KEYS.USER_DATA);
  }

  // Property methods
  async getProperties(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.PROPERTIES.BASE, params);
  }

  async getProperty(propertyId) {
    return this.get(API_CONFIG.ENDPOINTS.PROPERTIES.BY_ID(propertyId));
  }

  async createProperty(propertyData) {
    return this.post(API_CONFIG.ENDPOINTS.PROPERTIES.BASE, propertyData);
  }

  async updateProperty(propertyId, propertyData) {
    return this.put(API_CONFIG.ENDPOINTS.PROPERTIES.BY_ID(propertyId), propertyData);
  }

  async deleteProperty(propertyId) {
    return this.delete(API_CONFIG.ENDPOINTS.PROPERTIES.BY_ID(propertyId));
  }

  // Tenant methods
  async getTenants(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS.BASE, params);
  }

  async getTenantProfile() {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS.PROFILE);
  }

  async getLease(leaseId) {
    return this.get(API_CONFIG.ENDPOINTS.LEASES.BY_ID(leaseId));
  }

  // Payment methods
  async getRentPayments(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.PAYMENTS.BASE, params);
  }

  async createRentPayment(paymentData) {
    return this.post(API_CONFIG.ENDPOINTS.PAYMENTS.BASE, paymentData);
  }

  async initiateMpesaSTK(data) {
    return this.post(API_CONFIG.ENDPOINTS.PAYMENTS.MPESA_STK, data);
  }

  async verifyMpesaPayment(transactionId) {
    return this.get(API_CONFIG.ENDPOINTS.PAYMENTS.MPESA_VERIFY(transactionId));
  }

  // Maintenance methods
  async getMaintenanceRequests(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.MAINTENANCE.TENANT, params);
  }

  async getMaintenanceRequest(requestId) {
    return this.get(API_CONFIG.ENDPOINTS.MAINTENANCE.TENANT_BY_ID(requestId));
  }

  async createMaintenanceRequest(requestData) {
    return this.post(API_CONFIG.ENDPOINTS.MAINTENANCE.TENANT, requestData);
  }

  async updateMaintenanceRequest(requestId, requestData) {
    return this.put(API_CONFIG.ENDPOINTS.MAINTENANCE.TENANT_BY_ID(requestId), requestData);
  }

  async rateMaintenanceRequest(requestId, rating, feedback) {
    return this.post(API_CONFIG.ENDPOINTS.MAINTENANCE.RATE(requestId), { rating, feedback });
  }

  // Notification methods
  async getNotifications(userId) {
    return this.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.BY_USER(userId));
  }

  async getUnreadCount(userId) {
    return this.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId));
  }

  async markAsRead(notificationId) {
    return this.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  }

  async registerPushToken(userId, token) {
    return this.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.PUSH_TOKEN, { userId, token });
  }

  // Message methods
  async getMessages() {
    return this.get(API_CONFIG.ENDPOINTS.MESSAGES.TENANT_MESSAGES);
  }

  async sendMessage(messageData) {
    return this.post(API_CONFIG.ENDPOINTS.MESSAGES.TENANT_MESSAGES, messageData);
  }

  async markMessageAsRead(messageId) {
    return this.put(API_CONFIG.ENDPOINTS.MESSAGES.TENANT_MARK_READ(messageId));
  }

  // Document methods
  async getDocuments() {
    return this.get(API_CONFIG.ENDPOINTS.DOCUMENTS.TENANT_DOCS);
  }

  async uploadDocument(file, category) {
    return this.uploadFile(API_CONFIG.ENDPOINTS.DOCUMENTS.TENANT_DOCS, file, { category });
  }

  async deleteDocument(documentId) {
    return this.delete(API_CONFIG.ENDPOINTS.DOCUMENTS.TENANT_DOC_BY_ID(documentId));
  }

  // Vendor methods
  async getVendors(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.VENDORS.TENANT_VENDORS, params);
  }

  async getVendor(vendorId) {
    return this.get(API_CONFIG.ENDPOINTS.VENDORS.TENANT_VENDOR_BY_ID(vendorId));
  }

  async contactVendor(vendorId, message) {
    return this.post(API_CONFIG.ENDPOINTS.VENDORS.CONTACT(vendorId), { message });
  }

  // Move-out methods
  async submitMoveOutRequest(requestData) {
    return this.post(API_CONFIG.ENDPOINTS.MOVE_OUT.REQUEST, requestData);
  }

  async getMoveOutStatus(requestId) {
    return this.get(API_CONFIG.ENDPOINTS.MOVE_OUT.STATUS(requestId));
  }

  async getCurrentMoveOutRequest() {
    return this.get(API_CONFIG.ENDPOINTS.MOVE_OUT.CURRENT);
  }

  async cancelMoveOutRequest(requestId) {
    return this.delete(API_CONFIG.ENDPOINTS.MOVE_OUT.CANCEL(requestId));
  }

  // Deposit refund methods
  async requestDepositRefund(requestData) {
    return this.post(API_CONFIG.ENDPOINTS.DEPOSIT.REFUND, requestData);
  }

  async getDepositRefundStatus(refundId) {
    return this.get(API_CONFIG.ENDPOINTS.DEPOSIT.STATUS(refundId));
  }

  async getCurrentDepositRefund() {
    return this.get(API_CONFIG.ENDPOINTS.DEPOSIT.CURRENT);
  }
}

// Export singleton instance
export const unifiedApiService = new UnifiedApiService();
export default unifiedApiService;

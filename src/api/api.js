// services/api.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set auth token
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get auth token
  getAuthToken() {
    return this.token || localStorage.getItem('authToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
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

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // File upload
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data to form
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` },
      },
    });
  }

  // Auth methods
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async signup(userData) {
    return this.post('/auth/signup', userData);
  }

  async logout() {
    await this.post('/auth/logout');
    this.setAuthToken(null);
  }

  async refreshToken() {
    const response = await this.post('/auth/refresh');
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Property methods
  async getProperties(params = {}) {
    return this.get('/properties', params);
  }

  async createProperty(propertyData) {
    return this.post('/properties', propertyData);
  }

  async updateProperty(propertyId, propertyData) {
    return this.put(`/properties/${propertyId}`, propertyData);
  }

  async deleteProperty(propertyId) {
    return this.delete(`/properties/${propertyId}`);
  }

  // Tenant methods
  async getTenants(params = {}) {
    return this.get('/tenants', params);
  }

  async createTenant(tenantData) {
    return this.post('/tenants', tenantData);
  }

  // Rent collection methods
  async getRentPayments(params = {}) {
    return this.get('/rent-payments', params);
  }

  async createRentPayment(paymentData) {
    return this.post('/rent-payments', paymentData);
  }

  // Maintenance methods
  async getMaintenanceRequests(params = {}) {
    return this.get('/maintenance-requests', params);
  }

  async createMaintenanceRequest(requestData) {
    return this.post('/maintenance-requests', requestData);
  }

  async updateMaintenanceRequest(requestId, requestData) {
    return this.put(`/maintenance-requests/${requestId}`, requestData);
  }

  // Reports methods
  async getFinancialReport(params = {}) {
    return this.get('/reports/financial', params);
  }

  async getOccupancyReport(params = {}) {
    return this.get('/reports/occupancy', params);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
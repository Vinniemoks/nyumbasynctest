import { mockProperties, mockTenants, mockPayments, mockMaintenance, mockUser, delay } from '../utils/mockData';

// services/api.js
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('authToken');
    this.useMockData = true; // Set to false when backend is ready
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
    if (this.useMockData) {
      await delay();
      const token = 'mock-token-' + Date.now();
      this.setAuthToken(token);
      return { 
        token, 
        user: { ...mockUser, role: credentials.role || 'tenant' } 
      };
    }
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async signup(userData) {
    if (this.useMockData) {
      await delay();
      const token = 'mock-token-' + Date.now();
      this.setAuthToken(token);
      return { 
        token, 
        user: { ...mockUser, ...userData, id: Date.now() } 
      };
    }
    return this.post('/auth/signup', userData);
  }

  async logout() {
    if (this.useMockData) {
      await delay(200);
      this.setAuthToken(null);
      return { success: true };
    }
    await this.post('/auth/logout');
    this.setAuthToken(null);
  }

  async refreshToken() {
    if (this.useMockData) {
      await delay();
      return { token: this.getAuthToken() };
    }
    const response = await this.post('/auth/refresh');
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    if (this.useMockData) {
      await delay();
      return mockUser;
    }
    return this.get('/auth/me');
  }

  // Property methods
  async getProperties(params = {}) {
    if (this.useMockData) {
      await delay();
      return mockProperties;
    }
    return this.get('/properties', params);
  }

  async createProperty(propertyData) {
    if (this.useMockData) {
      await delay();
      const newProperty = { ...propertyData, id: Date.now(), occupancy: 0, occupied: false };
      mockProperties.push(newProperty);
      return newProperty;
    }
    return this.post('/properties', propertyData);
  }

  async updateProperty(propertyId, propertyData) {
    if (this.useMockData) {
      await delay();
      const index = mockProperties.findIndex(p => p.id === propertyId);
      if (index !== -1) {
        mockProperties[index] = { ...mockProperties[index], ...propertyData };
        return mockProperties[index];
      }
      throw new Error('Property not found');
    }
    return this.put(`/properties/${propertyId}`, propertyData);
  }

  async deleteProperty(propertyId) {
    if (this.useMockData) {
      await delay();
      const index = mockProperties.findIndex(p => p.id === propertyId);
      if (index !== -1) {
        mockProperties.splice(index, 1);
        return { success: true };
      }
      throw new Error('Property not found');
    }
    return this.delete(`/properties/${propertyId}`);
  }

  // Tenant methods
  async getTenants(params = {}) {
    if (this.useMockData) {
      await delay();
      return mockTenants;
    }
    return this.get('/tenants', params);
  }

  async createTenant(tenantData) {
    if (this.useMockData) {
      await delay();
      const newTenant = { ...tenantData, id: Date.now() };
      mockTenants.push(newTenant);
      return newTenant;
    }
    return this.post('/tenants', tenantData);
  }

  // Rent collection methods
  async getRentPayments(params = {}) {
    if (this.useMockData) {
      await delay();
      return mockPayments;
    }
    return this.get('/rent-payments', params);
  }

  async createRentPayment(paymentData) {
    if (this.useMockData) {
      await delay();
      const newPayment = { ...paymentData, id: Date.now(), status: 'paid', date: new Date().toISOString() };
      mockPayments.push(newPayment);
      return newPayment;
    }
    return this.post('/rent-payments', paymentData);
  }

  // Maintenance methods
  async getMaintenanceRequests(params = {}) {
    if (this.useMockData) {
      await delay();
      return mockMaintenance;
    }
    return this.get('/maintenance-requests', params);
  }

  async createMaintenanceRequest(requestData) {
    if (this.useMockData) {
      await delay();
      const newRequest = { 
        ...requestData, 
        id: Date.now(), 
        status: 'pending',
        date: new Date().toISOString(),
        time: 'Just now'
      };
      mockMaintenance.unshift(newRequest);
      return newRequest;
    }
    return this.post('/maintenance-requests', requestData);
  }

  async updateMaintenanceRequest(requestId, requestData) {
    if (this.useMockData) {
      await delay();
      const index = mockMaintenance.findIndex(m => m.id === requestId);
      if (index !== -1) {
        mockMaintenance[index] = { ...mockMaintenance[index], ...requestData };
        return mockMaintenance[index];
      }
      throw new Error('Maintenance request not found');
    }
    return this.put(`/maintenance-requests/${requestId}`, requestData);
  }

  // Reports methods
  async getFinancialReport(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        totalIncome: mockPayments.reduce((sum, p) => sum + p.amount, 0),
        totalExpenses: 50000,
        netIncome: 120000
      };
    }
    return this.get('/reports/financial', params);
  }

  async getOccupancyReport(params = {}) {
    if (this.useMockData) {
      await delay();
      const totalUnits = mockProperties.reduce((sum, p) => sum + p.units, 0);
      const occupiedUnits = mockProperties.filter(p => p.occupied).reduce((sum, p) => sum + p.units, 0);
      return {
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        occupancyRate: (occupiedUnits / totalUnits) * 100
      };
    }
    return this.get('/reports/occupancy', params);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
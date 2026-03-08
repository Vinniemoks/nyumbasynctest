import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nyumbasync-backend.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Auth
  login: (credentials) =>
    apiClient.post('/auth/login', credentials).then((r) => r.data),

  signup: (data) =>
    apiClient.post('/auth/signup', data).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),

  getCurrentUser: () =>
    apiClient.get('/auth/me').then((r) => r.data),

  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),

  // Properties
  getProperties: () =>
    apiClient.get('/properties').then((r) => r.data),

  getProperty: (id) =>
    apiClient.get(`/properties/${id}`).then((r) => r.data),

  createProperty: (data) =>
    apiClient.post('/properties', data).then((r) => r.data),

  updateProperty: (id, data) =>
    apiClient.put(`/properties/${id}`, data).then((r) => r.data),

  deleteProperty: (id) =>
    apiClient.delete(`/properties/${id}`).then((r) => r.data),

  // Tenants
  getTenants: () =>
    apiClient.get('/tenants').then((r) => r.data),

  getTenant: (id) =>
    apiClient.get(`/tenants/${id}`).then((r) => r.data),

  // Payments
  getPayments: () =>
    apiClient.get('/transactions').then((r) => r.data),

  // Maintenance
  getMaintenanceRequests: () =>
    apiClient.get('/maintenance').then((r) => r.data),

  updateMaintenanceRequest: (id, data) =>
    apiClient.put(`/maintenance/${id}`, data).then((r) => r.data),

  // Analytics
  getDashboardAnalytics: () =>
    apiClient.get('/analytics').then((r) => r.data),

  // Documents
  getDocuments: () =>
    apiClient.get('/documents').then((r) => r.data),

  uploadDocument: (formData) =>
    apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // Notifications
  getNotifications: () =>
    apiClient.get('/notifications').then((r) => r.data),

  markNotificationRead: (id) =>
    apiClient.put(`/notifications/${id}/read`).then((r) => r.data),

  // Biometric (WebAuthn)
  getBiometricCredentials: () =>
    apiClient.get('/biometric/credentials').then((r) => r.data),

  getBiometricRegisterChallenge: () =>
    apiClient.post('/biometric/register/challenge', {}).then((r) => r.data),

  verifyBiometricRegister: (credential) =>
    apiClient.post('/biometric/register/verify', { credential }).then((r) => r.data),

  getBiometricLoginChallenge: (identifier) =>
    apiClient.post('/biometric/login/challenge', { identifier }).then((r) => r.data),

  verifyBiometricLogin: (credential, identifier) =>
    apiClient.post('/biometric/login/verify', { credential, identifier }).then((r) => r.data),
};

export default apiService;
export { apiClient };

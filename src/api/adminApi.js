// Admin API Service
import apiService from './api';
import { delay } from '../utils/mockData';

class AdminApiService {
  constructor() {
    this.useMockData = true; // Set to false when backend is ready
  }

  // Dashboard Analytics
  async getDashboardStats() {
    if (this.useMockData) {
      await delay();
      return {
        totalUsers: 1247,
        activeUsers: 892,
        totalProperties: 456,
        occupancyRate: 87.5,
        totalRevenue: 12450000,
        monthlyRevenue: 2340000,
        pendingMaintenance: 23,
        activeTenants: 389,
        activeLandlords: 156,
        activeManagers: 89,
        activeAgents: 45,
        activeVendors: 78,
        revenueGrowth: 12.5,
        userGrowth: 8.3,
        maintenanceResolutionRate: 94.2
      };
    }
    return apiService.get('/admin/dashboard/stats');
  }

  // User Management
  async getAllUsers(params = {}) {
    if (this.useMockData) {
      await delay();
      const users = this.generateMockUsers();
      
      // Apply filters
      let filtered = [...users];
      if (params.role) {
        filtered = filtered.filter(u => u.role === params.role);
      }
      if (params.status) {
        filtered = filtered.filter(u => u.status === params.status);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(u => 
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      }
      
      return {
        users: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.limit || 20
      };
    }
    return apiService.get('/admin/users', params);
  }

  async getUserDetails(userId) {
    if (this.useMockData) {
      await delay();
      const users = this.generateMockUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return {
        ...user,
        properties: user.role === 'landlord' ? 5 : user.role === 'tenant' ? 1 : 0,
        totalPayments: user.role === 'tenant' ? 450000 : 0,
        maintenanceRequests: user.role === 'tenant' ? 3 : 0,
        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        activityLog: [
          { action: 'Login', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
          { action: 'Payment Made', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1' }
        ]
      };
    }
    return apiService.get(`/admin/users/${userId}`);
  }

  async createUser(userData) {
    if (this.useMockData) {
      await delay();
      return {
        id: Date.now(),
        ...userData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
    }
    return apiService.post('/admin/users', userData);
  }

  async updateUser(userId, userData) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'User updated successfully' };
    }
    return apiService.put(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'User deleted successfully' };
    }
    return apiService.delete(`/admin/users/${userId}`);
  }

  async suspendUser(userId, reason) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'User suspended successfully' };
    }
    return apiService.post(`/admin/users/${userId}/suspend`, { reason });
  }

  async activateUser(userId) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'User activated successfully' };
    }
    return apiService.post(`/admin/users/${userId}/activate`);
  }

  // Stakeholder Management
  async getAllStakeholders(params = {}) {
    if (this.useMockData) {
      await delay();
      const stakeholders = this.generateMockStakeholders();
      
      let filtered = [...stakeholders];
      if (params.type) {
        filtered = filtered.filter(s => s.type === params.type);
      }
      if (params.status) {
        filtered = filtered.filter(s => s.status === params.status);
      }
      
      return {
        stakeholders: filtered,
        total: filtered.length
      };
    }
    return apiService.get('/admin/stakeholders', params);
  }

  async getStakeholderDetails(stakeholderId) {
    if (this.useMockData) {
      await delay();
      const stakeholders = this.generateMockStakeholders();
      const stakeholder = stakeholders.find(s => s.id === stakeholderId);
      if (!stakeholder) throw new Error('Stakeholder not found');
      
      return {
        ...stakeholder,
        properties: Math.floor(Math.random() * 10) + 1,
        tenants: Math.floor(Math.random() * 50) + 5,
        revenue: Math.floor(Math.random() * 1000000) + 100000,
        documents: ['Business License', 'Tax Certificate'],
        verificationStatus: 'verified'
      };
    }
    return apiService.get(`/admin/stakeholders/${stakeholderId}`);
  }

  async updateStakeholder(stakeholderId, data) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Stakeholder updated successfully' };
    }
    return apiService.put(`/admin/stakeholders/${stakeholderId}`, data);
  }

  async suspendStakeholder(stakeholderId, reason) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Stakeholder suspended successfully' };
    }
    return apiService.post(`/admin/stakeholders/${stakeholderId}/suspend`, { reason });
  }

  // Property Management
  async getAllProperties(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        properties: this.generateMockProperties(),
        total: 456
      };
    }
    return apiService.get('/admin/properties', params);
  }

  // Financial Management
  async getFinancialOverview(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        totalRevenue: 12450000,
        totalExpenses: 4230000,
        netIncome: 8220000,
        pendingPayments: 234000,
        overduePayments: 89000,
        refundsProcessed: 156000,
        monthlyBreakdown: this.generateMonthlyFinancials()
      };
    }
    return apiService.get('/admin/financials/overview', params);
  }

  async getPaymentTransactions(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        transactions: this.generateMockTransactions(),
        total: 1247
      };
    }
    return apiService.get('/admin/financials/transactions', params);
  }

  async processRefund(refundData) {
    if (this.useMockData) {
      await delay();
      return { 
        success: true, 
        message: 'Refund processed successfully',
        transactionId: `REF-${Date.now()}`
      };
    }
    return apiService.post('/admin/financials/refunds', refundData);
  }

  // Maintenance Management
  async getAllMaintenanceRequests(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        requests: this.generateMockMaintenanceRequests(),
        total: 234
      };
    }
    return apiService.get('/admin/maintenance', params);
  }

  async assignMaintenanceToVendor(requestId, vendorId) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Maintenance request assigned successfully' };
    }
    return apiService.post(`/admin/maintenance/${requestId}/assign`, { vendorId });
  }

  // Vendor Management
  async getAllVendors(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        vendors: this.generateMockVendors(),
        total: 78
      };
    }
    return apiService.get('/admin/vendors', params);
  }

  // Admin Management
  async getAllAdmins() {
    if (this.useMockData) {
      await delay();
      return this.generateMockAdmins();
    }
    return apiService.get('/admin/admins');
  }

  async createAdmin(adminData) {
    if (this.useMockData) {
      await delay();
      return {
        id: Date.now(),
        ...adminData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
    }
    return apiService.post('/admin/admins', adminData);
  }

  async updateAdmin(adminId, adminData) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Admin updated successfully' };
    }
    return apiService.put(`/admin/admins/${adminId}`, adminData);
  }

  async deleteAdmin(adminId) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Admin deleted successfully' };
    }
    return apiService.delete(`/admin/admins/${adminId}`);
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    if (this.useMockData) {
      await delay();
      return {
        logs: this.generateMockAuditLogs(),
        total: 5678
      };
    }
    return apiService.get('/admin/audit-logs', params);
  }

  // System Settings
  async getSystemSettings() {
    if (this.useMockData) {
      await delay();
      return {
        siteName: 'NyumbaSync',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        smsNotifications: true,
        paymentGateway: 'mpesa',
        currency: 'KES'
      };
    }
    return apiService.get('/admin/settings');
  }

  async updateSystemSettings(settings) {
    if (this.useMockData) {
      await delay();
      return { success: true, message: 'Settings updated successfully' };
    }
    return apiService.put('/admin/settings', settings);
  }

  // Mock Data Generators
  generateMockUsers() {
    const roles = ['landlord', 'tenant', 'manager', 'agent', 'vendor'];
    const statuses = ['active', 'inactive', 'suspended'];
    const users = [];
    
    for (let i = 1; i <= 50; i++) {
      users.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `+25471234${String(i).padStart(4, '0')}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return users;
  }

  generateMockStakeholders() {
    const types = ['landlord', 'manager', 'agent'];
    const statuses = ['active', 'suspended', 'pending'];
    const stakeholders = [];
    
    for (let i = 1; i <= 30; i++) {
      stakeholders.push({
        id: i,
        name: `Stakeholder ${i}`,
        email: `stakeholder${i}@example.com`,
        phone: `+25472234${String(i).padStart(4, '0')}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        properties: Math.floor(Math.random() * 10) + 1,
        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return stakeholders;
  }

  generateMockProperties() {
    const properties = [];
    for (let i = 1; i <= 20; i++) {
      properties.push({
        id: i,
        address: `${i} Main Street, Nairobi`,
        type: ['apartment', 'house', 'commercial'][Math.floor(Math.random() * 3)],
        units: Math.floor(Math.random() * 20) + 1,
        occupancy: Math.floor(Math.random() * 100),
        owner: `Owner ${i}`,
        status: ['active', 'maintenance'][Math.floor(Math.random() * 2)]
      });
    }
    return properties;
  }

  generateMockTransactions() {
    const transactions = [];
    for (let i = 1; i <= 20; i++) {
      transactions.push({
        id: i,
        transactionId: `TXN-${Date.now()}-${i}`,
        tenant: `Tenant ${i}`,
        amount: Math.floor(Math.random() * 100000) + 10000,
        type: ['rent', 'deposit', 'utility'][Math.floor(Math.random() * 3)],
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return transactions;
  }

  generateMockMaintenanceRequests() {
    const requests = [];
    const priorities = ['low', 'normal', 'high', 'urgent'];
    const statuses = ['submitted', 'assigned', 'in_progress', 'completed'];
    
    for (let i = 1; i <= 20; i++) {
      requests.push({
        id: i,
        ticketNumber: `TKT-${Date.now()}-${i}`,
        property: `Property ${i}`,
        tenant: `Tenant ${i}`,
        category: ['plumbing', 'electrical', 'hvac', 'general'][Math.floor(Math.random() * 4)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return requests;
  }

  generateMockVendors() {
    const vendors = [];
    for (let i = 1; i <= 15; i++) {
      vendors.push({
        id: i,
        name: `Vendor ${i}`,
        email: `vendor${i}@example.com`,
        phone: `+25473234${String(i).padStart(4, '0')}`,
        serviceTypes: ['plumbing', 'electrical', 'hvac'],
        rating: (Math.random() * 2 + 3).toFixed(1),
        completedJobs: Math.floor(Math.random() * 100) + 10,
        status: ['active', 'inactive'][Math.floor(Math.random() * 2)]
      });
    }
    return vendors;
  }

  generateMockAdmins() {
    return [
      {
        id: 1,
        name: 'Super Admin',
        email: 'superadmin@nyumbasync.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'John Admin',
        email: 'john@nyumbasync.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Sarah Support',
        email: 'sarah@nyumbasync.com',
        role: 'support_admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  generateMockAuditLogs() {
    const logs = [];
    const actions = ['user_created', 'user_updated', 'user_deleted', 'payment_processed', 'property_created'];
    
    for (let i = 1; i <= 20; i++) {
      logs.push({
        id: i,
        action: actions[Math.floor(Math.random() * actions.length)],
        performedBy: `Admin ${Math.floor(Math.random() * 5) + 1}`,
        targetUser: `User ${Math.floor(Math.random() * 100) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        details: 'Action performed successfully'
      });
    }
    return logs;
  }

  generateMonthlyFinancials() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 2000000) + 1000000,
      expenses: Math.floor(Math.random() * 500000) + 200000
    }));
  }
}

export default new AdminApiService();

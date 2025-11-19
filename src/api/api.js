import { mockProperties, mockTenants, mockPayments, mockMaintenance, mockUser, mockVendors, delay } from '../utils/mockData';

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

  // Set refresh token
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
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

  clearAuth() {
    this.setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
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

  async getTenantProfile() {
    if (this.useMockData) {
      await delay();
      return {
        id: 1,
        userId: mockUser.id,
        firstName: mockUser.firstName || 'John',
        lastName: mockUser.lastName || 'Doe',
        email: mockUser.email,
        phoneNumber: mockUser.phone || '+254712345678',
        currentPropertyId: 1,
        currentLeaseId: 1,
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+254712345679',
          relationship: 'Spouse'
        },
        preferences: {
          notifications: true,
          autoPayEnabled: false
        }
      };
    }
    return this.get('/tenant/profile');
  }

  async getProperty(propertyId) {
    if (this.useMockData) {
      await delay();
      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      return {
        id: property.id,
        address: property.address,
        unitNumber: property.unitNumber || 'A1',
        propertyType: property.type || 'apartment',
        squareFootage: property.squareFootage || 1200,
        bedrooms: property.bedrooms || 2,
        bathrooms: property.bathrooms || 2,
        amenities: ['Parking', 'Gym', 'Pool', 'Security'],
        images: [property.image || 'https://via.placeholder.com/400x300'],
        stakeholder: {
          name: 'Property Manager',
          email: 'manager@example.com',
          phone: '+254712345670',
          role: 'manager'
        }
      };
    }
    return this.get(`/properties/${propertyId}`);
  }

  async getLease(leaseId) {
    if (this.useMockData) {
      await delay();
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      const endDate = new Date(today.getFullYear() + 1, today.getMonth() - 6, 1);
      
      return {
        id: leaseId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        monthlyRent: 50000,
        securityDeposit: 50000,
        status: 'active',
        documentUrl: '/documents/lease-agreement.pdf'
      };
    }
    return this.get(`/leases/${leaseId}`);
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
      
      // Generate unique ticket number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const ticketNumber = `TKT-${timestamp}-${random}`;
      
      const newRequest = { 
        ...requestData, 
        id: timestamp,
        ticketNumber,
        status: 'submitted',
        date: new Date().toISOString().split('T')[0],
        time: 'Just now',
        createdAt: new Date().toISOString()
      };
      mockMaintenance.unshift(newRequest);
      return newRequest;
    }
    return this.post('/tenant/maintenance', requestData);
  }

  async getMaintenanceRequest(requestId) {
    if (this.useMockData) {
      await delay();
      const request = mockMaintenance.find(m => m.id === parseInt(requestId));
      if (!request) {
        throw new Error('Maintenance request not found');
      }
      
      // Add additional details for the detail view
      return {
        ...request,
        statusHistory: [
          {
            status: request.status,
            timestamp: request.createdAt || new Date().toISOString(),
            note: this.getStatusNote(request.status)
          }
        ],
        assignedVendor: request.assignedVendor ? {
          id: 1,
          name: request.assignedVendor,
          phone: '+254722111222',
          estimatedArrival: 'Within 24 hours'
        } : null
      };
    }
    return this.get(`/tenant/maintenance/${requestId}`);
  }

  getStatusNote(status) {
    const notes = {
      submitted: 'Your maintenance request has been submitted and is awaiting review.',
      assigned: 'A vendor has been assigned to your request and will contact you soon.',
      in_progress: 'The vendor is currently working on resolving your issue.',
      completed: 'Your maintenance request has been completed.',
      cancelled: 'This maintenance request has been cancelled.'
    };
    return notes[status] || 'Status updated.';
  }

  async updateMaintenanceRequest(requestId, requestData) {
    if (this.useMockData) {
      await delay();
      const index = mockMaintenance.findIndex(m => m.id === parseInt(requestId));
      if (index !== -1) {
        mockMaintenance[index] = { ...mockMaintenance[index], ...requestData };
        return mockMaintenance[index];
      }
      throw new Error('Maintenance request not found');
    }
    return this.put(`/tenant/maintenance/${requestId}`, requestData);
  }

  async rateMaintenanceRequest(requestId, rating, feedback) {
    if (this.useMockData) {
      await delay();
      const index = mockMaintenance.findIndex(m => m.id === parseInt(requestId));
      if (index !== -1) {
        mockMaintenance[index] = { 
          ...mockMaintenance[index], 
          rating,
          feedback,
          ratedAt: new Date().toISOString()
        };
        return { success: true, message: 'Thank you for your feedback!' };
      }
      throw new Error('Maintenance request not found');
    }
    return this.post(`/tenant/maintenance/${requestId}/rate`, { rating, feedback });
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

  // Vendor methods
  async getVendors(params = {}) {
    if (this.useMockData) {
      await delay();
      let vendors = [...mockVendors];
      
      // Apply filters if provided
      if (params.serviceTypes && params.serviceTypes.length > 0) {
        vendors = vendors.filter(vendor => 
          vendor.serviceTypes.some(type => params.serviceTypes.includes(type))
        );
      }
      
      if (params.minRating) {
        vendors = vendors.filter(vendor => vendor.rating >= params.minRating);
      }
      
      if (params.availability) {
        vendors = vendors.filter(vendor => vendor.availability === params.availability);
      }
      
      return vendors;
    }
    return this.get('/tenant/vendors', params);
  }

  async getVendor(vendorId) {
    if (this.useMockData) {
      await delay();
      const vendor = mockVendors.find(v => v.id === parseInt(vendorId));
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      return vendor;
    }
    return this.get(`/tenant/vendors/${vendorId}`);
  }

  async contactVendor(vendorId, message) {
    if (this.useMockData) {
      await delay();
      return { 
        success: true, 
        message: 'Your message has been sent to the vendor' 
      };
    }
    return this.post(`/tenant/vendors/${vendorId}/contact`, { message });
  }

  async requestService(vendorId, serviceData) {
    if (this.useMockData) {
      await delay();
      return { 
        success: true, 
        requestId: Date.now(),
        message: 'Service request submitted successfully' 
      };
    }
    return this.post(`/tenant/vendors/${vendorId}/request`, serviceData);
  }

  // Move-Out methods
  async submitMoveOutRequest(requestData) {
    if (this.useMockData) {
      await delay();
      const referenceNumber = `MO-${Date.now().toString().slice(-8)}`;
      const moveOutRequest = {
        id: Date.now(),
        referenceNumber,
        propertyId: requestData.propertyId,
        leaseId: requestData.leaseId,
        moveOutDate: requestData.moveOutDate,
        reason: requestData.reason,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        stakeholderNotified: true
      };
      
      // Store in mock data (you can add this to mockData.js if needed)
      if (!window.mockMoveOutRequests) {
        window.mockMoveOutRequests = [];
      }
      window.mockMoveOutRequests.push(moveOutRequest);
      
      return {
        success: true,
        referenceNumber,
        moveOutRequest
      };
    }
    return this.post('/tenant/move-out/request', requestData);
  }

  async getMoveOutStatus(requestId) {
    if (this.useMockData) {
      await delay();
      const requests = window.mockMoveOutRequests || [];
      const request = requests.find(r => r.id === requestId);
      
      if (!request) {
        // Return a default status if no request found
        return {
          id: requestId,
          referenceNumber: `MO-${Date.now().toString().slice(-8)}`,
          status: 'pending',
          moveOutDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date().toISOString(),
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              note: 'Move-out request submitted and awaiting review'
            }
          ]
        };
      }
      
      return request;
    }
    return this.get(`/tenant/move-out/status/${requestId}`);
  }

  async getCurrentMoveOutRequest() {
    if (this.useMockData) {
      await delay();
      const requests = window.mockMoveOutRequests || [];
      // Return the most recent request
      if (requests.length > 0) {
        const latestRequest = requests[requests.length - 1];
        return {
          ...latestRequest,
          statusHistory: [
            {
              status: 'pending',
              timestamp: latestRequest.submittedAt,
              note: 'Move-out request submitted and awaiting review'
            }
          ]
        };
      }
      return null;
    }
    return this.get('/tenant/move-out/current');
  }

  async cancelMoveOutRequest(requestId) {
    if (this.useMockData) {
      await delay();
      const requests = window.mockMoveOutRequests || [];
      const index = requests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        requests[index].status = 'cancelled';
        return { success: true, message: 'Move-out request cancelled' };
      }
      throw new Error('Move-out request not found');
    }
    return this.delete(`/tenant/move-out/request/${requestId}`);
  }

  // Deposit Refund methods
  async requestDepositRefund(requestData) {
    if (this.useMockData) {
      await delay();
      const now = new Date().toISOString();
      const refundRequest = {
        id: Date.now(),
        moveOutRequestId: requestData.moveOutRequestId,
        depositAmount: requestData.depositAmount || 50000,
        status: 'submitted',
        submittedAt: now,
        stages: [
          { stage: 'submitted', completed: true, timestamp: now },
          { stage: 'inspection', completed: false, timestamp: null },
          { stage: 'approved', completed: false, timestamp: null },
          { stage: 'paid', completed: false, timestamp: null }
        ],
        statusHistory: [
          {
            status: 'submitted',
            timestamp: now,
            note: 'Your deposit refund request has been submitted and is being reviewed by the property stakeholder.'
          }
        ],
        deductions: [],
        paymentDetails: null
      };
      
      if (!window.mockDepositRefunds) {
        window.mockDepositRefunds = [];
      }
      window.mockDepositRefunds.push(refundRequest);
      
      return {
        success: true,
        refundRequest
      };
    }
    return this.post('/tenant/deposit/refund', requestData);
  }

  async getDepositRefundStatus(refundId) {
    if (this.useMockData) {
      await delay();
      const refunds = window.mockDepositRefunds || [];
      const refund = refunds.find(r => r.id === refundId);
      
      if (!refund) {
        return null;
      }
      
      return refund;
    }
    return this.get(`/tenant/deposit/status/${refundId}`);
  }

  async getCurrentDepositRefund() {
    if (this.useMockData) {
      await delay();
      const refunds = window.mockDepositRefunds || [];
      if (refunds.length > 0) {
        return refunds[refunds.length - 1];
      }
      return null;
    }
    return this.get('/tenant/deposit/current');
  }

  // Document methods
  async getDocuments() {
    if (this.useMockData) {
      await delay();
      if (!window.mockDocuments) {
        window.mockDocuments = [
          {
            id: 1,
            name: 'Lease Agreement 2024.pdf',
            category: 'lease',
            fileUrl: '/documents/lease-agreement.pdf',
            fileType: 'application/pdf',
            fileSize: 2457600, // 2.4 MB
            uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Property Manager'
          },
          {
            id: 2,
            name: 'Move-in Inspection Report.pdf',
            category: 'inspection',
            fileUrl: '/documents/inspection-report.pdf',
            fileType: 'application/pdf',
            fileSize: 1536000, // 1.5 MB
            uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Property Manager'
          },
          {
            id: 3,
            name: 'Renters Insurance Policy.pdf',
            category: 'insurance',
            fileUrl: '/documents/insurance-policy.pdf',
            fileType: 'application/pdf',
            fileSize: 3145728, // 3 MB
            uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'You'
          },
          {
            id: 4,
            name: 'Utility Bill - January 2024.pdf',
            category: 'utilities',
            fileUrl: '/documents/utility-bill-jan.pdf',
            fileType: 'application/pdf',
            fileSize: 512000, // 500 KB
            uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Property Manager'
          },
          {
            id: 5,
            name: 'Property Photos.jpg',
            category: 'personal',
            fileUrl: '/documents/property-photos.jpg',
            fileType: 'image/jpeg',
            fileSize: 4194304, // 4 MB
            uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'You'
          },
          {
            id: 6,
            name: 'Parking Pass.pdf',
            category: 'other',
            fileUrl: '/documents/parking-pass.pdf',
            fileType: 'application/pdf',
            fileSize: 204800, // 200 KB
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Property Manager'
          }
        ];
      }
      return window.mockDocuments;
    }
    return this.get('/tenant/documents');
  }

  async uploadDocument(file, category) {
    if (this.useMockData) {
      await delay(1000); // Simulate upload time
      const newDocument = {
        id: Date.now(),
        name: file.name,
        category: category,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'You'
      };
      
      if (!window.mockDocuments) {
        window.mockDocuments = [];
      }
      window.mockDocuments.unshift(newDocument);
      
      return newDocument;
    }
    return this.uploadFile('/tenant/documents', file, { category });
  }

  async deleteDocument(documentId) {
    if (this.useMockData) {
      await delay();
      const documents = window.mockDocuments || [];
      const index = documents.findIndex(d => d.id === documentId);
      if (index !== -1) {
        documents.splice(index, 1);
        return { success: true };
      }
      throw new Error('Document not found');
    }
    return this.delete(`/tenant/documents/${documentId}`);
  }

  async downloadDocument(documentId) {
    if (this.useMockData) {
      await delay();
      const documents = window.mockDocuments || [];
      const document = documents.find(d => d.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      return document.fileUrl;
    }
    return this.get(`/tenant/documents/${documentId}/download`);
  }

  // Helper method to simulate refund status progression (for testing)
  async updateDepositRefundStatus(refundId, newStatus) {
    if (this.useMockData) {
      await delay();
      const refunds = window.mockDepositRefunds || [];
      const refund = refunds.find(r => r.id === refundId);
      
      if (!refund) {
        throw new Error('Refund request not found');
      }
      
      const now = new Date().toISOString();
      const statusOrder = ['submitted', 'inspection', 'approved', 'paid'];
      const currentIndex = statusOrder.indexOf(refund.status);
      const newIndex = statusOrder.indexOf(newStatus);
      
      if (newIndex > currentIndex) {
        refund.status = newStatus;
        
        // Update stages
        for (let i = 0; i <= newIndex; i++) {
          refund.stages[i].completed = true;
          if (!refund.stages[i].timestamp) {
            refund.stages[i].timestamp = now;
          }
        }
        
        // Add to status history
        const statusNotes = {
          inspection: 'Property inspection has been scheduled. An inspector will visit the property to assess its condition.',
          approved: 'Your deposit refund has been approved. The payment is being processed.',
          paid: 'Your deposit refund has been successfully processed and paid to your account.'
        };
        
        refund.statusHistory.push({
          status: newStatus,
          timestamp: now,
          note: statusNotes[newStatus] || `Status updated to ${newStatus}`
        });
        
        // Add payment details if status is paid
        if (newStatus === 'paid') {
          refund.paymentDetails = {
            paymentDate: now,
            amount: refund.depositAmount - (refund.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0),
            transactionReference: `REF-${Date.now().toString().slice(-10)}`,
            paymentMethod: 'Bank Transfer'
          };
        }
        
        return {
          success: true,
          refund
        };
      }
      
      throw new Error('Invalid status transition');
    }
    return this.put(`/tenant/deposit/refund/${refundId}/status`, { status: newStatus });
  }

  // Communication methods
  async getMessages() {
    if (this.useMockData) {
      await delay();
      if (!window.mockMessages) {
        window.mockMessages = [
          {
            id: 1,
            from: 'Property Manager',
            to: 'tenant@example.com',
            subject: 'Rent Payment Confirmation',
            message: 'Thank you for your rent payment. We have received your payment for this month.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: 2,
            from: 'Property Manager',
            to: 'tenant@example.com',
            subject: 'Maintenance Update',
            message: 'Your maintenance request has been assigned to a vendor. They will contact you within 24 hours.',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: false
          }
        ];
      }
      return window.mockMessages;
    }
    return this.get('/tenant/messages');
  }

  async sendMessage(messageData) {
    if (this.useMockData) {
      await delay();
      const newMessage = {
        id: Date.now(),
        from: 'You',
        to: messageData.to,
        toName: messageData.toName,
        subject: messageData.subject,
        message: messageData.message,
        priority: messageData.priority,
        timestamp: new Date().toISOString(),
        read: true,
        sent: true
      };
      
      if (!window.mockMessages) {
        window.mockMessages = [];
      }
      window.mockMessages.unshift(newMessage);
      
      return {
        success: true,
        message: newMessage
      };
    }
    return this.post('/tenant/messages', messageData);
  }

  async markMessageAsRead(messageId) {
    if (this.useMockData) {
      await delay();
      const messages = window.mockMessages || [];
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
      }
      return { success: true };
    }
    return this.put(`/tenant/messages/${messageId}/read`);
  }

  // Issue tracking methods
  async getIssues() {
    if (this.useMockData) {
      await delay();
      if (!window.mockIssues) {
        window.mockIssues = [
          {
            id: 1,
            ticketNumber: 'TKT-12345678-001',
            category: 'maintenance',
            subject: 'Leaking faucet in kitchen',
            description: 'The kitchen faucet has been leaking for the past few days. Water drips constantly even when fully closed.',
            priority: 'normal',
            status: 'open',
            estimatedResponseTime: '24 hours',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            ticketNumber: 'TKT-12345679-002',
            category: 'billing',
            subject: 'Question about utility charges',
            description: 'I noticed an increase in my utility bill this month. Can you provide a breakdown of the charges?',
            priority: 'low',
            status: 'in_progress',
            estimatedResponseTime: '24 hours',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            response: 'We are reviewing your utility usage and will provide a detailed breakdown within 24 hours.',
            responseAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      return window.mockIssues;
    }
    return this.get('/tenant/issues');
  }

  async createIssue(issueData) {
    if (this.useMockData) {
      await delay();
      const newIssue = {
        id: Date.now(),
        ...issueData
      };
      
      if (!window.mockIssues) {
        window.mockIssues = [];
      }
      window.mockIssues.unshift(newIssue);
      
      return newIssue;
    }
    return this.post('/tenant/issues', issueData);
  }

  async updateIssue(issueId, updateData) {
    if (this.useMockData) {
      await delay();
      const issues = window.mockIssues || [];
      const index = issues.findIndex(i => i.id === issueId);
      if (index !== -1) {
        issues[index] = { ...issues[index], ...updateData };
        return issues[index];
      }
      throw new Error('Issue not found');
    }
    return this.put(`/tenant/issues/${issueId}`, updateData);
  }

  // Utility Bill methods
  async getUtilityBills() {
    if (this.useMockData) {
      await delay();
      if (!window.mockUtilityBills) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Generate bills for current month and previous months
        window.mockUtilityBills = [
          {
            id: 1,
            propertyId: 1,
            utilityType: 'water',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth + 1, 0).toISOString()
            },
            usage: 45,
            usageUnit: 'm³',
            amount: 3500,
            dueDate: new Date(currentYear, currentMonth + 1, 5).toISOString(),
            status: 'pending',
            previousUsage: 42,
            usageIncrease: 7
          },
          {
            id: 2,
            propertyId: 1,
            utilityType: 'electricity',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth + 1, 0).toISOString()
            },
            usage: 320,
            usageUnit: 'kWh',
            amount: 8500,
            dueDate: new Date(currentYear, currentMonth + 1, 5).toISOString(),
            status: 'pending',
            previousUsage: 260,
            usageIncrease: 23
          },
          {
            id: 3,
            propertyId: 1,
            utilityType: 'internet',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth + 1, 0).toISOString()
            },
            usage: 500,
            usageUnit: 'GB',
            amount: 5000,
            dueDate: new Date(currentYear, currentMonth + 1, 5).toISOString(),
            status: 'pending',
            previousUsage: 480,
            usageIncrease: 4
          },
          // Previous month bills (paid)
          {
            id: 4,
            propertyId: 1,
            utilityType: 'water',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth, 0).toISOString()
            },
            usage: 42,
            usageUnit: 'm³',
            amount: 3200,
            dueDate: new Date(currentYear, currentMonth, 5).toISOString(),
            status: 'paid',
            paidDate: new Date(currentYear, currentMonth, 3).toISOString(),
            previousUsage: 40,
            usageIncrease: 5
          },
          {
            id: 5,
            propertyId: 1,
            utilityType: 'electricity',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth, 0).toISOString()
            },
            usage: 260,
            usageUnit: 'kWh',
            amount: 7200,
            dueDate: new Date(currentYear, currentMonth, 5).toISOString(),
            status: 'paid',
            paidDate: new Date(currentYear, currentMonth, 4).toISOString(),
            previousUsage: 250,
            usageIncrease: 4
          },
          {
            id: 6,
            propertyId: 1,
            utilityType: 'internet',
            billingPeriod: {
              startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
              endDate: new Date(currentYear, currentMonth, 0).toISOString()
            },
            usage: 480,
            usageUnit: 'GB',
            amount: 5000,
            dueDate: new Date(currentYear, currentMonth, 5).toISOString(),
            status: 'paid',
            paidDate: new Date(currentYear, currentMonth, 2).toISOString(),
            previousUsage: 470,
            usageIncrease: 2
          }
        ];
        
        // Generate historical data for the past 12 months
        for (let i = 2; i <= 12; i++) {
          const month = currentMonth - i;
          const year = month < 0 ? currentYear - 1 : currentYear;
          const adjustedMonth = month < 0 ? 12 + month : month;
          
          window.mockUtilityBills.push(
            {
              id: 100 + (i * 3),
              propertyId: 1,
              utilityType: 'water',
              billingPeriod: {
                startDate: new Date(year, adjustedMonth, 1).toISOString(),
                endDate: new Date(year, adjustedMonth + 1, 0).toISOString()
              },
              usage: 38 + Math.floor(Math.random() * 10),
              usageUnit: 'm³',
              amount: 3000 + Math.floor(Math.random() * 1000),
              dueDate: new Date(year, adjustedMonth + 1, 5).toISOString(),
              status: 'paid',
              paidDate: new Date(year, adjustedMonth + 1, 3).toISOString()
            },
            {
              id: 101 + (i * 3),
              propertyId: 1,
              utilityType: 'electricity',
              billingPeriod: {
                startDate: new Date(year, adjustedMonth, 1).toISOString(),
                endDate: new Date(year, adjustedMonth + 1, 0).toISOString()
              },
              usage: 240 + Math.floor(Math.random() * 40),
              usageUnit: 'kWh',
              amount: 6500 + Math.floor(Math.random() * 2000),
              dueDate: new Date(year, adjustedMonth + 1, 5).toISOString(),
              status: 'paid',
              paidDate: new Date(year, adjustedMonth + 1, 4).toISOString()
            },
            {
              id: 102 + (i * 3),
              propertyId: 1,
              utilityType: 'internet',
              billingPeriod: {
                startDate: new Date(year, adjustedMonth, 1).toISOString(),
                endDate: new Date(year, adjustedMonth + 1, 0).toISOString()
              },
              usage: 450 + Math.floor(Math.random() * 100),
              usageUnit: 'GB',
              amount: 5000,
              dueDate: new Date(year, adjustedMonth + 1, 5).toISOString(),
              status: 'paid',
              paidDate: new Date(year, adjustedMonth + 1, 2).toISOString()
            }
          );
        }
      }
      return window.mockUtilityBills;
    }
    return this.get('/tenant/utilities');
  }

  async getUtilityBill(billId) {
    if (this.useMockData) {
      await delay();
      const bills = window.mockUtilityBills || [];
      const bill = bills.find(b => b.id === parseInt(billId));
      if (!bill) {
        throw new Error('Utility bill not found');
      }
      return bill;
    }
    return this.get(`/tenant/utilities/${billId}`);
  }

  async splitUtilityBill(billId, splitData) {
    if (this.useMockData) {
      await delay();
      const bills = window.mockUtilityBills || [];
      const index = bills.findIndex(b => b.id === parseInt(billId));
      if (index !== -1) {
        bills[index] = {
          ...bills[index],
          splitWith: splitData.roommates,
          splitType: splitData.splitType,
          customSplits: splitData.customSplits
        };
        return {
          success: true,
          bill: bills[index],
          splits: this.calculateSplits(bills[index], splitData)
        };
      }
      throw new Error('Utility bill not found');
    }
    return this.post(`/tenant/utilities/${billId}/split`, splitData);
  }

  calculateSplits(bill, splitData) {
    const { roommates, splitType, customSplits } = splitData;
    const totalPeople = roommates.length + 1; // Including tenant
    
    if (splitType === 'equal') {
      const amountPerPerson = bill.amount / totalPeople;
      return [
        { name: 'You', amount: amountPerPerson, percentage: (100 / totalPeople).toFixed(1) },
        ...roommates.map(roommate => ({
          name: roommate.name,
          amount: amountPerPerson,
          percentage: (100 / totalPeople).toFixed(1)
        }))
      ];
    } else {
      // Custom split
      return [
        { name: 'You', amount: bill.amount * (customSplits.you / 100), percentage: customSplits.you },
        ...roommates.map((roommate, index) => ({
          name: roommate.name,
          amount: bill.amount * (customSplits[`roommate_${index}`] / 100),
          percentage: customSplits[`roommate_${index}`]
        }))
      ];
    }
  }

  async payUtilityBill(billId, paymentData) {
    if (this.useMockData) {
      await delay();
      const bills = window.mockUtilityBills || [];
      const index = bills.findIndex(b => b.id === parseInt(billId));
      if (index !== -1) {
        bills[index] = {
          ...bills[index],
          status: 'paid',
          paidDate: new Date().toISOString(),
          paymentMethod: paymentData.paymentMethod,
          transactionReference: `TXN-${Date.now()}`
        };
        
        // Simulate status update within 10 seconds
        setTimeout(() => {
          console.log('Payment status updated');
        }, 2000);
        
        return {
          success: true,
          bill: bills[index],
          message: 'Payment processed successfully'
        };
      }
      throw new Error('Utility bill not found');
    }
    return this.post(`/tenant/utilities/${billId}/pay`, paymentData);
  }

  async getUtilityUsageTrends(utilityType, months = 12) {
    if (this.useMockData) {
      await delay();
      const bills = window.mockUtilityBills || [];
      const filteredBills = bills
        .filter(b => b.utilityType === utilityType)
        .sort((a, b) => new Date(a.billingPeriod.startDate) - new Date(b.billingPeriod.startDate))
        .slice(-months);
      
      return filteredBills.map(bill => ({
        month: new Date(bill.billingPeriod.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        usage: bill.usage,
        amount: bill.amount,
        usageUnit: bill.usageUnit
      }));
    }
    return this.get(`/tenant/utilities/trends`, { utilityType, months });
  }

  // Community methods
  async getAnnouncements() {
    if (this.useMockData) {
      await delay();
      if (!window.mockAnnouncements) {
        const now = new Date();
        window.mockAnnouncements = [
          {
            id: 1,
            title: 'Building Maintenance Schedule - Elevator Service',
            message: 'Dear Residents,\n\nPlease be informed that the main elevator will undergo routine maintenance on Saturday, November 2nd, from 8:00 AM to 2:00 PM. During this time, please use the service elevator or stairs.\n\nWe apologize for any inconvenience and appreciate your cooperation.',
            author: 'Property Management',
            category: 'Maintenance',
            priority: 'high',
            postedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: false
          },
          {
            id: 2,
            title: 'Gym Equipment Upgrade Complete',
            message: 'Great news! The gym has been upgraded with new cardio equipment including treadmills, ellipticals, and stationary bikes. The gym is now open with extended hours from 5:00 AM to 11:00 PM daily.\n\nEnjoy your workouts!',
            author: 'Facilities Manager',
            category: 'Amenities',
            priority: 'medium',
            postedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            read: false,
            attachments: [
              { name: 'Gym_Schedule.pdf', url: '/documents/gym-schedule.pdf' }
            ]
          },
          {
            id: 3,
            title: 'Holiday Parking Arrangements',
            message: 'As we approach the holiday season, please note that visitor parking will be available on a first-come, first-served basis. Residents are reminded to inform their guests to register at the security desk upon arrival.\n\nHappy Holidays!',
            author: 'Security Team',
            category: 'Parking',
            priority: 'low',
            postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            read: true
          },
          {
            id: 4,
            title: 'URGENT: Water Supply Interruption',
            message: 'URGENT NOTICE:\n\nDue to emergency repairs on the main water line, water supply will be interrupted tomorrow (November 1st) from 9:00 AM to 3:00 PM.\n\nPlease store sufficient water for your needs during this period. We apologize for the short notice and any inconvenience caused.',
            author: 'Property Management',
            category: 'Utilities',
            priority: 'urgent',
            postedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            read: false
          },
          {
            id: 5,
            title: 'Community BBQ Event - This Weekend',
            message: 'Join us for our annual Community BBQ this Saturday at 4:00 PM in the courtyard!\n\nFood and drinks will be provided. It\'s a great opportunity to meet your neighbors and enjoy some delicious food.\n\nRSVP by Friday to help us with planning.',
            author: 'Community Manager',
            category: 'Events',
            priority: 'medium',
            postedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            read: true,
            actionUrl: '/tenant-dashboard/community/events/bbq',
            actionText: 'RSVP Now'
          },
          {
            id: 6,
            title: 'New Package Delivery System',
            message: 'We have installed a new smart package locker system in the lobby. You will receive a unique code via SMS when a package arrives for you. The code is valid for 48 hours.\n\nFor packages too large for the lockers, please collect them from the front desk during office hours (9 AM - 6 PM).',
            author: 'Property Management',
            category: 'Services',
            priority: 'medium',
            postedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            read: true
          },
          {
            id: 7,
            title: 'Pool Reopening After Winter Maintenance',
            message: 'The swimming pool has completed its annual winter maintenance and deep cleaning. We are pleased to announce that the pool will reopen on Monday, November 4th.\n\nNew pool hours:\nMonday - Friday: 6:00 AM - 9:00 PM\nWeekends: 7:00 AM - 10:00 PM\n\nPlease remember to follow pool rules and regulations.',
            author: 'Facilities Manager',
            category: 'Amenities',
            priority: 'low',
            postedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            read: true
          }
        ];
      }
      // Sort by date (newest first)
      return window.mockAnnouncements.sort((a, b) => 
        new Date(b.postedAt) - new Date(a.postedAt)
      );
    }
    return this.get('/tenant/announcements');
  }

  async markAnnouncementAsRead(announcementId) {
    if (this.useMockData) {
      await delay(200);
      const announcements = window.mockAnnouncements || [];
      const announcement = announcements.find(a => a.id === announcementId);
      if (announcement) {
        announcement.read = true;
      }
      return { success: true };
    }
    return this.put(`/tenant/announcements/${announcementId}/read`);
  }

  async getBulletinPosts() {
    if (this.useMockData) {
      await delay();
      if (!window.mockBulletinPosts) {
        const now = new Date();
        window.mockBulletinPosts = [
          {
            id: 1,
            author: 'Sarah Johnson',
            authorUnit: 'Unit 305',
            title: 'Looking for a dog walker',
            content: 'Hi neighbors! I\'m looking for a reliable dog walker for my golden retriever. Preferably someone in the building. Please contact me if interested!',
            postedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            category: 'Services',
            image: null
          },
          {
            id: 2,
            author: 'Mike Chen',
            authorUnit: 'Unit 412',
            title: 'Selling furniture - Moving out sale',
            content: 'Moving out next month and selling furniture:\n- Sofa (3-seater, grey) - $300\n- Dining table with 4 chairs - $200\n- Queen bed frame - $150\n\nAll items in excellent condition. DM me for photos and details.',
            postedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            category: 'For Sale',
            image: null
          },
          {
            id: 3,
            author: 'Emily Rodriguez',
            authorUnit: 'Unit 208',
            title: 'Lost cat - Please help!',
            content: 'My orange tabby cat "Whiskers" went missing yesterday evening. He\'s very friendly and wearing a blue collar with a bell. If you see him, please contact me immediately. Reward offered!',
            postedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
            category: 'Lost & Found',
            image: 'https://via.placeholder.com/400x300/FF8C00/FFFFFF?text=Orange+Cat'
          },
          {
            id: 4,
            author: 'David Park',
            authorUnit: 'Unit 501',
            title: 'Carpool to downtown - Daily commute',
            content: 'Looking for people interested in carpooling to downtown area for work. I leave around 7:30 AM and return around 6:00 PM. Can share gas costs. Let me know if interested!',
            postedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            category: 'Carpool',
            image: null
          },
          {
            id: 5,
            author: 'Lisa Thompson',
            authorUnit: 'Unit 103',
            title: 'Yoga class in the courtyard - Sundays',
            content: 'Starting a free community yoga class every Sunday at 8:00 AM in the courtyard (weather permitting). All levels welcome! Bring your own mat. Hope to see you there!',
            postedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            category: 'Activities',
            image: null
          }
        ];
      }
      // Sort by date (newest first)
      return window.mockBulletinPosts.sort((a, b) => 
        new Date(b.postedAt) - new Date(a.postedAt)
      );
    }
    return this.get('/tenant/bulletin');
  }

  async createBulletinPost(postData) {
    if (this.useMockData) {
      await delay();
      const newPost = {
        id: Date.now(),
        author: 'You',
        authorUnit: 'Your Unit',
        title: postData.title,
        content: postData.content,
        category: postData.category,
        image: postData.image ? URL.createObjectURL(postData.image) : null,
        postedAt: new Date().toISOString()
      };
      
      if (!window.mockBulletinPosts) {
        window.mockBulletinPosts = [];
      }
      window.mockBulletinPosts.unshift(newPost);
      
      return {
        success: true,
        post: newPost
      };
    }
    
    if (postData.image) {
      return this.uploadFile('/tenant/bulletin', postData.image, {
        title: postData.title,
        content: postData.content,
        category: postData.category
      });
    }
    
    return this.post('/tenant/bulletin', postData);
  }

  async reportCommonAreaIssue(issueData) {
    if (this.useMockData) {
      await delay();
      const newIssue = {
        id: Date.now(),
        ticketNumber: `CA-${Date.now().toString().slice(-8)}`,
        location: issueData.location,
        description: issueData.description,
        priority: issueData.priority || 'normal',
        status: 'submitted',
        reportedBy: 'You',
        reportedAt: new Date().toISOString(),
        images: issueData.images || []
      };
      
      if (!window.mockCommonAreaIssues) {
        window.mockCommonAreaIssues = [];
      }
      window.mockCommonAreaIssues.unshift(newIssue);
      
      // Simulate notification to stakeholder
      setTimeout(() => {
        console.log('Notification sent to property stakeholder');
      }, 500);
      
      return {
        success: true,
        issue: newIssue,
        message: 'Issue reported successfully. Property management has been notified.'
      };
    }
    return this.post('/tenant/issues/common-area', issueData);
  }

  // Lease Renewal methods
  async requestLeaseRenewal(renewalData) {
    if (this.useMockData) {
      await delay();
      const renewalRequest = {
        id: Date.now(),
        leaseId: renewalData.leaseId,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        message: renewalData.message,
        preferredTerms: renewalData.preferredTerms
      };
      
      if (!window.mockLeaseRenewals) {
        window.mockLeaseRenewals = [];
      }
      window.mockLeaseRenewals.push(renewalRequest);
      
      // Simulate notification to stakeholder
      setTimeout(() => {
        console.log('Renewal request notification sent to property stakeholder');
      }, 500);
      
      return {
        success: true,
        renewalRequest,
        message: 'Your lease renewal request has been submitted successfully. The property manager will review and respond within 3-5 business days.'
      };
    }
    return this.post('/tenant/lease/renew', renewalData);
  }

  async getRenewalTerms(leaseId) {
    if (this.useMockData) {
      await delay();
      
      // Check if there's a pending renewal with proposed terms
      const renewals = window.mockLeaseRenewals || [];
      const pendingRenewal = renewals.find(r => r.leaseId === leaseId && r.proposedTerms);
      
      if (pendingRenewal) {
        return pendingRenewal.proposedTerms;
      }
      
      // Return default proposed terms
      return {
        id: Date.now(),
        leaseId: leaseId,
        proposedRent: 52500, // 5% increase
        leaseDuration: 12, // months
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        terms: [
          'Monthly rent will be KES 52,500 (5% increase from current rent)',
          'Lease term will be 12 months',
          'Security deposit remains the same',
          'All other terms and conditions remain unchanged',
          'Rent payment due on the 1st of each month',
          'Late payment fee of KES 2,000 applies after 5 days'
        ],
        additionalNotes: 'Thank you for being a valued tenant. We look forward to continuing our relationship.',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // Offer expires in 14 days
      };
    }
    return this.get(`/tenant/lease/${leaseId}/renewal-terms`);
  }

  async acceptRenewalTerms(renewalId, signatureData) {
    if (this.useMockData) {
      await delay();
      
      const acceptance = {
        id: Date.now(),
        renewalId: renewalId,
        acceptedAt: new Date().toISOString(),
        signature: signatureData.signature,
        signedBy: signatureData.signedBy,
        ipAddress: '192.168.1.1',
        status: 'accepted'
      };
      
      if (!window.mockRenewalAcceptances) {
        window.mockRenewalAcceptances = [];
      }
      window.mockRenewalAcceptances.push(acceptance);
      
      // Generate new lease agreement
      const newLeaseAgreement = {
        id: Date.now(),
        documentUrl: `/documents/lease-renewal-${Date.now()}.pdf`,
        generatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      return {
        success: true,
        acceptance,
        leaseAgreement: newLeaseAgreement,
        message: 'Congratulations! Your lease renewal has been accepted and a new lease agreement has been generated.'
      };
    }
    return this.post(`/tenant/lease/renewal/${renewalId}/accept`, signatureData);
  }

  async declineRenewalTerms(renewalId, reason) {
    if (this.useMockData) {
      await delay();
      return {
        success: true,
        message: 'Renewal terms declined. The property manager has been notified.'
      };
    }
    return this.post(`/tenant/lease/renewal/${renewalId}/decline`, { reason });
  }

  async getRenewalStatus(leaseId) {
    if (this.useMockData) {
      await delay();
      const renewals = window.mockLeaseRenewals || [];
      const renewal = renewals.find(r => r.leaseId === leaseId);
      
      if (!renewal) {
        return null;
      }
      
      return renewal;
    }
    return this.get(`/tenant/lease/${leaseId}/renewal-status`);
  }

  // Emergency methods
  async getEmergencyContacts() {
    if (this.useMockData) {
      await delay();
      return [
        {
          id: 1,
          category: 'Security',
          name: 'Building Security',
          phone: '+254712345670',
          available: '24/7',
          icon: 'fas fa-shield-alt',
          color: 'blue'
        },
        {
          id: 2,
          category: 'Fire',
          name: 'Fire Department',
          phone: '999',
          available: '24/7',
          icon: 'fas fa-fire-extinguisher',
          color: 'red'
        },
        {
          id: 3,
          category: 'Medical',
          name: 'Emergency Medical Services',
          phone: '911',
          available: '24/7',
          icon: 'fas fa-ambulance',
          color: 'green'
        },
        {
          id: 4,
          category: 'Police',
          name: 'Police Emergency',
          phone: '999',
          available: '24/7',
          icon: 'fas fa-shield',
          color: 'indigo'
        },
        {
          id: 5,
          category: 'Property Management',
          name: 'Property Manager',
          phone: '+254722111222',
          available: 'Mon-Fri 9AM-6PM',
          icon: 'fas fa-building',
          color: 'purple'
        },
        {
          id: 6,
          category: 'Maintenance',
          name: 'Emergency Maintenance',
          phone: '+254733222333',
          available: '24/7',
          icon: 'fas fa-tools',
          color: 'orange'
        }
      ];
    }
    return this.get('/tenant/emergency/contacts');
  }

  async reportEmergency(emergencyData) {
    if (this.useMockData) {
      await delay(500); // Simulate network delay
      
      const reportId = `EMG-${Date.now().toString().slice(-8)}`;
      const emergencyReport = {
        id: Date.now(),
        reportId: reportId,
        ...emergencyData,
        status: 'reported',
        reportedAt: new Date().toISOString(),
        notificationsSent: {
          stakeholder: true,
          security: true,
          timestamp: new Date().toISOString()
        }
      };
      
      if (!window.mockEmergencyReports) {
        window.mockEmergencyReports = [];
      }
      window.mockEmergencyReports.push(emergencyReport);
      
      // Simulate building-wide alert for critical emergencies
      if (emergencyData.severity === 'critical' || 
          ['fire', 'gas_leak', 'security'].includes(emergencyData.emergencyType)) {
        // Trigger building-wide alert
        setTimeout(() => {
          this.sendBuildingWideAlert({
            type: 'emergency',
            title: `Emergency Alert: ${emergencyData.emergencyType.replace('_', ' ').toUpperCase()}`,
            message: `An emergency has been reported in ${emergencyData.location}. Please follow evacuation procedures if instructed.`,
            priority: 'urgent',
            emergencyReportId: reportId
          });
        }, 1000); // Send alert within 1 minute (simulated as 1 second)
      }
      
      return {
        success: true,
        reportId: reportId,
        emergencyReport: emergencyReport,
        message: 'Emergency report submitted successfully. Notifications sent to property management and security.'
      };
    }
    return this.post('/tenant/emergency/report', emergencyData);
  }

  async getEmergencyReport(reportId) {
    if (this.useMockData) {
      await delay();
      const reports = window.mockEmergencyReports || [];
      const report = reports.find(r => r.reportId === reportId);
      
      if (!report) {
        throw new Error('Emergency report not found');
      }
      
      return report;
    }
    return this.get(`/tenant/emergency/report/${reportId}`);
  }

  async getEvacuationMap(floor) {
    if (this.useMockData) {
      await delay();
      return {
        floor: floor,
        mapUrl: `/maps/floor-${floor}-evacuation.pdf`,
        exits: [
          { id: 1, location: 'North Stairwell', type: 'stairs' },
          { id: 2, location: 'South Stairwell', type: 'stairs' },
          { id: 3, location: 'East Exit', type: 'door' },
          { id: 4, location: 'West Exit', type: 'door' }
        ],
        fireExtinguishers: [
          { id: 1, location: 'Near North Stairwell' },
          { id: 2, location: 'Near South Stairwell' },
          { id: 3, location: 'Hallway Center' }
        ],
        assemblyPoints: [
          { id: 1, name: 'Primary Assembly Point', location: 'Front Parking Lot' },
          { id: 2, name: 'Secondary Assembly Point', location: 'Back Garden Area' }
        ]
      };
    }
    return this.get(`/tenant/emergency/evacuation-map`, { floor });
  }

  // Building-wide alert system
  async sendBuildingWideAlert(alertData) {
    if (this.useMockData) {
      await delay(500);
      
      const alert = {
        id: Date.now(),
        ...alertData,
        sentAt: new Date().toISOString(),
        recipients: 'all_tenants',
        deliveryStatus: 'delivered'
      };
      
      if (!window.mockBuildingAlerts) {
        window.mockBuildingAlerts = [];
      }
      window.mockBuildingAlerts.unshift(alert);
      
      // Simulate notification delivery to all tenants
      console.log('Building-wide alert sent:', alert);
      
      // Trigger notification event (would be handled by WebSocket in production)
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('buildingAlert', { detail: alert }));
      }
      
      return {
        success: true,
        alert: alert,
        message: 'Alert sent to all tenants successfully'
      };
    }
    return this.post('/admin/emergency/alert', alertData);
  }

  async getBuildingAlerts(limit = 10) {
    if (this.useMockData) {
      await delay();
      const alerts = window.mockBuildingAlerts || [];
      return alerts.slice(0, limit);
    }
    return this.get('/tenant/emergency/alerts', { limit });
  }

  async acknowledgeAlert(alertId) {
    if (this.useMockData) {
      await delay();
      const alerts = window.mockBuildingAlerts || [];
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date().toISOString();
      }
      return { success: true };
    }
    return this.post(`/tenant/emergency/alerts/${alertId}/acknowledge`);
  }

  // Guest Management methods
  async getGuests() {
    if (this.useMockData) {
      await delay();
      if (!window.mockGuests) {
        const now = new Date();
        window.mockGuests = [
          {
            id: 1,
            guestName: 'John Smith',
            guestPhone: '+254722111222',
            expectedArrival: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            accessCode: '123456',
            codeExpiry: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            arrivedAt: null
          },
          {
            id: 2,
            guestName: 'Sarah Johnson',
            guestPhone: '+254733222333',
            expectedArrival: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            accessCode: '789012',
            codeExpiry: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
            status: 'arrived',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            arrivedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            guestName: 'Michael Brown',
            guestPhone: '+254744333444',
            expectedArrival: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(), // Yesterday
            accessCode: '345678',
            codeExpiry: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // Expired
            status: 'expired',
            createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
            arrivedAt: null
          }
        ];
      }
      return window.mockGuests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return this.get('/tenant/guests');
  }

  async registerGuest(guestData) {
    if (this.useMockData) {
      await delay();
      
      // Generate unique 6-digit access code
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const now = new Date();
      const newGuest = {
        id: Date.now(),
        guestName: guestData.guestName,
        guestPhone: guestData.guestPhone,
        expectedArrival: guestData.expectedArrival,
        accessCode: accessCode,
        codeExpiry: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'pending',
        createdAt: now.toISOString(),
        arrivedAt: null
      };
      
      if (!window.mockGuests) {
        window.mockGuests = [];
      }
      window.mockGuests.unshift(newGuest);
      
      // Simulate SMS delivery within 1 minute
      setTimeout(() => {
        console.log(`SMS sent to ${guestData.guestPhone}: Your access code is ${accessCode}. Valid for 24 hours.`);
      }, 500);
      
      return {
        success: true,
        guest: newGuest,
        message: 'Guest registered successfully. Access code sent via SMS.'
      };
    }
    return this.post('/tenant/guests', guestData);
  }

  async cancelGuestRegistration(guestId) {
    if (this.useMockData) {
      await delay();
      const guests = window.mockGuests || [];
      const index = guests.findIndex(g => g.id === guestId);
      if (index !== -1) {
        guests.splice(index, 1);
        return { success: true, message: 'Guest registration cancelled' };
      }
      throw new Error('Guest not found');
    }
    return this.delete(`/tenant/guests/${guestId}`);
  }

  async grantRemoteAccess(guestId) {
    if (this.useMockData) {
      await delay(500);
      const guests = window.mockGuests || [];
      const guest = guests.find(g => g.id === guestId);
      
      if (!guest) {
        throw new Error('Guest not found');
      }
      
      // Simulate sending access command to gate system
      const accessGranted = {
        guestId: guestId,
        guestName: guest.guestName,
        grantedAt: new Date().toISOString(),
        grantedBy: 'tenant',
        accessType: 'remote_gate_access'
      };
      
      if (!window.mockAccessGrants) {
        window.mockAccessGrants = [];
      }
      window.mockAccessGrants.push(accessGranted);
      
      return {
        success: true,
        message: `Remote access granted to ${guest.guestName}. Gate will open automatically.`,
        accessGranted
      };
    }
    return this.post(`/tenant/guests/${guestId}/access`);
  }

  // Simulate guest arrival (for testing)
  async simulateGuestArrival(guestId) {
    if (this.useMockData) {
      await delay();
      const guests = window.mockGuests || [];
      const guest = guests.find(g => g.id === guestId);
      
      if (!guest) {
        throw new Error('Guest not found');
      }
      
      guest.status = 'arrived';
      guest.arrivedAt = new Date().toISOString();
      
      // Simulate notification to tenant within 1 minute
      setTimeout(() => {
        console.log(`Notification: ${guest.guestName} has arrived`);
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('guestArrival', { 
            detail: { 
              guestId: guest.id,
              guestName: guest.guestName,
              arrivedAt: guest.arrivedAt
            } 
          }));
        }
      }, 500);
      
      return {
        success: true,
        guest: guest,
        message: 'Guest arrival recorded. Notification sent to tenant.'
      };
    }
    return this.post(`/tenant/guests/${guestId}/arrival`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

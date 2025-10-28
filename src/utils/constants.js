// Application constants

export const USER_ROLES = {
  LANDLORD: 'landlord',
  MANAGER: 'manager',
  TENANT: 'tenant'
};

export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const MAINTENANCE_CATEGORY = {
  PLUMBING: 'plumbing',
  ELECTRICAL: 'electrical',
  HVAC: 'hvac',
  APPLIANCE: 'appliance',
  STRUCTURAL: 'structural',
  GENERAL: 'general',
  OTHER: 'other'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHOD = {
  MPESA: 'mpesa',
  BANK: 'bank',
  CARD: 'card',
  CASH: 'cash'
};

export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  PROPERTIES: '/properties',
  TENANTS: '/tenants',
  PAYMENTS: '/rent-payments',
  MAINTENANCE: '/maintenance-requests',
  REPORTS: {
    FINANCIAL: '/reports/financial',
    OCCUPANCY: '/reports/occupancy'
  }
};

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm'
};

export const CURRENCY = {
  CODE: 'KSh',
  SYMBOL: 'KSh',
  LOCALE: 'en-KE'
};

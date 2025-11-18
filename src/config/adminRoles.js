// Admin Role-Based Access Control (RBAC) Configuration
// Following the principle of least privilege

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT_ADMIN: 'support_admin',
  FINANCE_ADMIN: 'finance_admin',
  OPERATIONS_ADMIN: 'operations_admin',
  SALES_CUSTOMER_SERVICE_ADMIN: 'sales_customer_service_admin',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USER_ROLES: 'manage_user_roles',
  
  // Stakeholder Management
  VIEW_STAKEHOLDERS: 'view_stakeholders',
  CREATE_STAKEHOLDERS: 'create_stakeholders',
  EDIT_STAKEHOLDERS: 'edit_stakeholders',
  DELETE_STAKEHOLDERS: 'delete_stakeholders',
  SUSPEND_STAKEHOLDERS: 'suspend_stakeholders',
  
  // Property Management
  VIEW_PROPERTIES: 'view_properties',
  CREATE_PROPERTIES: 'create_properties',
  EDIT_PROPERTIES: 'edit_properties',
  DELETE_PROPERTIES: 'delete_properties',
  
  // Financial Management
  VIEW_FINANCIALS: 'view_financials',
  MANAGE_PAYMENTS: 'manage_payments',
  PROCESS_REFUNDS: 'process_refunds',
  VIEW_REPORTS: 'view_reports',
  EXPORT_FINANCIAL_DATA: 'export_financial_data',
  
  // Maintenance Management
  VIEW_MAINTENANCE: 'view_maintenance',
  ASSIGN_MAINTENANCE: 'assign_maintenance',
  MANAGE_VENDORS: 'manage_vendors',
  
  // System Configuration
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SECURITY: 'manage_security',
  
  // Support
  VIEW_SUPPORT_TICKETS: 'view_support_tickets',
  RESPOND_TO_TICKETS: 'respond_to_tickets',
  ESCALATE_TICKETS: 'escalate_tickets',
  
  // Sales & Customer Service
  VIEW_LEADS: 'view_leads',
  CREATE_LEADS: 'create_leads',
  MANAGE_LEADS: 'manage_leads',
  ONBOARD_STAKEHOLDERS: 'onboard_stakeholders',
  CONTACT_USERS: 'contact_users',
  VIEW_CUSTOMER_FEEDBACK: 'view_customer_feedback',
  MANAGE_CUSTOMER_FEEDBACK: 'manage_customer_feedback',
  
  // Admin Management
  VIEW_ADMINS: 'view_admins',
  CREATE_ADMINS: 'create_admins',
  EDIT_ADMINS: 'edit_admins',
  DELETE_ADMINS: 'delete_admins'
};

// Role-Permission Mapping
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Full access
  
  [ADMIN_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.CREATE_STAKEHOLDERS,
    PERMISSIONS.EDIT_STAKEHOLDERS,
    PERMISSIONS.SUSPEND_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.CREATE_PROPERTIES,
    PERMISSIONS.EDIT_PROPERTIES,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.ASSIGN_MAINTENANCE,
    PERMISSIONS.MANAGE_VENDORS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.RESPOND_TO_TICKETS,
    PERMISSIONS.ESCALATE_TICKETS
  ],
  
  [ADMIN_ROLES.SUPPORT_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.ASSIGN_MAINTENANCE,
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.RESPOND_TO_TICKETS,
    PERMISSIONS.ESCALATE_TICKETS
  ],
  
  [ADMIN_ROLES.FINANCE_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_REFUNDS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_FINANCIAL_DATA
  ],
  
  [ADMIN_ROLES.OPERATIONS_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.EDIT_PROPERTIES,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.ASSIGN_MAINTENANCE,
    PERMISSIONS.MANAGE_VENDORS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ADMIN_ROLES.SALES_CUSTOMER_SERVICE_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.CREATE_STAKEHOLDERS,
    PERMISSIONS.EDIT_STAKEHOLDERS,
    PERMISSIONS.ONBOARD_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.RESPOND_TO_TICKETS,
    PERMISSIONS.ESCALATE_TICKETS,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.CONTACT_USERS,
    PERMISSIONS.VIEW_CUSTOMER_FEEDBACK,
    PERMISSIONS.MANAGE_CUSTOMER_FEEDBACK,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ADMIN_ROLES.VIEWER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_STAKEHOLDERS,
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ]
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

// Helper function to check if a role has any of the specified permissions
export const hasAnyPermission = (role, permissionList) => {
  return permissionList.some(permission => hasPermission(role, permission));
};

// Helper function to check if a role has all of the specified permissions
export const hasAllPermissions = (role, permissionList) => {
  return permissionList.every(permission => hasPermission(role, permission));
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Check if role is admin
export const isAdminRole = (role) => {
  return Object.values(ADMIN_ROLES).includes(role);
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'Super Administrator',
    [ADMIN_ROLES.ADMIN]: 'Administrator',
    [ADMIN_ROLES.SUPPORT_ADMIN]: 'Support Administrator',
    [ADMIN_ROLES.FINANCE_ADMIN]: 'Finance Administrator',
    [ADMIN_ROLES.OPERATIONS_ADMIN]: 'Operations Administrator',
    [ADMIN_ROLES.SALES_CUSTOMER_SERVICE_ADMIN]: 'Sales & Customer Service Administrator',
    [ADMIN_ROLES.VIEWER]: 'Viewer'
  };
  return displayNames[role] || role;
};

// Get role description
export const getRoleDescription = (role) => {
  const descriptions = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'Full system access with all permissions including admin management',
    [ADMIN_ROLES.ADMIN]: 'Comprehensive access to manage users, stakeholders, and operations',
    [ADMIN_ROLES.SUPPORT_ADMIN]: 'Handle support tickets, maintenance requests, and user assistance',
    [ADMIN_ROLES.FINANCE_ADMIN]: 'Manage financial operations, payments, and generate reports',
    [ADMIN_ROLES.OPERATIONS_ADMIN]: 'Oversee property operations, maintenance, and vendor management',
    [ADMIN_ROLES.SALES_CUSTOMER_SERVICE_ADMIN]: 'Manage leads, onboard stakeholders, handle customer inquiries and feedback',
    [ADMIN_ROLES.VIEWER]: 'Read-only access to view system data and reports'
  };
  return descriptions[role] || '';
};

export default {
  ADMIN_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isAdminRole,
  getRoleDisplayName,
  getRoleDescription
};

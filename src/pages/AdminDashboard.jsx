import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordExpiryWarning from '../components/PasswordExpiryWarning';

// Admin Pages (lazy loaded)
const AdminOverview = React.lazy(() => import('./Admin/AdminOverview'));
const UserManagement = React.lazy(() => import('./Admin/UserManagement'));
const StakeholderManagement = React.lazy(() => import('./Admin/StakeholderManagement'));
const PropertyManagement = React.lazy(() => import('./Admin/PropertyManagement'));
const FinancialManagement = React.lazy(() => import('./Admin/FinancialManagement'));
const MaintenanceManagement = React.lazy(() => import('./Admin/MaintenanceManagement'));
const AdminManagement = React.lazy(() => import('./Admin/AdminManagement'));
const AuditLogs = React.lazy(() => import('./Admin/AuditLogs'));
const SystemSettings = React.lazy(() => import('./Admin/SystemSettings'));
const MFAManagement = React.lazy(() => import('./Admin/MFAManagement'));

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect if not admin
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const adminNavItems = [
    {
      name: 'Overview',
      path: '/admin-dashboard',
      icon: 'fa-chart-line',
      exact: true
    },
    {
      name: 'Users',
      path: '/admin-dashboard/users',
      icon: 'fa-users',
      permission: 'view_users'
    },
    {
      name: 'Stakeholders',
      path: '/admin-dashboard/stakeholders',
      icon: 'fa-building',
      permission: 'view_stakeholders'
    },
    {
      name: 'Properties',
      path: '/admin-dashboard/properties',
      icon: 'fa-home',
      permission: 'view_properties'
    },
    {
      name: 'Financials',
      path: '/admin-dashboard/financials',
      icon: 'fa-dollar-sign',
      permission: 'view_financials'
    },
    {
      name: 'Maintenance',
      path: '/admin-dashboard/maintenance',
      icon: 'fa-tools',
      permission: 'view_maintenance'
    },
    {
      name: 'Admins',
      path: '/admin-dashboard/admins',
      icon: 'fa-user-shield',
      permission: 'view_admins'
    },
    {
      name: 'Audit Logs',
      path: '/admin-dashboard/audit-logs',
      icon: 'fa-clipboard-list',
      permission: 'view_audit_logs'
    },
    {
      name: 'Security (2FA)',
      path: '/admin-dashboard/mfa',
      icon: 'fa-shield-alt',
      badge: 'Security'
    },
    {
      name: 'Settings',
      path: '/admin-dashboard/settings',
      icon: 'fa-cog',
      permission: 'manage_system_settings'
    }
  ].filter(item => !item.permission || hasPermission(item.permission));

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userRole="admin"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {/* Password Expiry Warning */}
      <PasswordExpiryWarning />
      
      <React.Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users/*" element={<UserManagement />} />
          <Route path="stakeholders/*" element={<StakeholderManagement />} />
          <Route path="properties/*" element={<PropertyManagement />} />
          <Route path="financials/*" element={<FinancialManagement />} />
          <Route path="maintenance/*" element={<MaintenanceManagement />} />
          <Route path="admins/*" element={<AdminManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="mfa" element={<MFAManagement />} />
          <Route path="settings" element={<SystemSettings />} />
        </Routes>
      </React.Suspense>
    </DashboardLayout>
  );
};

export default AdminDashboard;

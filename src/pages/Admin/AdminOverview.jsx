import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleDisplayName } from '../../config/adminRoles';
import adminApi from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || user?.email}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Role: {getRoleDisplayName(user?.role)}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="fa-users"
          color="blue"
          subtitle={`${stats?.activeUsers || 0} active`}
          trend={stats?.userGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats?.userGrowth || 0)}%`}
        />
        
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon="fa-building"
          color="green"
          subtitle={`${stats?.occupancyRate || 0}% occupied`}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          icon="fa-dollar-sign"
          color="purple"
          trend={stats?.revenueGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats?.revenueGrowth || 0)}%`}
        />
        
        <StatCard
          title="Pending Maintenance"
          value={stats?.pendingMaintenance || 0}
          icon="fa-tools"
          color="orange"
          subtitle={`${stats?.maintenanceResolutionRate || 0}% resolved`}
        />
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Distribution
          </h2>
          <div className="space-y-4">
            <UserTypeCard
              type="Tenants"
              count={stats?.activeTenants || 0}
              icon="fa-user"
              color="blue"
              link="/admin-dashboard/users?role=tenant"
            />
            <UserTypeCard
              type="Landlords"
              count={stats?.activeLandlords || 0}
              icon="fa-user-tie"
              color="green"
              link="/admin-dashboard/users?role=landlord"
            />
            <UserTypeCard
              type="Property Managers"
              count={stats?.activeManagers || 0}
              icon="fa-user-cog"
              color="purple"
              link="/admin-dashboard/users?role=manager"
            />
            <UserTypeCard
              type="Agents"
              count={stats?.activeAgents || 0}
              icon="fa-user-tag"
              color="yellow"
              link="/admin-dashboard/users?role=agent"
            />
            <UserTypeCard
              type="Vendors"
              count={stats?.activeVendors || 0}
              icon="fa-user-hard-hat"
              color="orange"
              link="/admin-dashboard/users?role=vendor"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <QuickActionButton
              to="/admin-dashboard/users"
              icon="fa-user-plus"
              text="Manage Users"
              color="blue"
            />
            <QuickActionButton
              to="/admin-dashboard/stakeholders"
              icon="fa-building"
              text="Manage Stakeholders"
              color="green"
            />
            <QuickActionButton
              to="/admin-dashboard/financials"
              icon="fa-chart-bar"
              text="View Financial Reports"
              color="purple"
            />
            <QuickActionButton
              to="/admin-dashboard/maintenance"
              icon="fa-tools"
              text="Maintenance Requests"
              color="orange"
            />
            <QuickActionButton
              to="/admin-dashboard/audit-logs"
              icon="fa-clipboard-list"
              text="View Audit Logs"
              color="gray"
            />
            <QuickActionButton
              to="/admin-dashboard/settings"
              icon="fa-cog"
              text="System Settings"
              color="indigo"
            />
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthIndicator
            label="API Status"
            status="operational"
            icon="fa-server"
          />
          <HealthIndicator
            label="Database"
            status="operational"
            icon="fa-database"
          />
          <HealthIndicator
            label="Payment Gateway"
            status="operational"
            icon="fa-credit-card"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const UserTypeCard = ({ type, count, icon, color, link }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <Link
      to={link}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <span className="font-medium text-gray-900">{type}</span>
      </div>
      <span className="text-2xl font-bold text-gray-900">{count}</span>
    </Link>
  );
};

const QuickActionButton = ({ to, icon, text, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    gray: 'bg-gray-500 hover:bg-gray-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600'
  };

  return (
    <Link
      to={to}
      className={`${colorClasses[color]} text-white px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors`}
    >
      <i className={`fas ${icon}`}></i>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const HealthIndicator = ({ label, status, icon }) => {
  const statusConfig = {
    operational: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      text: 'Operational'
    },
    degraded: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      text: 'Degraded'
    },
    down: {
      color: 'text-red-600',
      bg: 'bg-red-100',
      text: 'Down'
    }
  };

  const config = statusConfig[status] || statusConfig.operational;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <i className={`fas ${icon} text-gray-600`}></i>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};

export default AdminOverview;

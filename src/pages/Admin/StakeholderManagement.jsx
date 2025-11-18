import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/adminRoles';
import PermissionGuard from '../../components/PermissionGuard';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const StakeholderManagement = () => {
  const { hasPermission } = usePermissions();
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '' });

  useEffect(() => {
    loadStakeholders();
  }, [filters]);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllStakeholders(filters);
      setStakeholders(response.stakeholders);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm('Suspend this stakeholder?')) return;
    try {
      await adminApi.suspendStakeholder(id, 'Admin action');
      loadStakeholders();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading stakeholders..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stakeholder Management</h1>
          <p className="text-gray-600 mt-1">Manage landlords, property managers, and agents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="landlord">Landlords</option>
            <option value="manager">Property Managers</option>
            <option value="agent">Agents</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Stakeholders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {stakeholder.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{stakeholder.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{stakeholder.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                stakeholder.status === 'active' ? 'bg-green-100 text-green-800' :
                stakeholder.status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {stakeholder.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <i className="fas fa-envelope mr-2"></i>
                {stakeholder.email}
              </p>
              <p className="text-sm text-gray-600">
                <i className="fas fa-phone mr-2"></i>
                {stakeholder.phone}
              </p>
              <p className="text-sm text-gray-600">
                <i className="fas fa-building mr-2"></i>
                {stakeholder.properties} Properties
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600">
                View Details
              </button>
              <PermissionGuard permission={PERMISSIONS.SUSPEND_STAKEHOLDERS}>
                {stakeholder.status === 'active' && (
                  <button
                    onClick={() => handleSuspend(stakeholder.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    <i className="fas fa-ban"></i>
                  </button>
                )}
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeholderManagement;

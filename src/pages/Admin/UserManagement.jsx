import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/adminRoles';
import PermissionGuard from '../../components/PermissionGuard';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagement = () => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers(filters);
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
      await adminApi.suspendUser(userId, 'Suspended by admin');
      loadUsers();
    } catch (error) {
      alert('Error suspending user: ' + error.message);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminApi.activateUser(userId);
      loadUsers();
    } catch (error) {
      alert('Error activating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      landlord: 'bg-blue-100 text-blue-800',
      tenant: 'bg-green-100 text-green-800',
      manager: 'bg-purple-100 text-purple-800',
      agent: 'bg-yellow-100 text-yellow-800',
      vendor: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.CREATE_USERS}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Add User
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
              <option value="manager">Property Manager</option>
              <option value="agent">Agent</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ role: '', status: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      <PermissionGuard permission={PERMISSIONS.EDIT_USERS}>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Edit User"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </PermissionGuard>
                      
                      <PermissionGuard permission={PERMISSIONS.SUSPEND_STAKEHOLDERS}>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Suspend User"
                          >
                            <i className="fas fa-ban"></i>
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        ) : null}
                      </PermissionGuard>
                      
                      <PermissionGuard permission={PERMISSIONS.DELETE_USERS}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-users text-gray-400 text-5xl mb-4"></i>
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg text-gray-900">{user.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg text-gray-900">{user.phone}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-lg text-gray-900 capitalize">{user.role}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg text-gray-900 capitalize">{user.status}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Joined Date</label>
              <p className="text-lg text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

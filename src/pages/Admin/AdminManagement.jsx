import React, { useState, useEffect } from 'react';
import { PERMISSIONS, ADMIN_ROLES, getRoleDisplayName, getRoleDescription } from '../../config/adminRoles';
import PermissionGuard from '../../components/PermissionGuard';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ADMIN_ROLES.VIEWER,
    password: ''
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const data = await adminApi.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createAdmin(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', role: ADMIN_ROLES.VIEWER, password: '' });
      loadAdmins();
    } catch (error) {
      alert('Error creating admin: ' + error.message);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Delete this admin? This action cannot be undone.')) return;
    try {
      await adminApi.deleteAdmin(id);
      loadAdmins();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading admins..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-1">Manage system administrators and their permissions</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.CREATE_ADMINS}>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Admin
          </button>
        </PermissionGuard>
      </div>

      {/* Admin Roles Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          <i className="fas fa-info-circle mr-2"></i>
          Role-Based Access Control (RBAC)
        </h3>
        <p className="text-sm text-blue-800">
          This system follows the principle of least privilege. Each admin role has specific permissions
          to ensure secure and controlled access to system resources.
        </p>
      </div>

      {/* Admins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getRoleDisplayName(admin.role)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {admin.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Last login: {new Date(admin.lastLogin).toLocaleString()}
              </div>
            </div>
            
            <PermissionGuard permission={PERMISSIONS.DELETE_ADMINS}>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600">
                  Edit
                </button>
                {admin.role !== ADMIN_ROLES.SUPER_ADMIN && (
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </PermissionGuard>
          </div>
        ))}
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Admin</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(ADMIN_ROLES).map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;

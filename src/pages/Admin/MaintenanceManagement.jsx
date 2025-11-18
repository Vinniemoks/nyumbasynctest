import React, { useState, useEffect } from 'react';
import { PERMISSIONS } from '../../config/adminRoles';
import PermissionGuard from '../../components/PermissionGuard';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const MaintenanceManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await adminApi.getAllMaintenanceRequests();
      setRequests(response.requests);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.normal;
  };

  if (loading) return <LoadingSpinner message="Loading maintenance requests..." />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{request.ticketNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{request.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{request.status.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <PermissionGuard permission={PERMISSIONS.ASSIGN_MAINTENANCE}>
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="fas fa-user-plus"></i> Assign
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceManagement;

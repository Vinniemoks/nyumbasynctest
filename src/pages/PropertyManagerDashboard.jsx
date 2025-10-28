import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { useDashboardData } from '../hooks/useDashboardData';
import apiService from '../api/api';

const PropertyManagerDashboard = () => {
  const { properties, maintenance, payments, stats, loading, refresh } = useDashboardData('manager');
  const [activeTab, setActiveTab] = useState('new');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const menuItems = [
    { path: '/manager-dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/manager-dashboard/properties', label: 'Properties', icon: 'fas fa-building' },
    { path: '/manager-dashboard/tenants', label: 'Tenants', icon: 'fas fa-users' },
    { path: '/manager-dashboard/finances', label: 'Finances', icon: 'fas fa-wallet' },
    { path: '/manager-dashboard/maintenance', label: 'Maintenance', icon: 'fas fa-tools' },
    { path: '/manager-dashboard/analytics', label: 'Analytics', icon: 'fas fa-chart-line' }
  ];

  const filterMaintenanceByStatus = (status) => {
    const statusMap = {
      new: 'pending',
      'in-progress': 'in_progress',
      completed: 'completed'
    };
    return maintenance.filter(m => m.status === statusMap[status]);
  };

  const handleUpdateMaintenance = async (id, status) => {
    try {
      await apiService.updateMaintenanceRequest(id, { status });
      refresh();
    } catch (error) {
      alert('Failed to update maintenance: ' + error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="manager" menuItems={menuItems}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const rentCollectionRate = stats.totalRent > 0 
    ? ((stats.rentCollected / payments.length) * 100).toFixed(0) 
    : 0;

  return (
    <DashboardLayout role="manager" menuItems={menuItems}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Property Manager Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Portfolio"
            value={`${stats.portfolioSize || 0} Properties`}
            subtitle={`${properties.filter(p => !p.occupied).length} vacant`}
            icon="fas fa-building"
            color="blue"
          />
          <StatCard
            title="Rent Collection"
            value={`${rentCollectionRate}%`}
            subtitle={`KSh ${stats.totalRent?.toLocaleString() || 0} collected`}
            icon="fas fa-wallet"
            color="green"
          />
          <StatCard
            title="Maintenance"
            value={`${stats.activeMaintenance || 0} Active`}
            subtitle={`${filterMaintenanceByStatus('new').length} urgent`}
            icon="fas fa-tools"
            color="red"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Lease Alerts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.slice(0, 5).map((property, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {property.address || `Property ${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.tenant || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {property.leaseExpiry || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">Renew</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Maintenance Queue</h3>
          
          <div className="flex space-x-4 mb-4 border-b">
            {['new', 'in-progress', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')} ({filterMaintenanceByStatus(tab).length})
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filterMaintenanceByStatus(activeTab).length > 0 ? (
              filterMaintenanceByStatus(activeTab).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.description || 'Maintenance Request'}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.property || 'Property'}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted: {item.date || 'Recently'}</p>
                    </div>
                    <div className="flex space-x-2">
                      {activeTab === 'new' && (
                        <button
                          onClick={() => handleUpdateMaintenance(item.id, 'in_progress')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Start
                        </button>
                      )}
                      {activeTab === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateMaintenance(item.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No {activeTab} maintenance requests</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagerDashboard;

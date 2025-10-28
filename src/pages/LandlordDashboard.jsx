import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { useDashboardData } from '../hooks/useDashboardData';
import apiService from '../api/api';

const LandlordDashboard = () => {
  const { properties, maintenance, stats, loading, refresh } = useDashboardData('landlord');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    address: '',
    units: 1,
    rent: ''
  });

  const menuItems = [
    { path: '/landlord-dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/landlord-dashboard/properties', label: 'Properties', icon: 'fas fa-home' },
    { path: '/landlord-dashboard/tenants', label: 'Tenants', icon: 'fas fa-users' },
    { path: '/landlord-dashboard/finances', label: 'Finances', icon: 'fas fa-money-bill-wave' },
    { path: '/landlord-dashboard/maintenance', label: 'Maintenance', icon: 'fas fa-tools' },
    { path: '/landlord-dashboard/documents', label: 'Documents', icon: 'fas fa-file-contract' }
  ];

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      await apiService.createProperty(propertyForm);
      setShowAddProperty(false);
      setPropertyForm({ address: '', units: 1, rent: '' });
      refresh();
    } catch (error) {
      alert('Failed to add property: ' + error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="landlord" menuItems={menuItems}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="landlord" menuItems={menuItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <button
            onClick={() => setShowAddProperty(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <i className="fas fa-plus mr-2"></i>Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Monthly Income"
            value={`KSh ${stats.totalIncome?.toLocaleString() || 0}`}
            subtitle={`From ${stats.totalProperties || 0} properties`}
            icon="fas fa-money-bill-wave"
            color="green"
          />
          <StatCard
            title="Vacancies"
            value={stats.vacancies || 0}
            subtitle={`${((stats.vacancies / stats.totalProperties) * 100 || 0).toFixed(0)}% vacancy rate`}
            icon="fas fa-home"
            color="yellow"
          />
          <StatCard
            title="Maintenance"
            value={`${stats.maintenanceRequests || 0} Requests`}
            subtitle="Pending approval"
            icon="fas fa-tools"
            color="red"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Your Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <h4 className="font-semibold text-lg">{property.address}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p><i className="fas fa-door-open mr-2"></i>{property.units} Units</p>
                    <p><i className="fas fa-chart-line mr-2"></i>Occupancy: {property.occupancy || 0}%</p>
                    <p><i className="fas fa-money-bill mr-2"></i>Rent: KSh {property.rent?.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">No properties yet. Add your first property!</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {maintenance.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border-l-4 border-blue-500 bg-gray-50">
                <i className="fas fa-tools text-blue-600"></i>
                <div className="flex-1">
                  <p className="font-medium">{item.description || 'Maintenance request'}</p>
                  <p className="text-sm text-gray-500">{item.property || 'Property'}</p>
                </div>
                <span className="text-sm text-gray-400">{item.time || 'Recently'}</span>
              </div>
            ))}
            {maintenance.length === 0 && (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {showAddProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Add New Property</h3>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Units</label>
                <input
                  type="number"
                  value={propertyForm.units}
                  onChange={(e) => setPropertyForm({ ...propertyForm, units: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rent (KSh)</label>
                <input
                  type="number"
                  value={propertyForm.rent}
                  onChange={(e) => setPropertyForm({ ...propertyForm, rent: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Property
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProperty(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LandlordDashboard;

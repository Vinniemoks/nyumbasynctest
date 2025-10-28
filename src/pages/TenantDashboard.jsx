import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { useDashboardData } from '../hooks/useDashboardData';
import apiService from '../api/api';

const TenantDashboard = () => {
  const { properties, maintenance, payments, stats, loading, refresh } = useDashboardData('tenant');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    priority: 'medium',
    category: 'plumbing'
  });

  const menuItems = [
    { path: '/tenant-dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/tenant-dashboard/rentals', label: 'My Rentals', icon: 'fas fa-house-user' },
    { path: '/tenant-dashboard/payments', label: 'Payments', icon: 'fas fa-receipt' },
    { path: '/tenant-dashboard/maintenance', label: 'Maintenance', icon: 'fas fa-tools' },
    { path: '/tenant-dashboard/documents', label: 'Documents', icon: 'fas fa-file-contract' },
    { path: '/tenant-dashboard/settings', label: 'Settings', icon: 'fas fa-cog' }
  ];

  const handlePayRent = async () => {
    try {
      await apiService.createRentPayment({
        amount: stats.rentDue,
        method: 'mpesa'
      });
      setShowPaymentModal(false);
      refresh();
      alert('Payment initiated successfully!');
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    try {
      await apiService.createMaintenanceRequest(maintenanceForm);
      setShowMaintenanceForm(false);
      setMaintenanceForm({ description: '', priority: 'medium', category: 'plumbing' });
      refresh();
      alert('Maintenance request submitted successfully!');
    } catch (error) {
      alert('Failed to submit request: ' + error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="tenant" menuItems={menuItems}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const currentProperty = properties[0] || {};

  return (
    <DashboardLayout role="tenant" menuItems={menuItems}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Tenant Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Rent Due"
            value={`KSh ${stats.rentDue?.toLocaleString() || 0}`}
            subtitle={`Due in ${stats.daysUntilRent || 0} days`}
            icon="fas fa-money-bill-wave"
            color="blue"
          />
          <StatCard
            title="Maintenance"
            value={`${stats.maintenanceActive || 0} Active`}
            subtitle="Requests pending"
            icon="fas fa-tools"
            color="yellow"
          />
          <StatCard
            title="Inspection"
            value="Upcoming"
            subtitle="15th June, 10 AM"
            icon="fas fa-clipboard-check"
            color="purple"
          />
          <StatCard
            title="Lease End"
            value="45 Days"
            subtitle="Renewal available"
            icon="fas fa-file-signature"
            color="green"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            <i className="fas fa-money-bill-wave mr-2"></i>Pay Rent
          </button>
          <button
            onClick={() => setShowMaintenanceForm(true)}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
          >
            <i className="fas fa-tools mr-2"></i>Request Help
          </button>
          <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition">
            <i className="fas fa-envelope mr-2"></i>Message
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {maintenance.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border-l-4 border-blue-500 bg-gray-50">
                <i className={`fas ${item.icon || 'fa-check-circle'} text-blue-600`}></i>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title || 'Activity'}</h4>
                  <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                </div>
                <span className="text-sm text-gray-400">{item.time || 'Recently'}</span>
              </div>
            ))}
            {maintenance.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={currentProperty.image || 'https://via.placeholder.com/400x300'}
                alt="Property"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <h3 className="text-2xl font-semibold mb-2">
                {currentProperty.address || '123 Riverside Drive, Nairobi'}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {currentProperty.bedrooms || 3} Bedrooms
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {currentProperty.bathrooms || 2} Bathrooms
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Parking</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Balcony</span>
              </div>
              <p className="text-gray-600">
                Your current rental property. Lease ends on {currentProperty.leaseEnd || '15th August 2024'}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Pay Rent</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amount Due</p>
                <p className="text-3xl font-bold text-gray-900">KSh {stats.rentDue?.toLocaleString() || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>M-Pesa</option>
                  <option>Bank Transfer</option>
                  <option>Card Payment</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePayRent}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Request Maintenance</h3>
            <form onSubmit={handleSubmitMaintenance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={maintenanceForm.category}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance">Appliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  required
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowMaintenanceForm(false)}
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

export default TenantDashboard;

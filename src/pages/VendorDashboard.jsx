import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

function VendorDashboard() {
  const menuItems = [
    { path: '/vendor-dashboard', label: 'Overview', icon: 'fas fa-home' },
    { path: '/vendor-dashboard/jobs', label: 'My Jobs', icon: 'fas fa-wrench' },
    { path: '/vendor-dashboard/schedule', label: 'Schedule', icon: 'fas fa-calendar' },
    { path: '/vendor-dashboard/invoices', label: 'Invoices', icon: 'fas fa-file-invoice' },
    { path: '/vendor-dashboard/profile', label: 'Profile', icon: 'fas fa-user' },
  ];

  return (
    <DashboardLayout role="vendor" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<VendorOverview />} />
        <Route path="/jobs" element={<VendorJobs />} />
        <Route path="/schedule" element={<VendorSchedule />} />
        <Route path="/invoices" element={<VendorInvoices />} />
        <Route path="/profile" element={<VendorProfile />} />
      </Routes>
    </DashboardLayout>
  );
}

function VendorOverview() {
  const stats = [
    { label: 'Active Jobs', value: '12', change: '+3', icon: '🔧' },
    { label: 'Completed This Month', value: '28', change: '+8', icon: '✅' },
    { label: 'Total Earnings', value: 'KES 245K', change: '+15%', icon: '💰' },
    { label: 'Pending Invoices', value: '5', change: '-2', icon: '📄' },
  ];

  const activeJobs = [
    { id: 1, property: 'Kilimani Apartments - Unit 3B', type: 'Plumbing', priority: 'High', date: 'Today', time: '2:00 PM' },
    { id: 2, property: 'Westlands Office Complex', type: 'Electrical', priority: 'Medium', date: 'Tomorrow', time: '10:00 AM' },
    { id: 3, property: 'Lavington Residence', type: 'HVAC', priority: 'Low', date: 'Oct 31', time: '3:00 PM' },
    { id: 4, property: 'CBD Retail Space', type: 'Painting', priority: 'Medium', date: 'Nov 1', time: '9:00 AM' },
  ];

  const recentActivity = [
    { id: 1, action: 'Job completed', property: 'Karen Villa', time: '2 hours ago', status: 'success' },
    { id: 2, action: 'New job assigned', property: 'Kilimani Apartments', time: '5 hours ago', status: 'info' },
    { id: 3, action: 'Invoice paid', property: 'Westlands Office', time: '1 day ago', status: 'success' },
    { id: 4, action: 'Job rescheduled', property: 'Lavington Residence', time: '2 days ago', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600">Manage your service jobs and schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
            <Link to="/vendor-dashboard/jobs" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{job.property}</p>
                    <p className="text-sm text-gray-600 mt-1">{job.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.priority === 'High' ? 'bg-red-100 text-red-700' :
                    job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {job.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{job.date}</span>
                  <span className="text-xs text-gray-500">{job.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.property}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-sm font-medium text-gray-700">View Schedule</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-gray-700">Complete Job</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm font-medium text-gray-700">Create Invoice</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm font-medium text-gray-700">Contact Support</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorJobs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600">View and manage your service jobs</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Filter
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Job management coming soon...</p>
      </div>
    </div>
  );
}

function VendorSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600">View your upcoming appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Schedule calendar coming soon...</p>
      </div>
    </div>
  );
}

function VendorInvoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and payments</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Invoice management coming soon...</p>
      </div>
    </div>
  );
}

function VendorProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
        <p className="text-gray-600">Manage your business profile and services</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Profile settings coming soon...</p>
      </div>
    </div>
  );
}

export default VendorDashboard;

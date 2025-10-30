import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

function AgentDashboard() {
  const menuItems = [
    { path: '/agent-dashboard', label: 'Overview', icon: 'fas fa-home' },
    { path: '/agent-dashboard/properties', label: 'My Listings', icon: 'fas fa-building' },
    { path: '/agent-dashboard/clients', label: 'Clients', icon: 'fas fa-users' },
    { path: '/agent-dashboard/commissions', label: 'Commissions', icon: 'fas fa-dollar-sign' },
    { path: '/agent-dashboard/profile', label: 'Profile', icon: 'fas fa-user' },
  ];

  return (
    <DashboardLayout role="agent" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<AgentOverview />} />
        <Route path="/properties" element={<AgentProperties />} />
        <Route path="/clients" element={<AgentClients />} />
        <Route path="/commissions" element={<AgentCommissions />} />
        <Route path="/profile" element={<AgentProfile />} />
      </Routes>
    </DashboardLayout>
  );
}

function AgentOverview() {
  const stats = [
    { label: 'Active Listings', value: '24', change: '+3', icon: '🏠' },
    { label: 'Total Clients', value: '47', change: '+5', icon: '👥' },
    { label: 'This Month Commission', value: 'KES 185K', change: '+12%', icon: '💰' },
    { label: 'Pending Viewings', value: '8', change: '+2', icon: '📅' },
  ];

  const recentListings = [
    { id: 1, property: '3BR Apartment - Kilimani', type: 'Residential', price: 'KES 85,000/mo', status: 'Active', views: 45 },
    { id: 2, property: 'Office Space - Westlands', type: 'Commercial', price: 'KES 150,000/mo', status: 'Active', views: 32 },
    { id: 3, property: '2BR Apartment - Lavington', type: 'Residential', price: 'KES 65,000/mo', status: 'Pending', views: 28 },
    { id: 4, property: 'Retail Shop - CBD', type: 'Commercial', price: 'KES 120,000/mo', status: 'Active', views: 51 },
  ];

  const upcomingViewings = [
    { id: 1, property: '3BR Apartment - Kilimani', client: 'John Kamau', date: 'Today', time: '2:00 PM' },
    { id: 2, property: 'Office Space - Westlands', client: 'Sarah Wanjiku', date: 'Tomorrow', time: '10:00 AM' },
    { id: 3, property: '2BR Apartment - Lavington', client: 'Michael Omondi', date: 'Oct 31', time: '3:30 PM' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600">Manage your listings and client relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
            <Link to="/agent-dashboard/properties" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{listing.property}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{listing.type}</span>
                    <span className="text-xs font-medium text-indigo-600">{listing.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    listing.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {listing.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{listing.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Viewings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Viewings</h2>
            <Link to="/agent-dashboard/properties" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingViewings.map((viewing) => (
              <div key={viewing.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">{viewing.property}</p>
                <p className="text-sm text-gray-600 mt-1">Client: {viewing.client}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{viewing.date}</span>
                  <span className="text-xs text-gray-500">{viewing.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentProperties() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Add Listing
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Property listings management coming soon...</p>
      </div>
    </div>
  );
}

function AgentClients() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Client management coming soon...</p>
      </div>
    </div>
  );
}

function AgentCommissions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
        <p className="text-gray-600">Track your earnings and commissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Commission tracking coming soon...</p>
      </div>
    </div>
  );
}

function AgentProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
        <p className="text-gray-600">Manage your professional profile</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Profile settings coming soon...</p>
      </div>
    </div>
  );
}

export default AgentDashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      const roleRoutes = {
        landlord: '/landlord-dashboard',
        manager: '/manager-dashboard',
        tenant: '/tenant-dashboard',
        agent: '/agent-dashboard',
        vendor: '/vendor-dashboard',
        admin: '/admin-dashboard'
      };
      navigate(roleRoutes[user.role] || '/');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: 'fa-home',
      title: 'Property Management',
      description: 'Manage multiple properties, units, and tenants from one dashboard'
    },
    {
      icon: 'fa-money-bill-wave',
      title: 'Payment Processing',
      description: 'Accept rent payments via M-Pesa, cards, and bank transfers'
    },
    {
      icon: 'fa-tools',
      title: 'Maintenance Tracking',
      description: 'Track and manage maintenance requests efficiently'
    },
    {
      icon: 'fa-chart-line',
      title: 'Financial Reports',
      description: 'Comprehensive analytics and financial reporting'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure & Compliant',
      description: 'Grade A+ security with MFA and audit logging'
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Access your dashboard from any device, anywhere'
    }
  ];

  const userTypes = [
    {
      title: 'Landlords',
      description: 'Manage your properties, track income, and communicate with tenants',
      icon: 'fa-building',
      color: 'blue'
    },
    {
      title: 'Property Managers',
      description: 'Professional tools for managing multiple properties and clients',
      icon: 'fa-briefcase',
      color: 'purple'
    },
    {
      title: 'Tenants',
      description: 'Pay rent, submit maintenance requests, and manage your lease',
      icon: 'fa-house-user',
      color: 'green'
    },
    {
      title: 'Agents',
      description: 'List properties, manage leads, and close deals faster',
      icon: 'fa-handshake',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className="fas fa-home text-blue-600 text-2xl mr-2"></i>
              <span className="text-2xl font-bold text-gray-900">NyumbaSync</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Property Management
            <span className="block text-blue-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your property management with our all-in-one platform. 
            Manage properties, collect rent, track maintenance, and more.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">10K+</div>
            <div className="text-gray-600 mt-2">Properties Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600 mt-2">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">KSh 2B+</div>
            <div className="text-gray-600 mt-2">Rent Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">99.9%</div>
            <div className="text-gray-600 mt-2">Uptime</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features to manage your properties efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className={`fas ${feature.icon} text-blue-600 text-xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built For Everyone</h2>
            <p className="text-xl text-gray-600">Solutions tailored to your role</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
                <div className={`h-16 w-16 bg-${type.color}-100 rounded-full flex items-center justify-center mb-4`}>
                  <i className={`fas ${type.icon} text-${type.color}-600 text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of property managers who trust NyumbaSync
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-home text-2xl mr-2"></i>
                <span className="text-xl font-bold">NyumbaSync</span>
              </div>
              <p className="text-gray-400">Modern property management made simple</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NyumbaSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

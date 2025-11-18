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
      image: '/images/feature1-icon.png',
      title: 'Property Management',
      description: 'Manage multiple properties, units, and tenants from one dashboard'
    },
    {
      image: '/images/feature2-icon.png',
      title: 'Payment Processing',
      description: 'Accept rent payments via M-Pesa, cards, and bank transfers'
    },
    {
      image: '/images/feature3-icon.png',
      title: 'Maintenance Tracking',
      description: 'Track and manage maintenance requests efficiently'
    }
  ];

  const userTypes = [
    {
      title: 'Landlords',
      description: 'Manage your properties, track income, and communicate with tenants',
      icon: '🏢'
    },
    {
      title: 'Property Managers',
      description: 'Professional tools for managing multiple properties and clients',
      icon: '📋'
    },
    {
      title: 'Tenants',
      description: 'Pay rent, submit maintenance requests, and manage your lease',
      icon: '🏠'
    },
    {
      title: 'Agents',
      description: 'List properties, manage leads, and close deals faster',
      icon: '💼'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-900/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="NyumbaSync" className="h-10 w-10 rounded-full bg-white/10 p-1" />
              <span className="text-2xl font-semibold">NyumbaSync</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-white/80 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">
              Modern Property Management
              <span className="block text-indigo-400 mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Streamline your property management with our all-in-one platform. 
              Manage properties, collect rent, track maintenance, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white text-lg font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white text-lg font-semibold rounded-lg border border-white/10 transition"
              >
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/images/hero-image.jpg" 
              alt="Property Management Dashboard" 
              className="rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-400">10K+</div>
            <div className="text-white/60 mt-2">Properties Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-400">50K+</div>
            <div className="text-white/60 mt-2">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-400">KSh 2B+</div>
            <div className="text-white/60 mt-2">Rent Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-400">99.9%</div>
            <div className="text-white/60 mt-2">Uptime</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-white/70">Powerful features to manage your properties efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-8 hover:border-indigo-400/60 transition">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="h-16 w-16 mb-6 rounded-lg"
                />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built For Everyone</h2>
            <p className="text-xl text-white/70">Solutions tailored to your role</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-6 hover:border-indigo-400/60 hover:-translate-y-2 transition">
                <div className="text-5xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                <p className="text-white/70 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of property managers who trust NyumbaSync
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white text-lg font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-900/40 backdrop-blur py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/logo.png" alt="NyumbaSync" className="h-8 w-8 rounded-full bg-white/10 p-1" />
                <span className="text-xl font-semibold">NyumbaSync</span>
              </div>
              <p className="text-white/60">Modern property management made simple</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2025 NyumbaSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

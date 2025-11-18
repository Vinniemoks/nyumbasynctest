import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdminRole } from '../config/adminRoles';
import { mfaSessionManager } from '../utils/mfaService';
import MFAVerification from '../components/MFAVerification';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMFAVerification, setShowMFAVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({
        identifier: formData.email,
        password: formData.password
      });

      // Check if user has admin role
      if (response.user && isAdminRole(response.user.role)) {
        // Check if MFA is enabled for this user
        if (response.user.mfaEnabled) {
          // Store pending session for MFA verification
          mfaSessionManager.setPendingSession({
            userId: response.user.id,
            email: response.user.email,
            role: response.user.role,
            token: response.token,
            mfaSecret: response.user.mfaSecret,
            backupCodes: response.user.backupCodes
          });
          
          setShowMFAVerification(true);
        } else {
          // No MFA required, proceed to dashboard
          navigate('/admin-dashboard');
        }
      } else {
        setError('Access denied. Admin credentials required.');
        // Logout non-admin user
        await login.logout();
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerified = (session) => {
    // MFA verification successful, proceed to dashboard
    navigate('/admin-dashboard');
  };

  const handleMFACancel = () => {
    setShowMFAVerification(false);
    mfaSessionManager.clearPendingSession();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show MFA verification screen if needed
  if (showMFAVerification) {
    return <MFAVerification onVerified={handleMFAVerified} onCancel={handleMFACancel} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <i className="fas fa-shield-alt text-3xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-indigo-100">NyumbaSync Administration</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="admin@nyumbasync.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              ← Back to User Login
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-start text-white text-sm">
            <i className="fas fa-info-circle mt-0.5 mr-2"></i>
            <p>
              This is a secure admin portal. All login attempts are monitored and logged.
              Unauthorized access attempts will be reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

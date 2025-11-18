import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { passwordExpirationManager } from '../utils/passwordPolicy';

const PasswordExpiryWarning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expiryStatus, setExpiryStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkPasswordExpiry();
    }
  }, [user]);

  const checkPasswordExpiry = () => {
    const status = passwordExpirationManager.getExpiryStatus(user.id);
    setExpiryStatus(status);
  };

  const handleChangePassword = () => {
    navigate('/admin-dashboard/settings?tab=security');
  };

  const handleDismiss = () => {
    setDismissed(true);
    passwordExpirationManager.markNotificationShown(user.id);
  };

  // Don't show if dismissed or no status
  if (dismissed || !expiryStatus) return null;

  // Password expired - show critical alert
  if (expiryStatus.expired) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Password Expired</h3>
              <p className="text-sm text-gray-600">Action required</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              Your password has expired and must be changed immediately for security reasons.
              {expiryStatus.role && expiryStatus.role.includes('admin') && (
                <span className="block mt-2 font-semibold">
                  Admin passwords expire every 30 days.
                </span>
              )}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Change Password Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password expiring soon - show warning banner
  if (expiryStatus.showWarning) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
            <div>
              <h4 className="font-semibold text-yellow-900">Password Expiring Soon</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Your password will expire in <strong>{expiryStatus.daysUntilExpiry} day{expiryStatus.daysUntilExpiry !== 1 ? 's' : ''}</strong>.
                {expiryStatus.role && expiryStatus.role.includes('admin') && (
                  <span className="block mt-1">
                    Admin passwords must be changed every 30 days for security.
                  </span>
                )}
              </p>
              <button
                onClick={handleChangePassword}
                className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                Change Password Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PasswordExpiryWarning;

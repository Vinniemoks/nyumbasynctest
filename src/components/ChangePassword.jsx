import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePasswordPolicy, passwordExpirationManager, generateStrongPassword } from '../utils/passwordPolicy';
import { auditLogger } from '../utils/auditLogger';

const ChangePassword = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);

  const isAdmin = user?.role && ['super_admin', 'admin', 'support_admin', 'finance_admin', 'operations_admin', 'sales_customer_service_admin'].includes(user.role);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate new password in real-time
    if (name === 'newPassword' && value) {
      const result = validatePasswordPolicy(value, user?.role);
      setValidation(result);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(16, isAdmin);
    setFormData(prev => ({ ...prev, newPassword: generated, confirmPassword: generated }));
    setShowGenerated(true);
    setShowPassword(true);
    
    const result = validatePasswordPolicy(generated, user?.role);
    setValidation(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate new password
      const validation = validatePasswordPolicy(formData.newPassword, user?.role);
      if (!validation.valid) {
        setError(validation.errors[0]);
        setLoading(false);
        return;
      }

      // Check passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // In real app, call API to change password
      // await apiService.changePassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });

      // Update password expiry
      passwordExpirationManager.setPasswordChanged(user.id, user.role);

      // Audit log
      auditLogger.logSecurity('password_changed', {
        userId: user.id,
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // Success
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score < 60) return 'bg-red-500';
    if (score < 85) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score) => {
    if (score < 60) return 'Weak';
    if (score < 85) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <p className="text-sm text-gray-600 mt-1">
            {isAdmin ? 'Admin passwords expire every 30 days' : 'Update your password regularly'}
          </p>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">
          {isAdmin ? 'Admin Password Requirements (Grade A)' : 'Password Requirements'}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Minimum {isAdmin ? '12' : '8'} characters</li>
          <li>✓ At least {isAdmin ? '2' : '1'} uppercase letter{isAdmin ? 's' : ''}</li>
          <li>✓ At least {isAdmin ? '2' : '1'} lowercase letter{isAdmin ? 's' : ''}</li>
          <li>✓ At least {isAdmin ? '2' : '1'} number{isAdmin ? 's' : ''}</li>
          <li>✓ At least {isAdmin ? '2' : '1'} special character{isAdmin ? 's' : ''} (!@#$%^&*)</li>
          <li>✓ No common patterns (password, admin, 12345, etc.)</li>
          <li>✓ No repeating or sequential characters</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* New Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              <i className="fas fa-magic mr-1"></i>
              Generate Strong Password
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>

          {/* Password Strength Indicator */}
          {validation && formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Password Strength:</span>
                <span className={`font-semibold ${validation.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {getStrengthText(validation.strength)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStrengthColor(validation.strength)}`}
                  style={{ width: `${validation.strength}%` }}
                ></div>
              </div>
              
              {/* Validation Errors */}
              {validation.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validation.errors.map((err, index) => (
                    <p key={index} className="text-xs text-red-600">
                      <i className="fas fa-times-circle mr-1"></i>
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {showGenerated && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">
                <i className="fas fa-check-circle mr-1"></i>
                Strong password generated! Make sure to save it securely.
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              <i className="fas fa-times-circle mr-1"></i>
              Passwords do not match
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !validation?.valid || formData.newPassword !== formData.confirmPassword}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Changing...
              </span>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

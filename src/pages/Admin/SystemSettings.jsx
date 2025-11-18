import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminApi.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateSystemSettings(settings);
      alert('Settings saved successfully');
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={settings?.currency || 'KES'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.maintenanceMode || false}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Allow Registration</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.allowRegistration || false}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.emailNotifications || false}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.smsNotifications || false}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Gateway</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Provider</label>
              <select
                value={settings?.paymentGateway || 'mpesa'}
                onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <i className="fas fa-shield-alt mr-2"></i>
                Security settings are managed through environment variables and cannot be changed here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

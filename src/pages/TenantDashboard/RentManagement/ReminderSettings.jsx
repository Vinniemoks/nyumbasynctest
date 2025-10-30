import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import apiService from '../../../api/api';

const ReminderSettings = ({ onUpdate }) => {
  const [reminderTiming, setReminderTiming] = useState('7');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentSettings, setCurrentSettings] = useState(null);

  useEffect(() => {
    fetchReminderSettings();
  }, []);

  const fetchReminderSettings = async () => {
    try {
      const settings = await apiService.get('/tenant/rent/reminder-settings');
      setCurrentSettings(settings);
      setReminderTiming(settings.reminderTiming?.toString() || '7');
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
      // Use default settings
      setReminderTiming('7');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const settingsData = {
        reminderTiming: parseInt(reminderTiming),
        enabled: true
      };

      await apiService.post('/tenant/rent/reminder-settings', settingsData);
      setMessage({ type: 'success', text: 'Reminder settings saved successfully!' });
      if (onUpdate) onUpdate();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      setMessage({ type: 'error', text: 'Failed to save reminder settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getReminderDescription = (days) => {
    if (days === '7') return 'You\'ll receive a reminder one week before rent is due';
    if (days === '3') return 'You\'ll receive a reminder three days before rent is due';
    if (days === '1') return 'You\'ll receive a reminder one day before rent is due';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rent Payment Reminders</h3>
            <p className="text-sm text-gray-600">Customize when you receive rent payment reminders</p>
          </div>
        </div>

        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reminder Timing
            </label>
            <div className="space-y-3">
              {[
                { value: '7', label: '7 days before', description: 'Recommended for planning ahead' },
                { value: '3', label: '3 days before', description: 'Good balance of notice' },
                { value: '1', label: '1 day before', description: 'Last-minute reminder' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReminderTiming(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    reminderTiming === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        reminderTiming === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {reminderTiming === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">How Reminders Work</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {getReminderDescription(reminderTiming)}. You'll receive notifications via:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>In-app notification</li>
                  <li>Email notification</li>
                  <li>SMS (if enabled)</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Reminder Settings'}
          </button>
        </form>
      </div>

      {currentSettings && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Settings</h4>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>
              Reminders enabled - You'll be notified {currentSettings.reminderTiming || 7} day(s) before rent is due
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;

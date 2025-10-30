import { useState, useEffect } from 'react';
import socketService from '../../config/socket';

/**
 * NotificationDemo Component
 * 
 * This component demonstrates the real-time notification system.
 * It allows testing different notification types by simulating server events.
 */
const NotificationDemo = () => {
  const [connectionStatus, setConnectionStatus] = useState({ connected: false });
  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    // Subscribe to connection status
    const unsubscribe = socketService.on('connection_status', (status) => {
      setConnectionStatus(status);
      addToLog('Connection Status', status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToLog = (event, data) => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      event,
      data: JSON.stringify(data, null, 2)
    };
    setEventLog(prev => [logEntry, ...prev].slice(0, 20)); // Keep last 20 entries
  };

  const simulateNotification = (type) => {
    const notifications = {
      rent_reminder: {
        message: 'Your rent of KES 50,000 is due in 3 days.',
        amount: 50000,
        daysUntilDue: 3,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      payment_confirmed: {
        message: 'Your payment of KES 50,000 has been confirmed.',
        amount: 50000,
        transactionReference: `TXN-${Date.now()}`,
        paymentDate: new Date().toISOString()
      },
      maintenance_update: {
        message: 'Your maintenance request #TKT-12345 has been updated to: in_progress',
        ticketNumber: 'TKT-12345',
        status: 'in_progress',
        requestId: 12345
      },
      guest_arrived: {
        message: 'John Smith has arrived at the property.',
        guestName: 'John Smith',
        arrivalTime: new Date().toISOString()
      },
      emergency_alert: {
        title: 'Fire Alarm Activated',
        message: 'A fire alarm has been activated on Floor 3. Please evacuate immediately using the nearest exit.',
        priority: 'urgent',
        location: 'Floor 3'
      },
      announcement: {
        id: Date.now(),
        title: 'Building Maintenance Notice',
        message: 'The building water supply will be temporarily shut off tomorrow from 9 AM to 12 PM for maintenance work.',
        priority: 'high'
      }
    };

    const notificationData = notifications[type];
    if (notificationData) {
      // Emit the event through socket service (simulating server event)
      socketService.emit(type, notificationData);
      addToLog(`Simulated ${type}`, notificationData);
      
      // Also trigger it locally for testing
      if (socketService.getSocket()) {
        socketService.getSocket().emit(type, notificationData);
      }
    }
  };

  const clearLog = () => {
    setEventLog([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Real-Time Notification System Demo
        </h1>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                WebSocket Connection Status
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-gray-700">
                  {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {connectionStatus.error && (
                <p className="text-sm text-red-600 mt-1">
                  Error: {connectionStatus.error}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <p>Socket URL: {import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'}</p>
            </div>
          </div>
        </div>

        {/* Notification Simulators */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Simulate Notifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => simulateNotification('rent_reminder')}
              className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-clock mr-2"></i>
              Rent Reminder
            </button>
            <button
              onClick={() => simulateNotification('payment_confirmed')}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-check-circle mr-2"></i>
              Payment Confirmed
            </button>
            <button
              onClick={() => simulateNotification('maintenance_update')}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-tools mr-2"></i>
              Maintenance Update
            </button>
            <button
              onClick={() => simulateNotification('guest_arrived')}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-user-friends mr-2"></i>
              Guest Arrived
            </button>
            <button
              onClick={() => simulateNotification('emergency_alert')}
              className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Emergency Alert
            </button>
            <button
              onClick={() => simulateNotification('announcement')}
              className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-bullhorn mr-2"></i>
              Announcement
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Event Log
            </h2>
            <button
              onClick={clearLog}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Clear Log
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-gray-400 text-sm">No events logged yet. Click a button above to simulate notifications.</p>
            ) : (
              <div className="space-y-3">
                {eventLog.map((entry, index) => (
                  <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400 font-mono text-sm">{entry.event}</span>
                      <span className="text-gray-500 text-xs">{entry.timestamp}</span>
                    </div>
                    <pre className="text-gray-300 text-xs overflow-x-auto">
                      {entry.data}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            <i className="fas fa-info-circle mr-2"></i>
            How to Use
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click any button above to simulate a notification event</li>
            <li>• Check the notification bell icon in the header to see the notification</li>
            <li>• The event log below shows all simulated events</li>
            <li>• In production, these events would be sent from the server via WebSocket</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;

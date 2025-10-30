import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/api';
import notificationService from '../../services/notificationService';
import socketService from '../../config/socket';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on mount
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    // Calculate initial unread count
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        return notifications.filter(n => !n.read).length;
      }
    } catch (error) {
      console.error('Failed to calculate unread count:', error);
    }
    return 0;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to persist notifications to localStorage:', error);
    }
  }, [notifications]);

  useEffect(() => {
    // Initialize WebSocket connection
    const userId = localStorage.getItem('userId') || 'demo-user';
    socketService.connect(userId);

    // Fetch initial notifications
    fetchNotifications();
    
    // Subscribe to notification service (for local notifications)
    const unsubscribe = notificationService.subscribe((notification) => {
      addNotification(notification);
    });
    
    // Set up polling for new notifications every 30 seconds (fallback)
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    // Listen for building-wide emergency alerts (legacy support)
    const handleBuildingAlert = (event) => {
      const alert = event.detail;
      
      const alertNotification = {
        id: `alert-${alert.id}`,
        type: 'emergency',
        title: alert.title,
        message: alert.message,
        priority: alert.priority || 'urgent',
        timestamp: alert.sentAt,
        read: false,
        actionUrl: '/tenant-dashboard/emergency',
        data: { alertId: alert.id }
      };
      
      addNotification(alertNotification);
    };

    window.addEventListener('buildingAlert', handleBuildingAlert);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Subscribe to WebSocket connection status
    const unsubscribeConnectionStatus = socketService.on('connection_status', (status) => {
      setConnectionStatus(status);
      console.log('WebSocket connection status:', status);
    });

    // Subscribe to WebSocket notification events
    const unsubscribeRentReminder = socketService.on('rent_reminder', (data) => {
      console.log('Received rent_reminder:', data);
      addNotification({
        type: 'rent_reminder',
        title: 'Rent Reminder',
        message: data.message || `Your rent of KES ${data.amount?.toLocaleString()} is due ${data.daysUntilDue ? `in ${data.daysUntilDue} days` : 'soon'}.`,
        priority: data.daysUntilDue <= 1 ? 'high' : 'medium',
        actionUrl: '/tenant-dashboard/rent',
        actionText: 'Pay Now',
        data: data
      });
    });

    const unsubscribePaymentConfirmed = socketService.on('payment_confirmed', (data) => {
      console.log('Received payment_confirmed:', data);
      addNotification({
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: data.message || `Your payment of KES ${data.amount?.toLocaleString()} has been confirmed.`,
        priority: 'high',
        actionUrl: '/tenant-dashboard/rent',
        actionText: 'View Receipt',
        data: data
      });
    });

    const unsubscribeMaintenanceUpdate = socketService.on('maintenance_update', (data) => {
      console.log('Received maintenance_update:', data);
      addNotification({
        type: 'maintenance_update',
        title: 'Maintenance Update',
        message: data.message || `Your maintenance request #${data.ticketNumber} has been updated to: ${data.status}`,
        priority: data.status === 'completed' ? 'high' : 'medium',
        actionUrl: `/tenant-dashboard/maintenance/${data.requestId}`,
        actionText: 'View Details',
        data: data
      });
    });

    const unsubscribeGuestArrived = socketService.on('guest_arrived', (data) => {
      console.log('Received guest_arrived:', data);
      addNotification({
        type: 'guest_arrived',
        title: 'Guest Arrival',
        message: data.message || `${data.guestName} has arrived at the property.`,
        priority: 'medium',
        actionUrl: '/tenant-dashboard/guests',
        actionText: 'View Guests',
        data: data
      });
    });

    const unsubscribeEmergencyAlert = socketService.on('emergency_alert', (data) => {
      console.log('Received emergency_alert:', data);
      addNotification({
        type: 'emergency_alert',
        title: data.title || 'Emergency Alert',
        message: data.message,
        priority: 'urgent',
        actionUrl: '/tenant-dashboard/emergency',
        actionText: 'View Details',
        data: data
      });
    });

    const unsubscribeAnnouncement = socketService.on('announcement', (data) => {
      console.log('Received announcement:', data);
      addNotification({
        type: 'announcement',
        title: data.title || 'New Announcement',
        message: data.message,
        priority: data.priority || 'medium',
        actionUrl: '/tenant-dashboard/community',
        actionText: 'View Announcement',
        data: { announcementId: data.id }
      });
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('buildingAlert', handleBuildingAlert);
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribeConnectionStatus();
      unsubscribeRentReminder();
      unsubscribePaymentConfirmed();
      unsubscribeMaintenanceUpdate();
      unsubscribeGuestArrived();
      unsubscribeEmergencyAlert();
      unsubscribeAnnouncement();
      // Don't disconnect socket here as it might be used by other components
    };
  }, []);

  const addNotification = (notification) => {
    // Create notification object
    const newNotification = {
      id: notification.id || `notification-${Date.now()}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      data: notification.data
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification for urgent notifications
    if (notification.priority === 'urgent' || 
        notification.type === 'autopay_failure' || 
        notification.type === 'emergency_alert') {
      showBrowserNotification(newNotification);
      playAlertSound();
    }
  };

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Fetch notification history from API
      const apiNotifications = await apiService.getNotifications();
      
      // Fetch announcements and check for unread ones
      const announcements = await apiService.getAnnouncements();
      const unreadAnnouncements = announcements.filter(a => !a.read);
      
      // Convert announcements to notification format
      const announcementNotifications = unreadAnnouncements.map(ann => ({
        id: `announcement-${ann.id}`,
        type: 'announcement',
        title: ann.title,
        message: ann.message.substring(0, 100) + (ann.message.length > 100 ? '...' : ''),
        priority: ann.priority,
        timestamp: ann.postedAt,
        read: false,
        actionUrl: '/tenant-dashboard/community',
        data: { announcementId: ann.id }
      }));

      // Fetch building-wide emergency alerts
      const buildingAlerts = await apiService.getBuildingAlerts(5);
      const alertNotifications = buildingAlerts.map(alert => ({
        id: `alert-${alert.id}`,
        type: 'emergency',
        title: alert.title,
        message: alert.message,
        priority: alert.priority || 'urgent',
        timestamp: alert.sentAt,
        read: alert.acknowledged || false,
        actionUrl: '/tenant-dashboard/emergency',
        data: { alertId: alert.id }
      }));

      // Convert API notifications to standard format
      const formattedApiNotifications = apiNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        timestamp: notif.createdAt,
        read: notif.read,
        actionUrl: notif.actionUrl,
        actionText: notif.actionText,
        data: notif.data
      }));

      // Merge with locally stored notifications (avoid duplicates)
      const localNotifications = notifications.filter(
        local => !formattedApiNotifications.some(api => api.id === local.id) &&
                 !announcementNotifications.some(ann => ann.id === local.id) &&
                 !alertNotifications.some(alert => alert.id === local.id)
      );

      // Combine all notifications
      const allNotifications = [
        ...formattedApiNotifications,
        ...alertNotifications,
        ...announcementNotifications,
        ...localNotifications
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);

      // Show browser notification for new urgent announcements or alerts
      if (silent && unreadAnnouncements.some(a => a.priority === 'urgent')) {
        showBrowserNotification(unreadAnnouncements.find(a => a.priority === 'urgent'));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = notification.priority === 'urgent' ? '🚨 URGENT ALERT' : 'Notification';
      new Notification(title, {
        body: notification.title || notification.message,
        icon: '/logo.png',
        tag: `notification-${notification.id || Date.now()}`,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  };

  const playAlertSound = () => {
    // Play alert sound for emergency notifications
    // In production, you would use an actual audio file
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read based on notification type
    try {
      if (notification.type === 'announcement') {
        await apiService.markAnnouncementAsRead(notification.data.announcementId);
      } else if (notification.type === 'emergency') {
        await apiService.acknowledgeAlert(notification.data.alertId);
      } else if (typeof notification.id === 'number') {
        // Mark API notification as read
        await apiService.markNotificationAsRead(notification.id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
    
    // Update local state
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Navigate to the relevant page
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all announcement notifications as read
      const announcementNotifications = notifications.filter(n => n.type === 'announcement');
      await Promise.all(
        announcementNotifications.map(n => 
          apiService.markAnnouncementAsRead(n.data.announcementId)
        )
      );
      
      // Mark all emergency alerts as acknowledged
      const alertNotifications = notifications.filter(n => n.type === 'emergency');
      await Promise.all(
        alertNotifications.map(n => 
          apiService.acknowledgeAlert(n.data.alertId)
        )
      );
      
      // Mark all API notifications as read
      const apiNotifications = notifications.filter(n => typeof n.id === 'number');
      await Promise.all(
        apiNotifications.map(n => 
          apiService.markNotificationAsRead(n.id)
        )
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return 'fas fa-bullhorn';
      case 'maintenance':
        return 'fas fa-tools';
      case 'payment':
      case 'autopay_success':
        return 'fas fa-money-bill-wave';
      case 'autopay_failure':
        return 'fas fa-exclamation-circle';
      case 'autopay_confirmation':
      case 'scheduled_payment_reminder':
        return 'fas fa-clock';
      case 'guest':
        return 'fas fa-user-friends';
      case 'emergency':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-bell';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          requestNotificationPermission();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
        title={connectionStatus.connected ? 'Real-time notifications active' : 'Notifications (offline mode)'}
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Connection status indicator */}
        {connectionStatus.connected && (
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-gray-600">({unreadCount} new)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                <p className="text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-bell-slash text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-600">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`w-full p-4 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                          <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium text-gray-800 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                    {/* Show action button for autopay failure */}
                    {notification.type === 'autopay_failure' && notification.actionUrl && (
                      <button
                        onClick={() => {
                          navigate(notification.actionUrl);
                          setIsOpen(false);
                        }}
                        className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        {notification.actionText || 'Pay Now'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/tenant-dashboard/community');
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all announcements
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

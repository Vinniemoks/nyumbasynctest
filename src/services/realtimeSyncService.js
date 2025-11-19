/**
 * Real-time Synchronization Service
 * Handles WebSocket connections for live updates across web, mobile, and desktop
 */

import { API_CONFIG, STORAGE_KEYS } from '../config/apiConfig';

class RealtimeSyncService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.userId = null;
  }

  // Initialize WebSocket connection
  async connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('Already connected to WebSocket');
      return;
    }

    this.userId = userId;
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!token) {
      console.error('No auth token available for WebSocket connection');
      return;
    }

    try {
      // Use Socket.IO for better cross-platform support
      const socketUrl = `${API_CONFIG.SOCKET_URL}?token=${token}&userId=${userId}`;
      
      // For web, use socket.io-client
      if (typeof window !== 'undefined') {
        const io = await import('socket.io-client');
        this.socket = io.default(API_CONFIG.SOCKET_URL, {
          auth: { token },
          query: { userId },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.setupEventHandlers();
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', reason });
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Real-time event handlers
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('message', (data) => {
      this.emit('message', data);
    });

    this.socket.on('payment_update', (data) => {
      this.emit('payment_update', data);
    });

    this.socket.on('maintenance_update', (data) => {
      this.emit('maintenance_update', data);
    });

    this.socket.on('property_update', (data) => {
      this.emit('property_update', data);
    });

    this.socket.on('lease_update', (data) => {
      this.emit('lease_update', data);
    });

    this.socket.on('tenant_update', (data) => {
      this.emit('tenant_update', data);
    });

    this.socket.on('document_update', (data) => {
      this.emit('document_update', data);
    });
  }

  // Schedule reconnection
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connection', { status: 'failed', reason: 'max_attempts_reached' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit events to listeners
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Send message through WebSocket
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Join a room (for property-specific or role-specific updates)
  joinRoom(roomId) {
    this.send('join_room', { roomId });
  }

  // Leave a room
  leaveRoom(roomId) {
    this.send('leave_room', { roomId });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const realtimeSyncService = new RealtimeSyncService();
export default realtimeSyncService;

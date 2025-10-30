import { io } from 'socket.io-client';
import environment from './environment';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = environment.socket.reconnectionAttempts;
    this.reconnectDelay = environment.socket.reconnectionDelay;
    this.listeners = new Map();
  }

  /**
   * Initialize WebSocket connection
   * @param {string} userId - The authenticated user's ID
   */
  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    const socketUrl = environment.socket.url;
    
    // Initialize socket connection with options
    this.socket = io(socketUrl, {
      auth: {
        token: localStorage.getItem('authToken'),
        userId: userId
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      timeout: environment.socket.timeout,
      // Enable secure connection in production
      secure: environment.isProduction,
      rejectUnauthorized: environment.isProduction
    });

    this.setupEventHandlers();
  }

  /**
   * Set up socket event handlers
   */
  setupEventHandlers() {
    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Notify listeners about connection
      this.emit('connection_status', { connected: true });
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.isConnected = false;
      
      // Notify listeners about connection error
      this.emit('connection_status', { connected: false, error: error.message });
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
      
      // Notify listeners about disconnection
      this.emit('connection_status', { connected: false, reason });
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, manually reconnect
        console.log('Server disconnected, attempting manual reconnect...');
        this.reconnect();
      }
      // For other reasons, socket.io will auto-reconnect
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attemptNumber;
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 5000);
    });

    // Reconnection successful
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Notify listeners about reconnection
      this.emit('connection_status', { connected: true, reconnected: true });
    });

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      this.isConnected = false;
      
      // Notify listeners about failed reconnection
      this.emit('connection_status', { 
        connected: false, 
        error: 'Failed to reconnect after maximum attempts' 
      });
    });

    // Error event
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('socket_error', { error });
    });
  }

  /**
   * Manually trigger reconnection
   */
  reconnect() {
    if (this.socket && !this.isConnected) {
      setTimeout(() => {
        console.log('Attempting manual reconnection...');
        this.socket.connect();
      }, this.reconnectDelay);
    }
  }

  /**
   * Subscribe to a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return () => {};
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Register with socket
    this.socket.on(event, callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    if (!this.isConnected) {
      console.warn('Socket not connected. Event will be queued.');
    }

    this.socket.emit(event, data);
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();

      // Disconnect
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get socket instance
   * @returns {Socket|null}
   */
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export default new SocketService();

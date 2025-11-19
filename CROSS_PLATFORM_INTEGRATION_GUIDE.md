# NyumbaSync Cross-Platform Integration Guide

## Overview

This guide explains how the NyumbaSync mobile app, web app, and desktop app are integrated to work seamlessly together, sharing data and providing real-time synchronization across all platforms.

## Architecture

### Unified API Configuration
All platforms use the same API endpoints defined in `src/config/apiConfig.js`:
- **Development**: `http://localhost:3001/api`
- **Staging**: `https://staging-api.nyumbasync.com/api`
- **Production**: `https://api.nyumbasync.com/api`

### Core Services

#### 1. Unified API Service (`src/services/unifiedApiService.js`)
- Single API client that works across web, mobile, and desktop
- Handles authentication, token refresh, and API requests
- Platform-agnostic storage abstraction
- Automatic retry logic with exponential backoff

#### 2. Real-time Sync Service (`src/services/realtimeSyncService.js`)
- WebSocket-based real-time communication
- Automatic reconnection with exponential backoff
- Event-driven architecture for live updates
- Room-based subscriptions for targeted updates

#### 3. Storage Service (`src/services/storageService.js`)
- Cross-platform storage abstraction
- Uses AsyncStorage on mobile, localStorage on web
- Consistent API across all platforms
- Secure token management

## Integration Points

### Authentication Flow

```javascript
// Login on any platform
import { unifiedApiService } from './services/unifiedApiService';

const response = await unifiedApiService.login({
  identifier: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored and synced
// User can now access the app on any platform with the same session
```

### Real-time Updates

```javascript
// Subscribe to real-time updates
import { realtimeSyncService } from './services/realtimeSyncService';

// Connect when user logs in
await realtimeSyncService.connect(userId);

// Listen for notifications
realtimeSyncService.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Update UI across all platforms
});

// Listen for payment updates
realtimeSyncService.on('payment_update', (payment) => {
  console.log('Payment updated:', payment);
  // Refresh payment data
});
```

### Data Synchronization

All data operations use the unified API service:

```javascript
// Create maintenance request on mobile
const request = await unifiedApiService.createMaintenanceRequest({
  title: 'Leaking faucet',
  description: 'Kitchen faucet is leaking',
  priority: 'high'
});

// Real-time update sent to web and desktop apps
// All platforms show the new request immediately
```

## Platform-Specific Implementation

### Web App (React)

```javascript
// src/App.jsx
import { useEffect } from 'react';
import { unifiedApiService } from './services/unifiedApiService';
import { realtimeSyncService } from './services/realtimeSyncService';

function App() {
  useEffect(() => {
    // Initialize real-time sync when user is authenticated
    const user = await unifiedApiService.getCurrentUser();
    if (user) {
      await realtimeSyncService.connect(user.id);
    }
  }, []);

  return <div>App Content</div>;
}
```

### Mobile App (React Native)

```javascript
// App.js
import { useEffect } from 'react';
import { unifiedApiService } from './src/services/unifiedApiService';
import { realtimeSyncService } from './src/services/realtimeSyncService';

function App() {
  useEffect(() => {
    // Initialize real-time sync
    const initializeSync = async () => {
      const user = await unifiedApiService.getCurrentUser();
      if (user) {
        await realtimeSyncService.connect(user.id);
      }
    };
    
    initializeSync();
  }, []);

  return <NavigationContainer>...</NavigationContainer>;
}
```

### Desktop App (Electron)

Same implementation as web app, with additional Electron-specific features.

## API Endpoints

All endpoints are defined in `API_CONFIG.ENDPOINTS`:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Properties
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

### Tenants
- `GET /tenants` - List all tenants
- `GET /tenant/profile` - Get tenant profile
- `PUT /tenant/profile` - Update tenant profile

### Payments
- `GET /payments` - List payments
- `POST /payments` - Create payment
- `POST /payments/mpesa/stk-push` - Initiate M-Pesa payment
- `GET /payments/mpesa/verify/:id` - Verify M-Pesa payment

### Maintenance
- `GET /tenant/maintenance` - List maintenance requests
- `GET /tenant/maintenance/:id` - Get request details
- `POST /tenant/maintenance` - Create request
- `PUT /tenant/maintenance/:id` - Update request
- `POST /tenant/maintenance/:id/rate` - Rate completed request

### Notifications
- `GET /notifications/user/:userId` - Get user notifications
- `GET /notifications/user/:userId/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `POST /notifications/push-token` - Register push token

### Messages
- `GET /tenant/messages` - Get messages
- `POST /tenant/messages` - Send message
- `PUT /tenant/messages/:id/read` - Mark message as read

### Documents
- `GET /tenant/documents` - List documents
- `POST /tenant/documents` - Upload document
- `DELETE /tenant/documents/:id` - Delete document

## Real-time Events

The WebSocket connection emits the following events:

- `notification` - New notification received
- `message` - New message received
- `payment_update` - Payment status changed
- `maintenance_update` - Maintenance request updated
- `property_update` - Property information changed
- `lease_update` - Lease information changed
- `tenant_update` - Tenant information changed
- `document_update` - Document added/updated

## Storage Keys

Consistent storage keys across all platforms:

```javascript
STORAGE_KEYS = {
  AUTH_TOKEN: 'nyumbasync_auth_token',
  REFRESH_TOKEN: 'nyumbasync_refresh_token',
  USER_DATA: 'nyumbasync_user_data',
  DEVICE_ID: 'nyumbasync_device_id',
  PUSH_TOKEN: 'nyumbasync_push_token',
  THEME: 'nyumbasync_theme',
  LANGUAGE: 'nyumbasync_language',
}
```

## Security Features

### Token Management
- Access tokens with automatic refresh
- Refresh tokens for long-term sessions
- Secure storage on all platforms
- Automatic token expiry handling

### CSRF Protection
- CSRF tokens for state-changing requests
- Automatic token generation and validation
- Platform-agnostic implementation

### Audit Logging
- All security events logged
- Failed login attempts tracked
- Unauthorized access attempts recorded

## Error Handling

Unified error handling across platforms:

```javascript
try {
  const data = await unifiedApiService.getProperties();
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Server error:', error.response.status);
    console.error('Message:', error.response.data.message);
  } else {
    // Network error
    console.error('Network error:', error.message);
  }
}
```

## Testing Integration

### Test Real-time Sync

1. Open web app in browser
2. Open mobile app on device/emulator
3. Create a maintenance request on mobile
4. Verify it appears immediately on web app

### Test Authentication Sync

1. Login on web app
2. Open mobile app
3. Verify user is automatically logged in (if using same device)

### Test Data Consistency

1. Update property on desktop app
2. Verify changes appear on mobile and web
3. Check that all platforms show same data

## Deployment

### Environment Variables

Create `.env` files for each environment:

```bash
# .env.development
VITE_API_URL=http://localhost:3001/api

# .env.staging
VITE_API_URL=https://staging-api.nyumbasync.com/api

# .env.production
VITE_API_URL=https://api.nyumbasync.com/api
```

### Mobile App Configuration

Update `NyumbaSyncMobile/src/services/api.js`:

```javascript
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.BASE_URL;
```

## Troubleshooting

### WebSocket Connection Issues

If WebSocket fails to connect:
1. Check firewall settings
2. Verify WebSocket support on server
3. Check CORS configuration
4. Try polling fallback

### Token Refresh Issues

If token refresh fails:
1. Check refresh token expiry
2. Verify refresh endpoint is working
3. Clear storage and re-login
4. Check server logs for errors

### Data Sync Issues

If data doesn't sync:
1. Check WebSocket connection status
2. Verify user is subscribed to correct rooms
3. Check network connectivity
4. Review server-side event emission

## Best Practices

1. **Always use unifiedApiService** for API calls
2. **Initialize realtimeSyncService** on user login
3. **Clean up WebSocket connections** on logout
4. **Handle offline scenarios** gracefully
5. **Test on all platforms** before deployment
6. **Monitor real-time event performance**
7. **Implement proper error boundaries**
8. **Use consistent data models** across platforms

## Future Enhancements

- [ ] Offline mode with local caching
- [ ] Conflict resolution for simultaneous edits
- [ ] Push notifications for mobile
- [ ] Desktop notifications
- [ ] File sync across devices
- [ ] End-to-end encryption for messages
- [ ] Multi-device session management
- [ ] Biometric authentication

## Support

For integration issues or questions:
- Check the documentation
- Review error logs
- Contact the development team
- Submit an issue on GitHub

---

**Last Updated**: November 19, 2025
**Version**: 1.0.0

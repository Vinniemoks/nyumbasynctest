# API Reference

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.nyumbasync.com
```

## Authentication

All API requests require authentication using JWT tokens.

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## Admin Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/refresh-token` - Refresh JWT token

### MFA
- `POST /api/admin/mfa/enable` - Enable MFA
- `POST /api/admin/mfa/verify` - Verify MFA code
- `POST /api/admin/mfa/disable` - Disable MFA
- `POST /api/admin/mfa/regenerate-backup-codes` - Regenerate backup codes
- `GET /api/admin/mfa/status` - Get MFA status

### Password Management
- `POST /api/admin/password/change` - Change password
- `POST /api/admin/password/validate` - Validate password
- `GET /api/admin/password/policy` - Get password policy
- `GET /api/admin/password/expiry-status` - Check expiry status

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Audit Logs
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/audit-logs/export` - Export logs

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Error Codes

- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

For complete API documentation, contact: dev@nyumbasync.com

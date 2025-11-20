# Tenant Portal Quick Start Guide

## Overview

The Tenant Portal implementation provides a secure, phased registration system for tenants to access their lease information and interact with the Nyumbasync platform.

## What Has Been Implemented

### ✅ Phase 1: Initial Registration
- Contact model extended with `tenantPortal` fields
- TenantPortalAuth model for passwordless authentication
- Magic link email verification
- Terms and privacy policy acceptance
- Session management with token-based authentication

### ✅ Phase 2: Lease Linking
- Transaction model extended with verification codes
- Verification code generation (8-character alphanumeric)
- Code expiration (30 days)
- Lease linking via verification code
- Automated invitation system

### ✅ Phase 3: Profile Completion
- Emergency contact information
- Occupant tracking
- Vehicle registration
- Communication preferences
- Profile completion tracking

### ✅ Security Features
- Passwordless authentication (magic links)
- Session token management
- Account locking after failed attempts
- Token expiration
- SHA-256 token hashing

### ✅ API Endpoints
- 12 tenant portal endpoints
- 3 landlord management endpoints
- 4 authentication middleware functions
- Full CRUD operations

## Quick Setup

### 1. Database Models

The following models have been created/updated:

**Updated Models:**
- `Contact` - Added `tenantPortal` object with all registration fields
- `Transaction` - Added `tenantPortal` object for verification codes

**New Models:**
- `TenantPortalAuth` - Handles authentication and sessions

### 2. API Routes

Add to your server startup:

```javascript
// In nyumbasync_backend/routes/index.js
const tenantPortalRoutes = require('./tenant-portal.routes');
router.use('/tenant-portal', tenantPortalRoutes);
```

This is already configured in the routes/index.js file.

### 3. Environment Variables

Add to your `.env` file:

```env
# Tenant Portal Configuration
TENANT_PORTAL_URL=http://localhost:3000/tenant-portal
MAGIC_LINK_EXPIRY=900000  # 15 minutes in milliseconds
SESSION_EXPIRY=2592000000  # 30 days in milliseconds
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=1800000  # 30 minutes in milliseconds

# Email Configuration (for magic links)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@nyumbasync.com
FROM_NAME=Nyumbasync
```

## Usage Examples

### For Landlords

#### 1. Generate Verification Code for a Lease

```javascript
POST /api/v2/transactions/:transactionId/generate-verification-code

Response:
{
  "success": true,
  "message": "Verification code generated successfully",
  "data": {
    "verificationCode": "A7B9C2D4",
    "expiresAt": "2024-01-20T10:30:00.000Z"
  }
}
```

#### 2. Send Tenant Invitation

```javascript
POST /api/v2/transactions/:transactionId/send-tenant-invitation
Body: {
  "email": "tenant@example.com"
}

Response:
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "verificationCode": "A7B9C2D4",
    "invitationEmail": "tenant@example.com"
  }
}
```

#### 3. Enable Portal Access for Existing Contact

```javascript
POST /api/contacts/:contactId/enable-portal
Body: {
  "email": "tenant@example.com",
  "phone": "+254712345678"
}

Response:
{
  "success": true,
  "message": "Portal access enabled successfully"
}
```

### For Tenants

#### 1. Register

```javascript
POST /api/tenant-portal/register
Body: {
  "email": "tenant@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254712345678",
  "agreeToTerms": true,
  "agreeToPrivacy": true
}

Response:
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "contactId": "507f1f77bcf86cd799439011",
    "email": "tenant@example.com",
    "requiresEmailVerification": true
  }
}
```

#### 2. Verify Email (User clicks link in email)

```javascript
GET /api/tenant-portal/verify-email/:token

Response:
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

#### 3. Request Login Link

```javascript
POST /api/tenant-portal/login
Body: {
  "email": "tenant@example.com"
}

Response:
{
  "success": true,
  "message": "Login link sent to your email. Please check your inbox."
}
```

#### 4. Authenticate (User clicks magic link)

```javascript
POST /api/tenant-portal/authenticate/:token
Body: {
  "deviceInfo": "Chrome on Windows"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "sessionToken": "abc123...",
    "contact": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "tenant@example.com",
      "hasLinkedLeases": false,
      "profileCompleted": false
    }
  }
}
```

#### 5. Link Lease with Verification Code

```javascript
POST /api/tenant-portal/link-lease
Headers: {
  "Authorization": "Bearer abc123..."
}
Body: {
  "verificationCode": "A7B9C2D4"
}

Response:
{
  "success": true,
  "message": "Lease linked successfully",
  "data": {
    "lease": {
      "id": "507f1f77bcf86cd799439012",
      "property": {...},
      "status": "closed"
    }
  }
}
```

#### 6. Complete Profile

```javascript
POST /api/tenant-portal/complete-profile
Headers: {
  "Authorization": "Bearer abc123..."
}
Body: {
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+254723456789",
    "address": {
      "street": "123 Main St",
      "city": "Nairobi",
      "postalCode": "00100"
    }
  },
  "occupants": [
    {
      "fullName": "John Doe Jr.",
      "dateOfBirth": "2010-05-15",
      "relationship": "Son"
    }
  ],
  "vehicles": [
    {
      "make": "Toyota",
      "model": "Corolla",
      "color": "Silver",
      "licensePlate": "KAA123B"
    }
  ],
  "preferredCommunicationMethod": "email"
}

Response:
{
  "success": true,
  "message": "Profile completed successfully",
  "data": {
    "profileCompleted": true,
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 7. Get Profile

```javascript
GET /api/tenant-portal/profile
Headers: {
  "Authorization": "Bearer abc123..."
}

Response:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "tenant@example.com",
    "phone": "+254712345678",
    "emailVerified": true,
    "phoneVerified": false,
    "profileCompleted": true,
    "linkedLeases": [...],
    "emergencyContact": {...},
    "occupants": [...],
    "vehicles": [...],
    "preferredCommunicationMethod": "email"
  }
}
```

## Testing the Implementation

### 1. Test Registration Flow

```bash
# Register a new tenant
curl -X POST http://localhost:5000/api/tenant-portal/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+254712345678",
    "agreeToTerms": true,
    "agreeToPrivacy": true
  }'
```

### 2. Test Verification Code Generation

```bash
# Generate code for a lease transaction
curl -X POST http://localhost:5000/api/v2/transactions/TRANSACTION_ID/generate-verification-code
```

### 3. Test Lease Linking

```bash
# Link lease with verification code
curl -X POST http://localhost:5000/api/tenant-portal/link-lease \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "verificationCode": "A7B9C2D4"
  }'
```

## Integration Checklist

### Backend
- [x] Contact model extended
- [x] Transaction model extended
- [x] TenantPortalAuth model created
- [x] Controllers implemented
- [x] Routes configured
- [x] Middleware created
- [ ] Email service integration (TODO)
- [ ] SMS service integration (TODO - optional)

### Frontend (To Be Implemented)
- [ ] Registration page
- [ ] Email verification page
- [ ] Login page
- [ ] Magic link handler
- [ ] Lease linking page
- [ ] Profile completion form
- [ ] Dashboard
- [ ] Profile management page

### Email Templates (To Be Created)
- [ ] Verification email template
- [ ] Login magic link template
- [ ] Tenant invitation template
- [ ] Welcome email template

### Testing
- [ ] Unit tests for models
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for flows
- [ ] Security testing
- [ ] Load testing

## Next Steps

1. **Implement Email Service:**
   - Configure SMTP settings
   - Create email templates
   - Implement email sending in controllers

2. **Create Frontend Pages:**
   - Registration form
   - Login page
   - Dashboard
   - Profile management

3. **Add Flows Integration:**
   - Automated tenant invitation flow
   - Profile completion reminder flow
   - Lease expiration notification flow

4. **Security Enhancements:**
   - Add rate limiting
   - Implement CAPTCHA
   - Add audit logging
   - Set up monitoring

5. **Testing:**
   - Write comprehensive tests
   - Perform security audit
   - Load testing

## Common Issues & Solutions

### Issue: Magic link not working
**Solution:** Check that:
- Token hasn't expired (15 minutes)
- Token is correctly extracted from URL
- Token is sent in correct format to authenticate endpoint

### Issue: Verification code invalid
**Solution:** Check that:
- Code hasn't expired (30 days)
- Transaction is of type 'lease'
- Transaction is in 'under_contract' or 'closed' stage
- Code is entered in uppercase

### Issue: Session expired
**Solution:**
- Sessions expire after 30 days of inactivity
- User needs to request new login link
- Implement token refresh mechanism

## Support & Documentation

- Full Documentation: `nyumbasync_backend/TENANT_PORTAL_IMPLEMENTATION.md`
- API Reference: `nyumbasync_backend/API_DOCUMENTATION.md`
- Contact Support: support@nyumbasync.com

## Summary

The tenant portal implementation provides a complete, secure, and phased registration system that:

1. ✅ Allows tenants to register with email verification
2. ✅ Uses passwordless authentication (magic links)
3. ✅ Links tenants to their leases via verification codes
4. ✅ Collects comprehensive tenant profile information
5. ✅ Implements proper security measures
6. ✅ Provides landlord management tools

All backend infrastructure is in place. The next step is to implement the email service and create the frontend interface.

# API Endpoints Reference

This document outlines the expected API endpoints that the frontend is configured to call.

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-backend-url.com/api
```

## Authentication Endpoints

### POST /auth/login
Login user and receive token
```json
Request:
{
  "identifier": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "landlord|manager|tenant"
  }
}
```

### POST /auth/signup
Register new user
```json
Request:
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "landlord|manager|tenant"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "landlord"
  }
}
```

### POST /auth/logout
Logout current user
```json
Response:
{
  "success": true
}
```

### GET /auth/me
Get current user details
```json
Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "landlord",
  "phone": "+254712345678"
}
```

## Property Endpoints

### GET /properties
Get all properties (filtered by user role)
```json
Query Params: ?page=1&limit=10&status=occupied

Response:
[
  {
    "id": 1,
    "address": "123 Riverside Drive, Nairobi",
    "units": 3,
    "rent": 25000,
    "occupied": true,
    "occupancy": 100,
    "tenant": "John Doe",
    "leaseExpiry": "2024-12-31",
    "bedrooms": 3,
    "bathrooms": 2,
    "image": "url-to-image"
  }
]
```

### POST /properties
Create new property (Landlord only)
```json
Request:
{
  "address": "123 Main Street",
  "units": 2,
  "rent": 20000,
  "bedrooms": 3,
  "bathrooms": 2
}

Response:
{
  "id": 1,
  "address": "123 Main Street",
  "units": 2,
  "rent": 20000,
  "occupied": false,
  "occupancy": 0
}
```

### PUT /properties/:id
Update property
```json
Request:
{
  "rent": 22000,
  "occupied": true
}

Response:
{
  "id": 1,
  "address": "123 Main Street",
  "rent": 22000,
  "occupied": true
}
```

### DELETE /properties/:id
Delete property
```json
Response:
{
  "success": true
}
```

## Tenant Endpoints

### GET /tenants
Get all tenants
```json
Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "property": "123 Riverside Drive",
    "rentStatus": "paid|pending",
    "leaseEnd": "2024-12-31"
  }
]
```

### POST /tenants
Create new tenant
```json
Request:
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+254723456789",
  "propertyId": 1
}

Response:
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "rentStatus": "pending"
}
```

## Payment Endpoints

### GET /rent-payments
Get rent payments
```json
Query Params: ?status=paid&month=2024-01

Response:
[
  {
    "id": 1,
    "tenant": "John Doe",
    "amount": 25000,
    "status": "paid|pending",
    "date": "2024-01-01",
    "dueDate": "2024-02-01",
    "method": "mpesa|bank|card"
  }
]
```

### POST /rent-payments
Create rent payment
```json
Request:
{
  "amount": 25000,
  "method": "mpesa",
  "propertyId": 1
}

Response:
{
  "id": 1,
  "amount": 25000,
  "status": "paid",
  "date": "2024-01-15",
  "transactionId": "ABC123"
}
```

## Maintenance Endpoints

### GET /maintenance-requests
Get maintenance requests
```json
Query Params: ?status=pending&priority=high

Response:
[
  {
    "id": 1,
    "description": "Leaking faucet",
    "property": "123 Riverside Drive",
    "status": "pending|in_progress|completed",
    "priority": "low|medium|high|urgent",
    "category": "plumbing|electrical|hvac|appliance|other",
    "date": "2024-01-15",
    "assignedTo": "Vendor Name"
  }
]
```

### POST /maintenance-requests
Create maintenance request
```json
Request:
{
  "description": "Broken AC unit",
  "priority": "high",
  "category": "hvac",
  "propertyId": 1
}

Response:
{
  "id": 1,
  "description": "Broken AC unit",
  "status": "pending",
  "priority": "high",
  "date": "2024-01-15"
}
```

### PUT /maintenance-requests/:id
Update maintenance request
```json
Request:
{
  "status": "in_progress",
  "assignedTo": "Vendor Name"
}

Response:
{
  "id": 1,
  "status": "in_progress",
  "assignedTo": "Vendor Name",
  "updatedAt": "2024-01-16"
}
```

## Reports Endpoints

### GET /reports/financial
Get financial report
```json
Query Params: ?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "totalIncome": 120000,
  "totalExpenses": 50000,
  "netIncome": 70000,
  "breakdown": {
    "rent": 120000,
    "maintenance": 30000,
    "utilities": 20000
  }
}
```

### GET /reports/occupancy
Get occupancy report
```json
Response:
{
  "totalUnits": 10,
  "occupiedUnits": 8,
  "vacantUnits": 2,
  "occupancyRate": 80
}
```

## Authentication Headers
All authenticated requests should include:
```
Authorization: Bearer <token>
```

## Error Responses
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Notes
1. All dates should be in ISO 8601 format
2. Amounts are in KSh (Kenyan Shillings)
3. Pagination uses `page` and `limit` query params
4. Filtering uses query params matching field names
5. File uploads should use multipart/form-data

# Tenant Portal Enhancement - Design Document

## Overview

The Tenant Portal Enhancement transforms the basic tenant dashboard into a comprehensive property management platform. This design leverages React for the frontend, integrates with mobile money APIs (M-Pesa, Airtel Money, Telkom Money), and implements real-time notifications for seamless tenant-stakeholder communication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tenant Portal (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Rent │ Maintenance │ Documents │ Community     │
│  Property  │ Vendors │ Utilities │ Guests │ Emergency       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication │ Authorization │ Rate Limiting              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Backend    │   │   Payment    │   │ Notification │
│   Services   │   │   Gateway    │   │   Service    │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ Property API │   │ M-Pesa API   │   │ SMS Gateway  │
│ Rent API     │   │ Airtel API   │   │ Push Notif   │
│ Maintenance  │   │ Telkom API   │   │ Email        │
│ Document API │   │ Card Gateway │   │ In-App       │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌──────────────┐
                    │   Database   │
                    ├──────────────┤
                    │  PostgreSQL  │
                    │  File Store  │
                    └──────────────┘
```

### Technology Stack

**Frontend:**
- React 18.2+ with Hooks
- React Router 6+ for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Query for data fetching and caching
- Chart.js for analytics visualization
- React PDF for receipt generation
- Socket.io-client for real-time notifications

**Backend (API Integration Points):**
- RESTful API endpoints
- WebSocket for real-time updates
- JWT for authentication
- Multipart form data for file uploads

**Payment Integration:**
- M-Pesa Daraja API (STK Push)
- Airtel Money API
- Telkom T-Kash API
- Stripe/Flutterwave for card payments

**File Storage:**
- AWS S3 or similar for documents and images
- Cloudinary for image optimization

## Components and Interfaces

### Core Components Structure

```
src/pages/TenantDashboard/
├── index.jsx                    # Main dashboard container
├── Overview.jsx                 # Dashboard overview with stats
├── PropertyDetails.jsx          # Property information display
├── RentManagement/
│   ├── RentDashboard.jsx       # Interactive rent dashboard
│   ├── PaymentForm.jsx         # Multi-channel payment form
│   ├── PaymentHistory.jsx      # Payment history list
│   ├── ReceiptViewer.jsx       # Receipt display and download
│   └── AutopaySettings.jsx     # Autopay configuration
├── Maintenance/
│   ├── MaintenanceList.jsx     # Maintenance requests list
│   ├── CreateRequest.jsx       # New maintenance request form
│   ├── RequestDetails.jsx      # Request detail view
│   └── VendorRating.jsx        # Vendor rating component
├── Vendors/
│   ├── VendorDirectory.jsx     # Vendor listing with filters
│   ├── VendorProfile.jsx       # Vendor detail view
│   └── ServiceRequest.jsx      # Request vendor service
├── Documents/
│   ├── DocumentList.jsx        # Document library
│   ├── DocumentUpload.jsx      # Upload documents
│   └── DocumentViewer.jsx      # View/download documents
├── Utilities/
│   ├── UtilityDashboard.jsx    # Utility bills overview
│   ├── BillDetails.jsx         # Individual bill view
│   ├── CostSplitter.jsx        # Roommate cost splitting
│   └── UsageTrends.jsx         # Usage analytics
├── Community/
│   ├── Announcements.jsx       # Building announcements
│   ├── BulletinBoard.jsx       # Community bulletin board
│   └── IssueReporter.jsx       # Common area issues
├── Lease/
│   ├── LeaseInfo.jsx           # Lease details and countdown
│   ├── RenewalRequest.jsx      # Lease renewal form
│   └── DigitalSignature.jsx    # E-signature component
├── MoveOut/
│   ├── MoveOutRequest.jsx      # Move-out request form
│   ├── DepositRefund.jsx       # Deposit refund tracker
│   └── InspectionSchedule.jsx  # Inspection scheduling
├── Guests/
│   ├── GuestList.jsx           # Registered guests
│   ├── RegisterGuest.jsx       # Guest registration form
│   └── AccessCodes.jsx         # Access code management
├── Emergency/
│   ├── EmergencyContacts.jsx   # Emergency contact list
│   ├── ReportEmergency.jsx     # Emergency reporting
│   └── EvacuationMap.jsx       # Building evacuation plan
└── Communication/
    ├── MessageCenter.jsx        # Message inbox
    ├── ComposeMessage.jsx       # Send message to stakeholder
    └── IssueTracker.jsx         # Issue tracking

src/components/shared/
├── PaymentMethodSelector.jsx   # Payment method selection
├── STKPushModal.jsx            # STK push status modal
├── FileUploader.jsx            # File upload component
├── ImageGallery.jsx            # Image gallery viewer
├── StatusBadge.jsx             # Status indicator badge
├── ProgressTracker.jsx         # Multi-step progress indicator
├── NotificationBell.jsx        # Notification dropdown
├── SearchFilter.jsx            # Search and filter component
├── DatePicker.jsx              # Date selection component
└── ConfirmationModal.jsx       # Confirmation dialog
```

### Key Component Interfaces

#### PaymentForm Component
```typescript
interface PaymentFormProps {
  amount: number;
  dueDate: string;
  propertyId: string;
  onSuccess: (receipt: Receipt) => void;
  onError: (error: Error) => void;
}

interface PaymentMethod {
  type: 'mpesa' | 'airtel' | 'telkom' | 'card';
  phoneNumber?: string;
  cardDetails?: CardDetails;
}
```

#### MaintenanceRequest Component
```typescript
interface MaintenanceRequestProps {
  propertyId: string;
  onSubmit: (request: MaintenanceRequest) => void;
}

interface MaintenanceRequest {
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliances' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high';
  images: File[];
  preferredDate?: Date;
}
```

#### VendorDirectory Component
```typescript
interface VendorDirectoryProps {
  onSelectVendor: (vendor: Vendor) => void;
}

interface VendorFilter {
  serviceTypes: string[];
  rating?: number;
  availability?: 'available' | 'busy';
}
```

## Data Models

### Tenant Profile
```typescript
interface TenantProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  currentProperty: Property;
  leaseInfo: LeaseInfo;
  emergencyContact: EmergencyContact;
  preferences: TenantPreferences;
}
```

### Property
```typescript
interface Property {
  id: string;
  address: string;
  unitNumber: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  stakeholder: PropertyStakeholder;
  images: string[];
}
```

### Lease Information
```typescript
interface LeaseInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'expiring' | 'expired';
  renewalStatus?: 'pending' | 'approved' | 'declined';
  documentUrl: string;
}
```

### Rent Payment
```typescript
interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  paymentDate: Date;
  dueDate: Date;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: 'pending' | 'completed' | 'failed';
  receiptUrl: string;
  lateFee?: number;
}
```

### Maintenance Request
```typescript
interface MaintenanceRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  ticketNumber: string;
  category: MaintenanceCategory;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  assignedVendor?: Vendor;
  createdAt: Date;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
}
```

### Vendor
```typescript
interface Vendor {
  id: string;
  name: string;
  companyName: string;
  serviceTypes: string[];
  phoneNumber: string;
  email: string;
  rating: number;
  reviewCount: number;
  availability: 'available' | 'busy';
  certifications: string[];
  profileImage: string;
}
```

### Document
```typescript
interface Document {
  id: string;
  tenantId: string;
  name: string;
  category: 'lease' | 'inspection' | 'insurance' | 'utilities' | 'personal' | 'other';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
}
```

### Utility Bill
```typescript
interface UtilityBill {
  id: string;
  propertyId: string;
  utilityType: 'water' | 'electricity' | 'internet' | 'gas';
  billingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  usage: number;
  usageUnit: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  splitWith?: string[]; // Roommate IDs
}
```

### Guest Registration
```typescript
interface GuestRegistration {
  id: string;
  tenantId: string;
  guestName: string;
  guestPhone: string;
  expectedArrival: Date;
  accessCode: string;
  codeExpiry: Date;
  status: 'pending' | 'arrived' | 'expired';
  createdAt: Date;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'rent_reminder' | 'payment_success' | 'maintenance_update' | 'announcement' | 'emergency' | 'guest_arrival';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}
```

## API Endpoints

### Rent Management
```
GET    /api/tenant/rent/current              # Get current rent status
GET    /api/tenant/rent/history              # Get payment history
POST   /api/tenant/rent/pay                  # Initiate payment
GET    /api/tenant/rent/receipt/:id          # Get receipt
POST   /api/tenant/rent/autopay              # Setup autopay
PUT    /api/tenant/rent/autopay/:id          # Update autopay
DELETE /api/tenant/rent/autopay/:id          # Cancel autopay
```

### Payment Processing
```
POST   /api/payments/mpesa/stk-push          # Initiate M-Pesa STK push
POST   /api/payments/airtel/stk-push         # Initiate Airtel Money STK push
POST   /api/payments/telkom/stk-push         # Initiate Telkom Money STK push
POST   /api/payments/card/process            # Process card payment
GET    /api/payments/status/:transactionId   # Check payment status
POST   /api/payments/callback                # Payment gateway callback
```

### Maintenance
```
GET    /api/tenant/maintenance               # Get all maintenance requests
POST   /api/tenant/maintenance               # Create maintenance request
GET    /api/tenant/maintenance/:id           # Get request details
PUT    /api/tenant/maintenance/:id/rate      # Rate completed service
POST   /api/tenant/maintenance/:id/images    # Upload images
```

### Vendors
```
GET    /api/tenant/vendors                   # Get vendor directory
GET    /api/tenant/vendors/:id               # Get vendor details
GET    /api/tenant/vendors/filter            # Filter vendors by service
POST   /api/tenant/vendors/:id/contact       # Contact vendor
```

### Documents
```
GET    /api/tenant/documents                 # Get all documents
POST   /api/tenant/documents                 # Upload document
GET    /api/tenant/documents/:id             # Download document
DELETE /api/tenant/documents/:id             # Delete document
```

### Utilities
```
GET    /api/tenant/utilities                 # Get utility bills
GET    /api/tenant/utilities/:id             # Get bill details
POST   /api/tenant/utilities/:id/split       # Split bill with roommates
GET    /api/tenant/utilities/trends          # Get usage trends
```

### Community
```
GET    /api/tenant/announcements             # Get announcements
GET    /api/tenant/bulletin                  # Get bulletin board posts
POST   /api/tenant/bulletin                  # Create bulletin post
POST   /api/tenant/issues/common-area        # Report common area issue
```

### Lease Management
```
GET    /api/tenant/lease                     # Get lease information
POST   /api/tenant/lease/renew               # Request lease renewal
POST   /api/tenant/lease/sign                # Sign renewal digitally
```

### Move-Out
```
POST   /api/tenant/move-out/request          # Submit move-out request
GET    /api/tenant/move-out/status           # Get move-out status
POST   /api/tenant/deposit/refund            # Request deposit refund
GET    /api/tenant/deposit/status            # Get refund status
```

### Guests
```
GET    /api/tenant/guests                    # Get registered guests
POST   /api/tenant/guests                    # Register guest
DELETE /api/tenant/guests/:id                # Cancel guest registration
POST   /api/tenant/guests/:id/access         # Grant remote access
```

### Emergency
```
GET    /api/tenant/emergency/contacts        # Get emergency contacts
POST   /api/tenant/emergency/report          # Report emergency
GET    /api/tenant/emergency/evacuation      # Get evacuation map
```

### Communication
```
GET    /api/tenant/messages                  # Get messages
POST   /api/tenant/messages                  # Send message
GET    /api/tenant/issues                    # Get raised issues
POST   /api/tenant/issues                    # Raise new issue
PUT    /api/tenant/issues/:id                # Update issue
```

## Payment Integration Flow

### M-Pesa STK Push Flow
```
1. User selects M-Pesa payment method
2. Frontend sends payment request to backend
3. Backend initiates STK push via M-Pesa Daraja API
4. User receives prompt on phone
5. User enters M-Pesa PIN
6. M-Pesa sends callback to backend
7. Backend updates payment status
8. Frontend polls for status or receives WebSocket update
9. Display success/failure message
10. Generate and display receipt
```

### Card Payment Flow
```
1. User selects card payment
2. Display secure payment form (Stripe/Flutterwave)
3. User enters card details
4. Frontend tokenizes card (PCI compliance)
5. Send token to backend
6. Backend processes payment
7. Return payment result
8. Display confirmation
9. Generate receipt
```

## Real-Time Notifications

### WebSocket Events
```typescript
// Client subscribes to events
socket.on('rent_reminder', (data) => {
  // Display rent reminder notification
});

socket.on('payment_confirmed', (data) => {
  // Update payment status
  // Show success notification
});

socket.on('maintenance_update', (data) => {
  // Update maintenance request status
  // Show notification
});

socket.on('guest_arrived', (data) => {
  // Notify tenant of guest arrival
});

socket.on('emergency_alert', (data) => {
  // Display urgent emergency notification
});

socket.on('announcement', (data) => {
  // Show new announcement notification
});
```

## Error Handling

### Payment Errors
- Network timeout: Retry mechanism with exponential backoff
- Insufficient funds: Clear error message with alternative payment options
- Invalid phone number: Validation before API call
- STK push timeout: 60-second timeout with manual retry option

### File Upload Errors
- File too large: Client-side validation before upload
- Invalid file type: Whitelist validation
- Upload failure: Retry with progress indicator

### API Errors
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show access denied message
- 404 Not Found: Show resource not found message
- 500 Server Error: Show generic error with retry option
- Network error: Show offline message with retry

## Security Considerations

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Secure token storage (httpOnly cookies)
- Session timeout after 30 minutes of inactivity

### Payment Security
- PCI DSS compliance for card payments
- No storage of sensitive payment data
- Encrypted transmission (TLS 1.3)
- Payment tokenization

### Data Protection
- Encrypted file storage
- Secure document access with signed URLs
- Input sanitization to prevent XSS
- CSRF protection on all forms
- Rate limiting on API endpoints

### File Upload Security
- File type validation (whitelist)
- Virus scanning for uploaded files
- Size limits enforced
- Secure file naming to prevent path traversal

## Performance Optimization

### Frontend Optimization
- Code splitting by route
- Lazy loading of images
- React Query for caching and background refetching
- Debounced search inputs
- Virtualized lists for large datasets
- Optimistic UI updates

### API Optimization
- Pagination for list endpoints (20 items per page)
- Response compression (gzip)
- CDN for static assets
- Image optimization and lazy loading
- Caching headers for static content

### Database Optimization
- Indexed queries on frequently accessed fields
- Connection pooling
- Query optimization for complex joins
- Caching layer (Redis) for frequently accessed data

## Testing Strategy

### Unit Tests
- Component rendering tests
- Payment calculation logic
- Date/time utilities
- Form validation functions
- API service functions

### Integration Tests
- Payment flow end-to-end
- Maintenance request submission
- Document upload and download
- Guest registration flow
- Lease renewal process

### E2E Tests (Cypress)
- Complete rent payment journey
- Maintenance request creation and tracking
- Document management workflow
- Guest registration and access code generation
- Emergency reporting flow

### Payment Testing
- Sandbox environments for all payment gateways
- Test phone numbers for STK push
- Test cards for card payments
- Callback simulation

## Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators on interactive elements
- Alt text for all images
- ARIA labels for complex components

## Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly UI elements (minimum 44x44px)
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Optimized images for mobile
- Progressive Web App (PWA) capabilities
- Offline support for viewing cached data

## Deployment Considerations

### Environment Variables
```
REACT_APP_API_URL
REACT_APP_MPESA_CONSUMER_KEY
REACT_APP_MPESA_CONSUMER_SECRET
REACT_APP_STRIPE_PUBLIC_KEY
REACT_APP_SOCKET_URL
REACT_APP_FILE_STORAGE_URL
```

### Build Process
- Production build with minification
- Environment-specific configurations
- Source maps for debugging
- Bundle size analysis
- Automated testing in CI/CD pipeline

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User analytics (Google Analytics)
- Payment transaction logging
- API response time monitoring

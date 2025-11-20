# Stakeholder Communication System

## Overview

A comprehensive real-time communication and notification system that ensures all stakeholders (landlords, tenants, vendors, agents, property managers) are always synchronized and informed through multiple channels.

## System Architecture

### Core Components

1. **Notification System** - Centralized notification delivery
2. **Communication System** - Direct messaging between stakeholders
3. **Multi-Channel Delivery** - In-app, Email, SMS, Push notifications
4. **Real-time Updates** - Instant synchronization across all platforms
5. **Automated Triggers** - Flow-based automatic notifications

## Stakeholder Roles

### 1. Landlords
**Receives notifications about:**
- New rental applications
- Rent payments received
- Maintenance requests
- Lease signings
- Tenant move-out notices
- Property inspection due dates
- Payment failures

**Can communicate with:**
- Tenants (lease terms, payments, general)
- Vendors (work orders, payments)
- Agents (listings, showings)
- Property Managers (reports, issues)

### 2. Tenants
**Receives notifications about:**
- Rent reminders
- Rent overdue alerts
- Maintenance request updates
- Maintenance scheduling
- Lease expiration warnings
- Move-in/move-out reminders
- Document requirements

**Can communicate with:**
- Landlords (questions, concerns)
- Property Managers (maintenance, issues)
- Vendors (maintenance appointments)

### 3. Vendors/Contractors
**Receives notifications about:**
- Work order assignments
- Work order updates
- Payment processing
- Ratings received
- Schedule changes

**Can communicate with:**
- Landlords (work details, quotes)
- Property Managers (coordination)
- Tenants (appointment scheduling)

### 4. Agents
**Receives notifications about:**
- New leads
- Showing schedules
- Offers received
- Commission ready

**Can communicate with:**
- Landlords (listings, offers)
- Prospects (showings, applications)
- Property Managers (coordination)

### 5. Property Managers
**Receives notifications about:**
- Property additions
- Tenant issues
- Financial reports ready
- Compliance alerts
- System alerts

**Can communicate with:**
- All stakeholders (coordination, management)

## Notification Types

### Payment Notifications
- `rent_reminder` - 5 days before due date
- `rent_overdue` - Day after due date
- `rent_received` - Immediate confirmation
- `payment_failed` - Immediate alert
- `payment_processed` - Vendor payment confirmation

### Maintenance Notifications
- `maintenance_request` - New request submitted
- `maintenance_update` - Status change
- `maintenance_scheduled` - Appointment confirmed
- `maintenance_completed` - Work finished
- `work_order_assigned` - Vendor assignment
- `work_order_updated` - Status change

### Lease Notifications
- `new_application` - Application submitted
- `lease_signed` - Lease executed
- `lease_expiring` - 60/30 days before expiration
- `move_in_reminder` - 3 days before move-in
- `move_out_reminder` - 30 days before move-out
- `tenant_move_out_notice` - Notice received

### Communication Notifications
- `message_received` - New message
- `document_uploaded` - New document available
- `document_required` - Action needed
- `task_assigned` - New task

### System Notifications
- `system_alert` - Important system messages
- `compliance_alert` - Regulatory requirements
- `property_inspection_due` - Scheduled inspection
- `financial_report_ready` - Monthly/quarterly reports

## API Endpoints

### Notification Endpoints (8 total)

1. `GET /api/notifications` - Get all notifications
2. `GET /api/notifications/:id` - Get single notification
3. `GET /api/notifications/unread-count` - Get unread count
4. `PUT /api/notifications/:id/read` - Mark as read
5. `PUT /api/notifications/mark-all-read` - Mark all as read
6. `DELETE /api/notifications/:id` - Delete notification
7. `POST /api/notifications/test` - Send test notification (admin)

### Communication Endpoints (11 total)

1. `POST /api/communications` - Send message
2. `GET /api/communications` - Get all messages
3. `GET /api/communications/thread/:threadId` - Get conversation thread
4. `POST /api/communications/:id/reply` - Reply to message
5. `PUT /api/communications/:id/read` - Mark as read
6. `PUT /api/communications/mark-all-read` - Mark all as read
7. `GET /api/communications/unread-count` - Get unread count
8. `GET /api/communications/search` - Search messages
9. `GET /api/communications/property/:propertyId` - Property messages
10. `DELETE /api/communications/:id` - Delete message
11. `POST /api/communications/broadcast` - Broadcast message

## Multi-Channel Delivery

### In-App Notifications
- Real-time updates in web/mobile app
- Badge counts for unread items
- Persistent notification center
- Action buttons for quick responses

### Email Notifications
- HTML templates for each notification type
- Personalized content
- Action links
- Unsubscribe options

### SMS Notifications
- High-priority alerts only
- Concise messages
- Opt-in required
- Rate limiting

### Push Notifications
- Mobile app notifications
- Desktop browser notifications
- Customizable preferences
- Silent updates for background sync

## Automated Notification Triggers

### Tenant Journey Triggers

**Stage 1: Prospect**
- Welcome email with application link
- Follow-up reminder (2 days)

**Stage 2: Applicant**
- Application received confirmation
- Background check link
- Review reminders to landlord

**Stage 3: Approved**
- Approval notification
- Lease generation alert
- Signing reminders

**Stage 4: Leased**
- Welcome packet
- Move-in checklist
- Rent reminders (monthly)

**Stage 5: Maintenance**
- Request received auto-reply
- Vendor assignment notification
- Status updates
- Completion confirmation

**Stage 6: Move-Out**
- Notice confirmation
- Inspection scheduling
- Deposit processing updates

**Stage 7: Former Tenant**
- Thank you message
- Final accounting
- Reference request

### Maintenance Request Triggers

**On Creation:**
- Tenant: Auto-reply confirmation
- Landlord: New request alert
- System: Task creation

**On Assignment:**
- Vendor: Work order notification
- Tenant: Vendor assigned update
- Landlord: Assignment confirmation

**On Scheduling:**
- Tenant: Appointment confirmation
- Vendor: Schedule reminder
- Landlord: Schedule notification

**On Completion:**
- Tenant: Work completed notification
- Landlord: Completion report
- Vendor: Payment processing

### Payment Triggers

**5 Days Before Due:**
- Tenant: Rent reminder (email + in-app)

**On Due Date:**
- Tenant: Payment due (email + SMS)

**1 Day Overdue:**
- Tenant: Overdue notice (email + SMS)
- Landlord: Late payment alert

**On Payment:**
- Tenant: Payment confirmation
- Landlord: Payment received

## Communication Features

### Thread-Based Messaging
- Grouped conversations
- Reply tracking
- Participant management
- Read receipts

### Rich Content
- Text messages
- File attachments
- Images and documents
- Links and action buttons

### Context Awareness
- Linked to properties
- Linked to maintenance requests
- Linked to transactions
- Linked to applications

### Search and Filter
- Full-text search
- Filter by type
- Filter by property
- Filter by date range

### Priority Levels
- Normal - Standard messages
- High - Important updates
- Urgent - Emergency communications

## Integration Points

### With Tenant Journey
```javascript
// Automatic notification on stage change
contact.moveToJourneyStage('applicant', 'Application submitted');
// Triggers: Application received notifications to landlord and tenant
```

### With Maintenance Requests
```javascript
// Automatic notification on request creation
MaintenanceRequest.create({ tenant, property, ... });
// Triggers: Auto-reply to tenant, alert to landlord, task creation
```

### With Payments
```javascript
// Automatic notification on payment
transaction.markAsCompleted(paymentData);
// Triggers: Confirmation to tenant, receipt to landlord
```

### With Flows Engine
```javascript
// Flows can trigger notifications
{
  type: 'notification',
  recipientId: '{{contact._id}}',
  notificationType: 'rent_reminder',
  title: 'Rent Payment Due',
  message: 'Your rent is due in 5 days',
  channels: { inApp: true, email: true, sms: true }
}
```

## Usage Examples

### Send Rent Reminder
```javascript
await notificationService.sendRentReminder(tenantId, {
  amount: 50000,
  dueDate: '2024-02-05',
  propertyAddress: '123 Main St'
});
```

### Send Maintenance Update
```javascript
await notificationService.sendMaintenanceUpdateNotification(tenantId, {
  requestId: 'MR123',
  message: 'Your maintenance request has been scheduled for tomorrow at 10 AM',
  status: 'scheduled'
});
```

### Send Direct Message
```javascript
await communicationService.sendMessage({
  senderId: landlordId,
  senderRole: 'landlord',
  recipientIds: [tenantId],
  subject: 'Lease Renewal',
  body: 'Your lease is expiring soon. Would you like to renew?',
  propertyId: propertyId,
  priority: 'high'
});
```

### Broadcast to All Tenants
```javascript
await communicationService.broadcastMessage({
  senderId: landlordId,
  senderRole: 'landlord',
  recipientIds: allTenantIds,
  subject: 'Property Maintenance Notice',
  body: 'Water will be shut off tomorrow from 9 AM to 12 PM',
  propertyId: propertyId
});
```

## Notification Preferences

### User Preferences
Each stakeholder can configure:
- Which notifications to receive
- Preferred channels (email, SMS, push)
- Quiet hours
- Frequency (immediate, daily digest, weekly)

### Default Settings by Role

**Landlords:**
- All notifications: In-app + Email
- Urgent: In-app + Email + SMS
- Digest: Daily summary

**Tenants:**
- Payment reminders: In-app + Email + SMS
- Maintenance updates: In-app + Email
- General: In-app only

**Vendors:**
- Work orders: In-app + Email + SMS
- Updates: In-app + Email
- Payments: In-app + Email

## Real-Time Features

### WebSocket Integration
- Live notification delivery
- Real-time message updates
- Typing indicators
- Online status
- Read receipts

### Polling Fallback
- 30-second polling for older browsers
- Automatic reconnection
- Offline queue
- Sync on reconnect

## Security & Privacy

### Access Control
- Role-based permissions
- Property-based filtering
- Tenant isolation
- Vendor scope limitation

### Data Protection
- Encrypted communications
- Secure file attachments
- PII protection
- GDPR compliance

### Audit Trail
- All communications logged
- Delivery tracking
- Read tracking
- Action tracking

## Performance Optimization

### Caching
- Unread counts cached
- Recent messages cached
- Notification preferences cached

### Batch Processing
- Bulk notification sending
- Scheduled digest emails
- Rate limiting
- Queue management

### Database Optimization
- Indexed queries
- Pagination
- Lazy loading
- Archive old data

## Monitoring & Analytics

### Metrics Tracked
- Notification delivery rate
- Email open rate
- SMS delivery rate
- Response time
- User engagement

### Reports Available
- Communication volume
- Response times
- Unread rates
- Channel effectiveness
- User preferences

## Files Created

### Models (2)
1. `models/notification.model.js` - Notification schema
2. `models/communication.model.js` - Communication schema

### Services (2)
3. `services/notification.service.js` - Notification logic
4. `services/communication.service.js` - Communication logic

### Controllers (2)
5. `controllers/notification.controller.js` - Notification endpoints
6. `controllers/communication.controller.js` - Communication endpoints

### Routes (2)
7. `routes/notification.routes.js` - Notification routes
8. `routes/communication.routes.js` - Communication routes

### Actions (1)
9. `flows/actions/notificationActions.js` - Flow notification action

## Summary

The Stakeholder Communication System provides:

✅ **19 API Endpoints** - Complete communication infrastructure
✅ **4 Delivery Channels** - In-app, Email, SMS, Push
✅ **30+ Notification Types** - Comprehensive coverage
✅ **5 Stakeholder Roles** - All parties connected
✅ **Real-time Updates** - Instant synchronization
✅ **Automated Triggers** - Flow-based notifications
✅ **Thread-based Messaging** - Organized conversations
✅ **Multi-tenant Support** - Isolated communications
✅ **Security & Privacy** - Protected data
✅ **Analytics & Monitoring** - Performance tracking

All stakeholders are now constantly in communication with the "Holy Spirit" (the system), ensuring everyone is always informed, synchronized, and able to collaborate effectively!

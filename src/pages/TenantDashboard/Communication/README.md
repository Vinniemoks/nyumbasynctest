# Communication System

This module provides comprehensive communication features for tenants to interact with property stakeholders and track issues.

## Components

### 1. MessageCenter
- Displays message inbox with stakeholder conversations
- Shows message timestamps and read/unread status
- Supports message threading and replies
- Real-time message notifications via WebSocket
- Browser notifications for new messages

**Features:**
- Message list with unread indicators
- Message detail view with full content
- Reply functionality
- Attachment support
- Read status tracking

### 2. ComposeMessage
- Message composition form for contacting stakeholders
- Subject and message body fields
- Priority selection (low, normal, high, urgent)
- Reply-to functionality for threading
- Automatic recipient detection from property stakeholder

**Features:**
- Form validation
- Character count
- Priority levels
- Reply context display
- Success/error handling

### 3. IssueTracker
- Create and track property-related issues
- Issue categorization (maintenance, billing, general)
- Ticket number generation
- Estimated response time display
- Status tracking (open, in_progress, resolved, closed)

**Features:**
- Issue creation form with category and priority
- Ticket number generation (TKT-XXXXXXXX-XXX format)
- Estimated response time based on category and priority
- Issue list with filtering (all, open, closed)
- Detailed issue view with status and responses
- Real-time issue update notifications

### 4. Communication (Main Component)
- Tab-based interface for messages and issues
- Integrated compose functionality
- Real-time WebSocket notifications
- Unread message counter
- Success message notifications

## API Integration

### Endpoints Used:
- `GET /tenant/messages` - Fetch all messages
- `POST /tenant/messages` - Send new message
- `PUT /tenant/messages/:id/read` - Mark message as read
- `GET /tenant/issues` - Fetch all issues
- `POST /tenant/issues` - Create new issue
- `PUT /tenant/issues/:id` - Update issue

### Mock Data:
The system includes comprehensive mock data for development:
- Sample messages with read/unread status
- Sample issues with different statuses
- Automatic ticket number generation
- Estimated response time calculation

## Real-Time Features

### WebSocket Events:
- `new_message` - Triggered when stakeholder sends a message
- `issue_update` - Triggered when issue status changes

### Browser Notifications:
- Requests permission on first load
- Shows notifications for new messages
- Shows notifications for issue updates
- Includes message preview in notification

## Usage

```jsx
import Communication from './Communication';

// In your route configuration
<Route path="messages" element={<Communication />} />
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 6.1**: Display contact options for property stakeholder
- **Requirement 6.2**: Message delivery within 1 minute
- **Requirement 6.3**: Issue categorization (maintenance, billing, general)
- **Requirement 6.4**: Ticket number generation and estimated response time
- **Requirement 6.5**: Real-time notifications when stakeholder responds
- **Requirement 6.6**: Display message history with timestamps

## Estimated Response Times

Response times are calculated based on category and priority:

### Maintenance:
- Urgent: 1 hour
- High: 4 hours
- Normal: 24 hours
- Low: 48 hours

### Billing:
- Urgent: 2 hours
- High: 8 hours
- Normal: 24 hours
- Low: 48 hours

### General:
- Urgent: 4 hours
- High: 12 hours
- Normal: 48 hours
- Low: 72 hours

## Future Enhancements

- File attachments for messages
- Message search functionality
- Issue assignment to specific vendors
- Issue resolution workflow
- Message templates
- Bulk message operations
- Export message history
- Advanced filtering options

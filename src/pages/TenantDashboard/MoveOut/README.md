# Move-Out and Deposit Refund Module

## Overview
This module handles the tenant move-out process and deposit refund tracking, providing a comprehensive workflow from move-out request submission to deposit refund completion.

## Components

### 1. MoveOutRequest
Allows tenants to submit a formal move-out request with intended move-out date and reason.

### 2. MoveOutStatus
Displays the current status of the move-out request and tracks progress through approval and inspection stages.

### 3. DepositRefund
Manages the deposit refund process with real-time status tracking and notifications.

## Deposit Refund Status Tracking (Task 7.2)

### Features Implemented

#### 1. Refund Stages Display (Requirement 5.3)
The deposit refund process is tracked through four distinct stages:
- **Submitted**: Initial request submission
- **Inspection**: Property inspection in progress
- **Approved**: Refund approved and being processed
- **Paid**: Refund successfully completed

#### 2. Visual Progress Tracker
The `ProgressTracker` component provides a visual representation of the refund progress:
- Color-coded stages (completed, current, upcoming)
- Timestamps for each completed stage
- Progress bar showing overall completion
- Descriptive text for the current stage

#### 3. Status Change Notifications (Requirement 5.4)
Real-time notifications are implemented using WebSocket:
- Listens for `refund_status_update` events
- Displays toast notifications when status changes
- Automatically refreshes data to show updated status
- Notifications are sent within 1 minute of status change (as per requirement)

### Status Flow

```
Submitted → Inspection → Approved → Paid
```

### Data Structure

```javascript
{
  id: number,
  moveOutRequestId: number,
  depositAmount: number,
  status: 'submitted' | 'inspection' | 'approved' | 'paid',
  submittedAt: string (ISO date),
  stages: [
    {
      stage: string,
      completed: boolean,
      timestamp: string | null
    }
  ],
  statusHistory: [
    {
      status: string,
      timestamp: string,
      note: string
    }
  ],
  deductions: [
    {
      reason: string,
      description: string,
      amount: number
    }
  ],
  paymentDetails: {
    paymentDate: string,
    amount: number,
    transactionReference: string,
    paymentMethod: string
  } | null
}
```

### WebSocket Events

#### Listening for Status Updates
```javascript
socketService.on('refund_status_update', (data) => {
  // data contains: { status, refundId, timestamp, note }
  // Component automatically refreshes and shows notification
});
```

### API Methods

#### Get Current Refund
```javascript
const refund = await apiService.getCurrentDepositRefund();
```

#### Request Refund
```javascript
const result = await apiService.requestDepositRefund({
  moveOutRequestId: number,
  depositAmount: number,
  propertyId: number,
  leaseId: number
});
```

#### Update Status (Testing/Admin)
```javascript
const result = await apiService.updateDepositRefundStatus(refundId, newStatus);
```

### UI Components Used

1. **ProgressTracker**: Visual progress indicator with stages
2. **StatusBadge**: Color-coded status badges
3. **Toast Notifications**: Real-time status change alerts

### Requirements Satisfied

- ✅ **Requirement 5.1**: Verify move-out approval before allowing refund request
- ✅ **Requirement 5.2**: Display deposit amount and processing timeline
- ✅ **Requirement 5.3**: Display refund stages with visual progress tracker
- ✅ **Requirement 5.4**: Send notifications when refund status changes (within 1 minute)
- ✅ **Requirement 5.5**: Display payment details when refund is completed

### Testing the Feature

To test the refund status tracking:

1. **Submit a move-out request** (must be completed first)
2. **Submit a deposit refund request**
3. **Simulate status updates** using the browser console:
   ```javascript
   // Get the current refund
   const refund = await apiService.getCurrentDepositRefund();
   
   // Update to inspection
   await apiService.updateDepositRefundStatus(refund.id, 'inspection');
   
   // Update to approved
   await apiService.updateDepositRefundStatus(refund.id, 'approved');
   
   // Update to paid
   await apiService.updateDepositRefundStatus(refund.id, 'paid');
   ```

4. **Observe**:
   - Progress tracker updates automatically
   - Toast notifications appear for each status change
   - Status history is recorded
   - Payment details appear when status is 'paid'

### Accessibility

- Keyboard navigation supported
- Screen reader compatible with ARIA labels
- Color-coded with icons for color-blind users
- Clear status descriptions

### Mobile Responsiveness

- Responsive grid layout for refund details
- Touch-friendly buttons and interactions
- Optimized progress tracker for mobile screens

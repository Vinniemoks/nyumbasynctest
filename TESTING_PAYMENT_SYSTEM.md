# Testing the Multi-Channel Payment System

## Quick Start Guide

### 1. Access the Payment System

Navigate to the Tenant Dashboard and click on "Rent Management" or access directly:
```
http://localhost:5173/tenant-dashboard
```

### 2. Test Mobile Money Payments

#### M-Pesa Payment:
1. Click "Pay Rent Now" button
2. Select "M-Pesa" payment method
3. Enter phone number: `+254712345678` or `0712345678`
4. Click "Proceed to Pay"
5. STK Push modal will appear with countdown
6. Wait for mock payment to complete (simulates random success/failure)
7. On success: Receipt will be displayed
8. On failure: Error message with retry option

#### Airtel Money Payment:
1. Select "Airtel Money" payment method
2. Enter phone number: `+254712345678`
3. Follow same flow as M-Pesa

#### Telkom Money Payment:
1. Select "Telkom Money" payment method
2. Enter phone number: `+254712345678`
3. Follow same flow as M-Pesa

### 3. Test Card Payment

1. Click "Pay Rent Now" button
2. Select "Credit/Debit Card" payment method
3. Click "Proceed to Pay"
4. Card form will appear
5. Enter test card details:
   - **Card Number:** `4242 4242 4242 4242` (Visa)
   - **Cardholder Name:** `John Doe`
   - **Expiry Date:** `12/25`
   - **CVV:** `123`
6. Click "Pay KES 50,000"
7. Payment will process (2-second delay)
8. Receipt will be displayed on success

### 4. Test Error Scenarios

#### Invalid Phone Number:
1. Select mobile money method
2. Enter invalid phone: `123456`
3. Click "Proceed to Pay"
4. Validation error will display

#### Invalid Card Details:
1. Select card payment
2. Enter expired card: `12/20`
3. Validation error will display

#### Payment Timeout:
1. Select mobile money method
2. Wait for 60-second countdown
3. Timeout message will display with retry option

### 5. Test Receipt Features

After successful payment:
1. **Print:** Click "Print" button to print receipt
2. **Download:** Click "Download PDF" to save receipt
3. **Close:** Click "Close" to return to dashboard

## Mock Payment Behavior

The system is currently in mock mode for testing:

### Mobile Money (M-Pesa/Airtel/Telkom):
- **Initiation:** 1-second delay
- **Status Polling:** Checks every 1 second
- **Success Rate:** ~30% (random)
- **Failure Rate:** ~10% (random)
- **Pending:** ~60% (continues polling)

### Card Payment:
- **Processing:** 2-second delay
- **Success Rate:** 100% (always succeeds in mock mode)

## Visual Indicators

### Payment Status Colors:
- 🟢 **Green:** Payment successful
- 🟡 **Yellow:** Payment pending/due
- 🔴 **Red:** Payment failed/overdue

### STK Push Modal States:
- **Pending:** Blue spinner with countdown
- **Success:** Green checkmark
- **Failed:** Red X icon
- **Timeout:** Orange warning icon

## Testing Checklist

- [ ] M-Pesa payment flow
- [ ] Airtel Money payment flow
- [ ] Telkom Money payment flow
- [ ] Card payment flow
- [ ] Phone number validation
- [ ] Card validation
- [ ] Payment timeout handling
- [ ] Payment failure handling
- [ ] Receipt generation
- [ ] Receipt printing
- [ ] Retry functionality
- [ ] Cancel functionality
- [ ] Responsive design (mobile/tablet/desktop)

## Known Limitations (Mock Mode)

1. **No Real Payments:** All payments are simulated
2. **Random Success:** Mobile money payments have random outcomes
3. **No Backend:** No actual API calls to payment gateways
4. **No PDF Generation:** Receipt download triggers print dialog
5. **No Persistence:** Payment data not saved to database

## Switching to Production Mode

To enable real payment processing:

1. Open `src/services/paymentService.js`
2. Change `USE_MOCK = false`
3. Configure environment variables:
   ```env
   VITE_API_URL=https://your-api.com/api
   VITE_MPESA_CONSUMER_KEY=your_key
   VITE_MPESA_CONSUMER_SECRET=your_secret
   VITE_STRIPE_PUBLIC_KEY=your_stripe_key
   ```
4. Set up backend webhook endpoints
5. Test with sandbox credentials first

## Troubleshooting

### Payment Form Not Showing:
- Check console for errors
- Verify all components are imported correctly
- Check if RentDashboard is properly rendered

### STK Push Modal Not Appearing:
- Check if payment initiation succeeded
- Verify modal state is being set
- Check console for errors

### Receipt Not Displaying:
- Verify payment completed successfully
- Check if payment data is being passed correctly
- Verify ReceiptViewer component is rendering

### Build Errors:
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `npm run clean`
- Rebuild: `npm run build`

## Support

For issues or questions:
1. Check console logs for errors
2. Review component props and state
3. Verify API responses (in production)
4. Check network tab for failed requests

## Next Steps After Testing

1. ✅ Verify all payment flows work
2. ✅ Test error scenarios
3. ✅ Test on different devices/browsers
4. ⚠️ Configure production payment gateways
5. ⚠️ Set up webhook handlers
6. ⚠️ Implement real PDF generation
7. ⚠️ Add payment history integration
8. ⚠️ Set up monitoring and logging

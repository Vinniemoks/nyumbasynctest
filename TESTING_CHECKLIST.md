# Testing Checklist

Use this checklist to verify all features are working correctly.

## Setup
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] App opens at http://localhost:5173
- [ ] No console errors

## Authentication

### Signup
- [ ] Navigate to /signup
- [ ] Fill in all fields
- [ ] Select "Tenant" role
- [ ] Click "Create Account"
- [ ] Redirected to /tenant-dashboard
- [ ] No errors in console

### Login
- [ ] Logout from current session
- [ ] Navigate to /login
- [ ] Enter any email/password
- [ ] Click "Sign In"
- [ ] Redirected to appropriate dashboard
- [ ] User name appears in header

### Protected Routes
- [ ] Logout
- [ ] Try to access /landlord-dashboard directly
- [ ] Redirected to /login
- [ ] Login and verify access granted

## Landlord Dashboard

### Navigation
- [ ] Sidebar shows "Landlord Portal"
- [ ] All menu items visible
- [ ] Active menu item highlighted
- [ ] Logout button works

### Statistics
- [ ] Monthly Income displays
- [ ] Vacancies count shows
- [ ] Maintenance requests count shows
- [ ] All cards have icons

### Properties
- [ ] Property cards display
- [ ] Shows address, units, occupancy
- [ ] Click "Add Property" button
- [ ] Modal opens

### Add Property
- [ ] Fill in address
- [ ] Enter number of units
- [ ] Enter rent amount
- [ ] Click "Add Property"
- [ ] Modal closes
- [ ] New property appears in list
- [ ] Statistics update

### Activity Feed
- [ ] Recent activities display
- [ ] Shows maintenance requests
- [ ] Icons and timestamps visible

## Property Manager Dashboard

### Navigation
- [ ] Signup as "Property Manager"
- [ ] Redirected to /manager-dashboard
- [ ] Sidebar shows "Manager Portal"

### Statistics
- [ ] Portfolio size displays
- [ ] Rent collection percentage shows
- [ ] Active maintenance count shows

### Lease Alerts
- [ ] Table displays properties
- [ ] Shows tenant names
- [ ] Expiry dates visible
- [ ] "Renew" buttons present

### Maintenance Queue
- [ ] Three tabs visible (New, In Progress, Completed)
- [ ] Click "New" tab
- [ ] Pending requests display
- [ ] Click "Start" button
- [ ] Request moves to "In Progress"
- [ ] Click "In Progress" tab
- [ ] Request appears there
- [ ] Click "Complete" button
- [ ] Request moves to "Completed"
- [ ] Click "Completed" tab
- [ ] Completed request visible

## Tenant Dashboard

### Navigation
- [ ] Signup as "Tenant"
- [ ] Redirected to /tenant-dashboard
- [ ] Sidebar shows "Tenant Portal"

### Statistics
- [ ] Rent Due amount displays
- [ ] Days until rent shows
- [ ] Maintenance count shows
- [ ] Lease end countdown shows

### Quick Actions
- [ ] Three action buttons visible
- [ ] Click "Pay Rent"
- [ ] Modal opens

### Pay Rent
- [ ] Amount displays correctly
- [ ] Payment method dropdown works
- [ ] Select payment method
- [ ] Click "Confirm Payment"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Dashboard refreshes

### Request Maintenance
- [ ] Click "Request Help"
- [ ] Modal opens
- [ ] Category dropdown works
- [ ] Priority dropdown works
- [ ] Enter description
- [ ] Click "Submit Request"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Request appears in activity feed

### Property Details
- [ ] Property card displays
- [ ] Image shows (placeholder)
- [ ] Address visible
- [ ] Amenity tags display
- [ ] Lease end date shows

### Activity Feed
- [ ] Recent activities display
- [ ] Icons show correctly
- [ ] Timestamps visible
- [ ] New maintenance request appears

## Responsive Design

### Desktop (1920x1080)
- [ ] Sidebar full width
- [ ] Cards in grid layout
- [ ] All content visible
- [ ] No horizontal scroll

### Tablet (768x1024)
- [ ] Sidebar responsive
- [ ] Cards stack properly
- [ ] Modals centered
- [ ] Touch-friendly buttons

### Mobile (375x667)
- [ ] Sidebar collapses
- [ ] Single column layout
- [ ] Modals full width
- [ ] Text readable

## Forms & Validation

### Login Form
- [ ] Empty fields show errors
- [ ] Invalid email shows error
- [ ] Loading state shows
- [ ] Error messages display

### Signup Form
- [ ] All fields required
- [ ] Password mismatch shows error
- [ ] Email validation works
- [ ] Success redirects

### Add Property Form
- [ ] Required fields validated
- [ ] Number inputs accept numbers only
- [ ] Cancel button works
- [ ] Form resets after submit

### Maintenance Form
- [ ] Dropdowns work
- [ ] Description required
- [ ] Cancel button works
- [ ] Form resets after submit

## API Integration

### Mock Data Mode
- [ ] Data loads on dashboard mount
- [ ] Loading spinner shows
- [ ] Data displays after load
- [ ] CRUD operations work
- [ ] Data persists in session

### Error Handling
- [ ] Network errors handled
- [ ] Error messages display
- [ ] App doesn't crash
- [ ] User can retry

## Performance

### Load Times
- [ ] Initial load < 3 seconds
- [ ] Dashboard load < 1 second
- [ ] Modal opens instantly
- [ ] Form submits < 1 second

### Interactions
- [ ] Buttons respond immediately
- [ ] No lag on input
- [ ] Smooth transitions
- [ ] No flickering

## Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Styles correct
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styles correct
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Styles correct
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] Styles correct
- [ ] No console errors

## Build & Production

### Development Build
- [ ] `npm run dev` works
- [ ] Hot reload works
- [ ] No build errors

### Production Build
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Bundle size reasonable

### Preview
- [ ] `npm run preview` works
- [ ] Production build runs
- [ ] All features work
- [ ] Performance good

## Accessibility

### Keyboard Navigation
- [ ] Tab through forms
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Focus visible

### Screen Readers
- [ ] Labels on inputs
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Semantic HTML

## Security

### Authentication
- [ ] Token stored securely
- [ ] Protected routes work
- [ ] Logout clears token
- [ ] Session persists on refresh

### Data
- [ ] No sensitive data in console
- [ ] API calls use HTTPS (production)
- [ ] XSS protection
- [ ] CSRF protection

## Edge Cases

### Empty States
- [ ] No properties message shows
- [ ] No maintenance message shows
- [ ] No activity message shows
- [ ] Graceful handling

### Long Content
- [ ] Long addresses truncate
- [ ] Long descriptions scroll
- [ ] Tables scroll horizontally
- [ ] No layout breaks

### Network Issues
- [ ] Offline handling
- [ ] Timeout handling
- [ ] Retry mechanism
- [ ] Error messages

## Final Checks

- [ ] All links work
- [ ] All buttons work
- [ ] All forms work
- [ ] All modals work
- [ ] No console errors
- [ ] No console warnings
- [ ] Styles consistent
- [ ] Icons display
- [ ] Images load
- [ ] Data accurate

## Issues Found

Document any issues here:

1. 
2. 
3. 

## Notes

Add any additional observations:

---

**Testing Date:** ___________
**Tested By:** ___________
**Browser:** ___________
**OS:** ___________
**Result:** Pass / Fail

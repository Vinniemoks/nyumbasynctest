# Quick Start Guide

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Login Credentials (Mock Mode)
Since we're using mock data, you can login with any credentials:

**Email/Phone:** anything@example.com  
**Password:** any password

After login, you'll be redirected based on the role selected during signup.

## Testing Different Dashboards

### Test Landlord Dashboard
1. Go to signup page
2. Select "Landlord" as user type
3. Complete signup
4. You'll be redirected to `/landlord-dashboard`

**Features to Test:**
- Click "Add Property" to add a new property
- View property cards with occupancy rates
- Check monthly income statistics
- View maintenance requests

### Test Property Manager Dashboard
1. Signup as "Property Manager"
2. Redirected to `/manager-dashboard`

**Features to Test:**
- View portfolio statistics
- Check rent collection percentage
- Switch between maintenance tabs (New, In Progress, Completed)
- Click "Start" on new maintenance requests
- Click "Complete" on in-progress requests
- View lease expiration alerts

### Test Tenant Dashboard
1. Signup as "Tenant"
2. Redirected to `/tenant-dashboard`

**Features to Test:**
- Click "Pay Rent" to open payment modal
- Click "Request Help" to submit maintenance request
- View rent due and days until payment
- Check active maintenance requests
- View property details

## Project Structure
```
src/
├── api/
│   └── api.js              # API service with mock data support
├── components/
│   ├── DashboardLayout.jsx # Main dashboard layout
│   ├── ProtectedRoute.jsx  # Route protection
│   ├── Sidebar.jsx         # Navigation sidebar
│   └── StatCard.jsx        # Statistics card component
├── context/
│   └── AuthContext.jsx     # Authentication state management
├── hooks/
│   └── useDashboardData.js # Custom hook for dashboard data
├── pages/
│   ├── LandlordDashboard.jsx
│   ├── Login.jsx
│   ├── PropertyManagerDashboard.jsx
│   ├── Signup.jsx
│   └── TenantDashboard.jsx
├── utils/
│   └── mockData.js         # Mock data for development
├── App.jsx                 # Main app with routing
├── index.css              # Global styles
└── main.jsx               # App entry point
```

## Key Features

### ✅ Authentication
- Login/Signup with validation
- Role-based access control
- Protected routes
- Token management

### ✅ Landlord Features
- Add/view properties
- Track monthly income
- Monitor vacancies
- Manage maintenance requests

### ✅ Property Manager Features
- Manage property portfolio
- Track rent collection
- Handle maintenance queue
- Monitor lease expirations

### ✅ Tenant Features
- Pay rent
- Submit maintenance requests
- View property details
- Track payment history

### ✅ Interactive Forms
- Add Property modal
- Pay Rent modal
- Request Maintenance form
- All with validation

### ✅ Real-time Updates
- Dashboard refreshes after actions
- Statistics recalculate automatically
- Activity feeds update

## Switching to Real Backend

1. Open `src/api/api.js`
2. Change `this.useMockData = false`
3. Set your API URL in `.env`:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
4. Restart the dev server

## Build for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

## Preview Production Build
```bash
npm run preview
```

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Styles Not Loading
Make sure Tailwind CSS is properly configured and `src/index.css` is imported in `main.jsx`.

### Icons Not Showing
Font Awesome is loaded from CDN in `index.html`. Check your internet connection.

### Mock Data Not Updating
Mock data persists in memory during the session. Refresh the page to reset.

## Next Steps
1. Connect to your backend API
2. Implement real payment gateway
3. Add file uploads for property images
4. Create detailed property pages
5. Add real-time notifications
6. Implement messaging system

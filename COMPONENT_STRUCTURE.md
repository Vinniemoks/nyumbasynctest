# Component Structure

## Application Hierarchy

```
App (AuthProvider)
├── Router
    ├── Login (public)
    ├── Signup (public)
    │
    ├── ProtectedRoute (landlord)
    │   └── LandlordDashboard
    │       └── DashboardLayout
    │           ├── Sidebar
    │           ├── Header (with logout)
    │           └── Main Content
    │               ├── StatCard (x3)
    │               ├── Properties Section
    │               ├── Activity Section
    │               └── Add Property Modal
    │
    ├── ProtectedRoute (manager)
    │   └── PropertyManagerDashboard
    │       └── DashboardLayout
    │           ├── Sidebar
    │           ├── Header (with logout)
    │           └── Main Content
    │               ├── StatCard (x3)
    │               ├── Lease Alerts Table
    │               └── Maintenance Queue
    │                   ├── Tab Navigation
    │                   └── Maintenance Cards
    │
    └── ProtectedRoute (tenant)
        └── TenantDashboard
            └── DashboardLayout
                ├── Sidebar
                ├── Header (with logout)
                └── Main Content
                    ├── StatCard (x4)
                    ├── Quick Actions
                    ├── Activity Feed
                    ├── Property Card
                    ├── Pay Rent Modal
                    └── Maintenance Form Modal
```

## Context Providers

```
AuthProvider (wraps entire app)
├── Provides: user, isAuthenticated, loading
├── Methods: login(), signup(), logout()
└── Used by: All components via useAuth()
```

## Custom Hooks

```
useDashboardData(role)
├── Fetches: properties, tenants, payments, maintenance
├── Calculates: role-specific statistics
├── Returns: data, loading, error, refresh()
└── Used by: All dashboard pages
```

## Data Flow

```
User Action
    ↓
Component Handler
    ↓
API Service
    ↓
Mock Data / Real Backend
    ↓
Response
    ↓
State Update
    ↓
UI Re-render
```

## Component Responsibilities

### App.jsx
- Sets up routing
- Wraps app with AuthProvider
- Defines all routes
- Handles redirects

### AuthContext.jsx
- Manages authentication state
- Stores user data
- Handles login/signup/logout
- Checks authentication on mount

### ProtectedRoute.jsx
- Checks if user is authenticated
- Verifies user role
- Shows loading state
- Redirects unauthorized users

### DashboardLayout.jsx
- Provides consistent layout
- Renders sidebar and header
- Handles logout
- Displays user info

### Sidebar.jsx
- Navigation menu
- Active route highlighting
- Role-specific menu items
- Responsive design

### StatCard.jsx
- Displays statistics
- Icon with color coding
- Title, value, subtitle
- Reusable across dashboards

### Dashboard Pages
**LandlordDashboard.jsx**
- Fetches data via useDashboardData
- Displays statistics
- Property management
- Add property modal

**PropertyManagerDashboard.jsx**
- Portfolio overview
- Maintenance queue with tabs
- Lease alerts
- Status updates

**TenantDashboard.jsx**
- Rent payment
- Maintenance requests
- Property details
- Activity timeline

## API Service Structure

```
ApiService
├── Authentication
│   ├── login()
│   ├── signup()
│   ├── logout()
│   └── getCurrentUser()
│
├── Properties
│   ├── getProperties()
│   ├── createProperty()
│   ├── updateProperty()
│   └── deleteProperty()
│
├── Tenants
│   ├── getTenants()
│   └── createTenant()
│
├── Payments
│   ├── getRentPayments()
│   └── createRentPayment()
│
├── Maintenance
│   ├── getMaintenanceRequests()
│   ├── createMaintenanceRequest()
│   └── updateMaintenanceRequest()
│
└── Reports
    ├── getFinancialReport()
    └── getOccupancyReport()
```

## State Management

### Global State (AuthContext)
```javascript
{
  user: {
    id: number,
    name: string,
    email: string,
    role: 'landlord' | 'manager' | 'tenant'
  },
  isAuthenticated: boolean,
  loading: boolean
}
```

### Dashboard State (useDashboardData)
```javascript
{
  properties: Array,
  tenants: Array,
  payments: Array,
  maintenance: Array,
  stats: {
    // Role-specific statistics
  },
  loading: boolean,
  error: string | null
}
```

### Local Component State
- Form inputs
- Modal visibility
- Tab selection
- Loading states

## Routing Structure

```
/                           → Redirect to /login
/login                      → Login page (public)
/signup                     → Signup page (public)
/landlord-dashboard/*       → Landlord dashboard (protected)
/manager-dashboard/*        → Manager dashboard (protected)
/tenant-dashboard/*         → Tenant dashboard (protected)
/unauthorized               → Unauthorized access page
*                           → Redirect to /login
```

## File Organization

```
src/
├── api/
│   └── api.js              # API service class
│
├── components/
│   ├── DashboardLayout.jsx # Layout wrapper
│   ├── ProtectedRoute.jsx  # Route guard
│   ├── Sidebar.jsx         # Navigation
│   └── StatCard.jsx        # Stat display
│
├── context/
│   └── AuthContext.jsx     # Auth state
│
├── hooks/
│   └── useDashboardData.js # Data fetching
│
├── pages/
│   ├── LandlordDashboard.jsx
│   ├── Login.jsx
│   ├── PropertyManagerDashboard.jsx
│   ├── Signup.jsx
│   └── TenantDashboard.jsx
│
├── utils/
│   └── mockData.js         # Mock data
│
├── App.jsx                 # Main app
├── index.css              # Global styles
└── main.jsx               # Entry point
```

## Props Flow

### DashboardLayout
```javascript
<DashboardLayout 
  role="landlord"           // User role
  menuItems={[...]}         // Navigation items
>
  {children}                // Dashboard content
</DashboardLayout>
```

### StatCard
```javascript
<StatCard
  title="Monthly Income"    // Card title
  value="KSh 120,500"       // Main value
  subtitle="From 5 props"   // Additional info
  icon="fas fa-money"       // Font Awesome icon
  color="green"             // Color theme
/>
```

### ProtectedRoute
```javascript
<ProtectedRoute 
  allowedRoles={['landlord']} // Allowed user roles
>
  {children}                    // Protected content
</ProtectedRoute>
```

## Event Handlers

### Form Submissions
```javascript
handleSubmit(e) {
  e.preventDefault()
  validate()
  apiCall()
  updateState()
  closeModal()
  refresh()
}
```

### Button Clicks
```javascript
handleAction() {
  showModal()
  // or
  apiCall()
  refresh()
}
```

### Input Changes
```javascript
handleChange(e) {
  updateFormState()
  clearErrors()
}
```

This structure ensures:
- Clear separation of concerns
- Reusable components
- Maintainable code
- Easy testing
- Scalable architecture

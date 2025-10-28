# NyumbaSync - Property Management Platform

## Overview
NyumbaSync is a comprehensive property management platform built with React that streamlines property management for landlords, property managers, and tenants. The application features fully functional, interactive dashboards with real-time data management, API integration, and role-based access control.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Complete login/signup system with validation
- Role-based access control (Landlord, Property Manager, Tenant)
- Protected routes with automatic redirects
- JWT token management with localStorage persistence

### 🏠 Landlord Dashboard
- **Property Management**: Add, view, and manage properties
- **Financial Tracking**: Monitor monthly income from all properties
- **Vacancy Monitoring**: Track vacant units and occupancy rates
- **Maintenance Oversight**: Review and approve maintenance requests
- **Activity Feed**: Real-time updates on property activities

### 🏢 Property Manager Dashboard
- **Portfolio Management**: Oversee multiple properties
- **Rent Collection**: Track payment status and collection rates
- **Maintenance Queue**: Manage requests with status tracking (New, In Progress, Completed)
- **Lease Management**: Monitor lease expirations and renewals
- **Tenant Coordination**: Handle tenant-related tasks

### 🏘️ Tenant Dashboard
- **Rent Payment**: Easy rent payment with multiple payment methods
- **Maintenance Requests**: Submit and track maintenance issues
- **Property Details**: View rental property information and amenities
- **Activity Timeline**: Track all interactions and updates
- **Lease Information**: Monitor lease end dates and renewal options

## 🛠️ Technologies Used
- **Frontend**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **State Management**: Context API + Custom Hooks
- **Build Tool**: Vite
- **HTTP Client**: Fetch API with custom wrapper
- **Development**: Mock data system for offline development

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vinniemoks/nyumbasynctest.git
cd nyumbasynctest
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### Quick Test
1. Click "Sign up" and create an account
2. Select your role (Landlord, Property Manager, or Tenant)
3. Complete registration
4. You'll be automatically redirected to your role-specific dashboard

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running quickly
- **[Dashboard Features](DASHBOARD_FEATURES.md)** - Complete feature documentation
- **[API Endpoints](API_ENDPOINTS.md)** - Backend API reference
- **[Component Structure](COMPONENT_STRUCTURE.md)** - Architecture overview
- **[Testing Checklist](TESTING_CHECKLIST.md)** - Verify all features work
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What was built

## 🎯 Usage

### For Landlords
1. **Add Properties**: Click "Add Property" to register new properties
2. **Monitor Income**: View total monthly income from all properties
3. **Track Vacancies**: See which units are vacant
4. **Manage Maintenance**: Review and approve maintenance requests
5. **View Activity**: Check recent property-related activities

### For Property Managers
1. **Manage Portfolio**: Oversee all assigned properties
2. **Track Rent**: Monitor rent collection rates
3. **Handle Maintenance**: Process maintenance requests through the queue
4. **Monitor Leases**: Track lease expirations and initiate renewals
5. **Coordinate Tenants**: Manage tenant-related tasks

### For Tenants
1. **Pay Rent**: Submit rent payments through the platform
2. **Request Maintenance**: Report issues and track their resolution
3. **View Property**: Access property details and amenities
4. **Track Activity**: Monitor all interactions and updates
5. **Manage Lease**: View lease information and renewal options

## 🔧 Configuration

### Mock Data Mode (Default)
The app currently uses mock data for development. To switch to a real backend:

1. Open `src/api/api.js`
2. Change `this.useMockData = false`
3. Set your API URL in `.env`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api
VITE_ENVIRONMENT=development
```

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## 🏗️ Project Structure

```
src/
├── api/              # API service and HTTP client
├── components/       # Reusable React components
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components (dashboards)
├── utils/            # Utility functions and mock data
├── App.jsx           # Main app component with routing
├── main.jsx          # Application entry point
└── index.css         # Global styles
```

## 🧪 Testing

Run the testing checklist to verify all features:
```bash
# See TESTING_CHECKLIST.md for detailed testing steps
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- All tests pass
- Documentation is updated
- Commit messages are clear and descriptive

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **Vinniemoks** - [GitHub Profile](https://github.com/Vinniemoks)

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Icons by Font Awesome
- Inspired by modern property management needs

## 📞 Support

For questions, issues, or support:
- Open an issue on [GitHub Issues](https://github.com/Vinniemoks/nyumbasynctest/issues)
- Contact the repository owner at [Vinniemoks](https://github.com/Vinniemoks)

## 🗺️ Roadmap

- [ ] Real-time notifications with WebSocket
- [ ] Payment gateway integration (M-Pesa, Stripe)
- [ ] Document management system
- [ ] Messaging between users
- [ ] Advanced analytics and charts
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Multi-language support

---

**NyumbaSync** - Simplifying property management, one dashboard at a time. 🏠✨

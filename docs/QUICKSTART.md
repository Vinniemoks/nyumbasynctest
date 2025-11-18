# 🚀 Quick Start Guide

Get NyumbaSync up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git (optional)

## Installation

### Option 1: Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/nyumbasync.git
cd nyumbasync

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` - Done! 🎉

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## First Steps

### 1. Access the Application
- Open `http://localhost:5173`
- You'll see the landing page

### 2. Login as Admin
- Click "Admin" link in footer
- Or navigate to `/admin-login`
- Use your admin credentials

### 3. Enable MFA (Recommended)
- Go to Dashboard → Security (2FA)
- Click "Enable 2FA"
- Scan QR code with authenticator app
- Save backup codes

### 4. Explore Features
- **Dashboard**: Overview and analytics
- **Users**: Manage system users
- **Properties**: Property management
- **Financials**: Payment tracking
- **Settings**: System configuration

## Default Credentials

**Note**: Change these immediately after first login!

```
Admin:
Email: admin@nyumbasync.com
Password: (set during setup)
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:coverage    # Run with coverage

# Deployment
npm run deploy           # Deploy to GitHub Pages
```

## Project Structure

```
nyumbasync/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── utils/          # Utilities
│   └── config/         # Configuration
├── public/             # Static files
├── docs/               # Documentation
└── package.json        # Dependencies
```

## Next Steps

1. **[Admin Guide](./ADMIN_GUIDE.md)** - Learn admin features
2. **[Security Setup](./SECURITY.md)** - Configure security
3. **[MFA Guide](./MFA_GUIDE.md)** - Enable 2FA
4. **[Deployment](./DEPLOYMENT.md)** - Deploy to production

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check Node version
node --version  # Should be 16+

# Update dependencies
npm update
```

## Support

- **Documentation**: [docs/](.)
- **Email**: support@nyumbasync.com
- **Security**: security@nyumbasync.com

---

**Ready to build? Let's go! 🚀**

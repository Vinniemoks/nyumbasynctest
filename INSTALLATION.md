# NyumbaSync Installation Guide

This guide will help you set up the NyumbaSync tenant portal application on your local machine.

## Prerequisites

Before running the installation script, ensure you have the following installed:

### Required Software

1. **Node.js** (v18.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for cloning the repository)
   - Download from: https://git-scm.com/

## Quick Installation

### Windows

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory
3. Run the installation script:
   ```cmd
   install.bat
   ```

### Linux/Mac

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable (first time only):
   ```bash
   chmod +x install.sh
   ```
4. Run the installation script:
   ```bash
   ./install.sh
   ```

## What the Installation Script Does

The installation script performs the following steps:

1. **Checks Node.js and npm** - Verifies that required tools are installed
2. **Cleans previous installations** - Removes old node_modules and build files
3. **Installs dependencies** - Downloads and installs all required packages
4. **Configures environment** - Sets up .env file if needed
5. **Verifies installation** - Runs environment checks
6. **Displays next steps** - Shows available commands

## Manual Installation

If you prefer to install manually or the script fails:

```bash
# 1. Clean previous installations
rm -rf node_modules package-lock.json dist

# 2. Install dependencies
npm install

# 3. Create environment file (if needed)
cp .env.example .env

# 4. Verify installation
node scripts/check-env.js
```

## Environment Configuration

After installation, configure your environment variables:

1. Open the `.env` file in the project root
2. Update the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Payment Configuration
VITE_MPESA_PAYBILL=123456
VITE_STRIPE_PUBLIC_KEY=your_stripe_key

# Other configurations...
```

## Running the Application

After successful installation:

### Development Mode
```bash
npm run dev
```
Access the application at: http://localhost:5173

### Production Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:staging` | Build for staging environment |
| `npm run build:production` | Build for production environment |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run check:env` | Verify environment configuration |

## Troubleshooting

### Installation Fails

**Problem**: npm install fails with permission errors

**Solution (Windows)**:
```cmd
# Run as Administrator
npm install --force
```

**Solution (Linux/Mac)**:
```bash
# Don't use sudo with npm
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Node Version Issues

**Problem**: "The engine 'node' is incompatible"

**Solution**: Install the correct Node.js version
```bash
# Check current version
node --version

# Install Node Version Manager (nvm)
# Then install correct version
nvm install 18
nvm use 18
```

### Port Already in Use

**Problem**: Port 5173 is already in use

**Solution**: Kill the process or use a different port
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Missing Dependencies

**Problem**: Module not found errors

**Solution**: Clear cache and reinstall
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

**Problem**: Application can't read .env variables

**Solution**: 
1. Ensure .env file exists in project root
2. Restart development server
3. Check variable names start with `VITE_`

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15+, or Linux
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Node.js**: v20.x (LTS)
- **npm**: v10.x

## Browser Support

The application supports the following browsers:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Getting Help

If you encounter issues during installation:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the error messages carefully
3. Check the project's GitHub issues
4. Contact the development team

## Next Steps

After successful installation:

1. Review the [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for deployment options
2. Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for API integration
3. Read [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) before going live

## License

This project is licensed under the ISC License.

# NyumbaSync Installation Options

Choose the installation method that best suits your needs.

## 🚀 Recommended: Complete Setup (Easiest)

The complete setup wizard handles everything automatically.

### Windows
```bash
setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

**What it does:**
- ✅ Checks Node.js and npm versions
- ✅ Cleans previous installations
- ✅ Installs all dependencies
- ✅ Creates environment configuration
- ✅ Verifies installation
- ✅ Runs initial tests
- ✅ Displays next steps and available commands

**Time:** 5-10 minutes

---

## ⚡ Quick Install (Fastest)

For experienced developers who want minimal output.

### Windows
```bash
quick-install.bat
```

### Linux/Mac
```bash
chmod +x quick-install.sh
./quick-install.sh
```

**What it does:**
- ✅ Checks Node.js
- ✅ Installs dependencies
- ✅ Creates .env file

**Time:** 2-5 minutes

---

## 📋 Full Installation (Most Detailed)

For users who want detailed feedback and validation.

### Windows
```bash
install.bat
```

### Linux/Mac
```bash
chmod +x install.sh
./install.sh
```

**What it does:**
- ✅ Comprehensive system checks
- ✅ Detailed progress reporting
- ✅ Cleanup of old installations
- ✅ Dependency installation with verification
- ✅ Environment configuration
- ✅ Full validation and testing
- ✅ Troubleshooting guidance

**Time:** 5-10 minutes

---

## 🛠️ Manual Installation (Most Control)

For developers who prefer manual control.

```bash
# 1. Check prerequisites
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher

# 2. Clean previous installation (optional)
rm -rf node_modules package-lock.json dist

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 5. Verify installation
node scripts/check-env.js

# 6. Run tests
npm test

# 7. Start development server
npm run dev
```

**Time:** 10-15 minutes

---

## 📦 Installation Scripts Comparison

| Script | Platform | Checks | Cleanup | Validation | Tests | Best For |
|--------|----------|--------|---------|------------|-------|----------|
| `setup.bat/sh` | Both | ✅ Full | ✅ Yes | ✅ Full | ✅ Yes | First-time users |
| `install.bat/sh` | Both | ✅ Full | ✅ Yes | ✅ Full | ❌ No | Standard install |
| `quick-install.bat/sh` | Both | ⚠️ Basic | ❌ No | ❌ No | ❌ No | Quick setup |
| Manual | Both | 👤 Manual | 👤 Manual | 👤 Manual | 👤 Manual | Advanced users |

---

## 🔧 Prerequisites

All installation methods require:

### Required
- **Node.js** v18.0.0 or higher
  - Download: https://nodejs.org/
  - Check: `node --version`

- **npm** v9.0.0 or higher
  - Comes with Node.js
  - Check: `npm --version`

### Optional
- **Git** (for cloning repository)
  - Download: https://git-scm.com/

---

## 🎯 Which Installation Method Should I Use?

### Choose **Complete Setup** (`setup.bat/sh`) if:
- ✅ You're installing for the first time
- ✅ You want automatic validation
- ✅ You want to see detailed progress
- ✅ You want initial tests to run

### Choose **Full Installation** (`install.bat/sh`) if:
- ✅ You want detailed feedback
- ✅ You want cleanup of old files
- ✅ You don't need tests to run automatically

### Choose **Quick Install** (`quick-install.bat/sh`) if:
- ✅ You're experienced with Node.js projects
- ✅ You want minimal output
- ✅ You'll configure manually

### Choose **Manual Installation** if:
- ✅ You want complete control
- ✅ You're troubleshooting issues
- ✅ You have custom requirements

---

## 📝 After Installation

Once installation is complete, you can:

### Start Development Server
```bash
npm run dev
```
Access at: http://localhost:5173

### Build for Production
```bash
npm run build:production
```

### Run Tests
```bash
npm test
```

### Check Code Quality
```bash
npm run lint
```

---

## 🆘 Troubleshooting

### Installation Fails

**Problem:** npm install fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Try with legacy peer deps
npm install --legacy-peer-deps
```

### Permission Errors (Linux/Mac)

**Problem:** Permission denied

**Solutions:**
```bash
# Make script executable
chmod +x setup.sh

# Fix npm permissions (don't use sudo!)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Node Version Issues

**Problem:** Wrong Node.js version

**Solutions:**
```bash
# Install nvm (Node Version Manager)
# Then install correct version
nvm install 18
nvm use 18
```

### Port Already in Use

**Problem:** Port 5173 is busy

**Solutions:**
```bash
# Use different port
npm run dev -- --port 3000

# Or kill the process using the port
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

---

## 📚 Additional Resources

- [INSTALLATION.md](INSTALLATION.md) - Detailed installation guide
- [README.md](README.md) - Project overview
- [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) - Deployment guide
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - API integration
- [scripts/README.md](scripts/README.md) - Script documentation

---

## 💡 Tips

1. **First Time?** Use `setup.bat` or `setup.sh`
2. **Reinstalling?** Use `install.bat` or `install.sh`
3. **Quick Test?** Use `quick-install.bat` or `quick-install.sh`
4. **Having Issues?** Try manual installation with detailed steps

---

## 🎉 Next Steps

After successful installation:

1. **Configure Environment**
   - Edit `.env` file with your settings
   - Set API endpoints
   - Configure payment gateways (optional)

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Explore Features**
   - Test the tenant portal
   - Try different user roles
   - Check all functionality

4. **Deploy to Production**
   - See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)
   - Follow [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)

---

**Need Help?**
- Check [INSTALLATION.md](INSTALLATION.md) for detailed instructions
- Review troubleshooting section above
- Open an issue on GitHub
- Contact: support@nyumbasync.com

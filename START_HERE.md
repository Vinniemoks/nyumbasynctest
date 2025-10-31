# 🚀 Start Here - NyumbaSync Installation

Welcome! This guide will get you up and running in minutes.

## ⚡ Quick Start (Recommended)

### Windows Users
1. Open Command Prompt or PowerShell
2. Navigate to this folder
3. Run:
   ```bash
   setup.bat
   ```

### Mac/Linux Users
1. Open Terminal
2. Navigate to this folder
3. Run:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

That's it! The script will handle everything automatically.

---

## 📋 What You Need

Before running the installation:

✅ **Node.js 18+** - [Download here](https://nodejs.org/)
✅ **5-10 minutes** of time
✅ **Internet connection** for downloading packages

---

## 🎯 Installation Options

| If you want... | Run this... |
|----------------|-------------|
| **Complete automated setup** (recommended) | `setup.bat` or `setup.sh` |
| **Quick minimal install** | `quick-install.bat` or `quick-install.sh` |
| **Detailed installation** | `install.bat` or `install.sh` |
| **Manual control** | See [INSTALLATION.md](INSTALLATION.md) |

---

## 🔍 What Happens During Installation?

1. ✅ Checks if Node.js is installed
2. ✅ Cleans old installation files
3. ✅ Downloads and installs dependencies
4. ✅ Creates configuration files
5. ✅ Verifies everything works
6. ✅ Shows you what to do next

---

## 🎉 After Installation

Once setup is complete, start the development server:

```bash
npm run dev
```

Then open your browser to: **http://localhost:5173**

---

## 📚 Need More Help?

- **Detailed Guide:** [INSTALLATION.md](INSTALLATION.md)
- **All Options:** [INSTALL_OPTIONS.md](INSTALL_OPTIONS.md)
- **Project Info:** [README.md](README.md)
- **Deployment:** [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)

---

## 🆘 Having Issues?

### Node.js Not Found
Install Node.js from: https://nodejs.org/

### Permission Errors (Mac/Linux)
```bash
chmod +x setup.sh
./setup.sh
```

### Installation Fails
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Port Already in Use
```bash
npm run dev -- --port 3000
```

---

## 💡 Pro Tips

- ✨ First time? Use `setup.bat` or `setup.sh`
- ⚡ In a hurry? Use `quick-install.bat` or `quick-install.sh`
- 🔧 Want details? See [INSTALLATION.md](INSTALLATION.md)
- 🚀 Ready to deploy? See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)

---

**Ready? Let's go!** 🎯

Run the setup script for your platform and you'll be coding in minutes!

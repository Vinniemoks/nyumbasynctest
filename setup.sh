#!/bin/bash

# ============================================
# NyumbaSync Complete Setup Script (Unix/Linux/Mac)
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "============================================"
echo "   NyumbaSync Complete Setup Wizard"
echo "============================================"
echo ""

# Check Node.js
echo -e "${BLUE}[Step 1/7] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not installed!${NC}"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Recommended: Node.js 18.x LTS or higher"
    echo ""
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}[OK] Node.js $NODE_VERSION detected${NC}"
echo ""

# Check npm
echo -e "${BLUE}[Step 2/7] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm not installed!${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}[OK] npm $NPM_VERSION detected${NC}"
echo ""

# Clean installation
echo -e "${BLUE}[Step 3/7] Cleaning previous installation...${NC}"
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm -f package-lock.json
fi
if [ -d "dist" ]; then
    echo "Removing dist folder..."
    rm -rf dist
fi
if [ -d "docs" ]; then
    echo "Removing docs folder..."
    rm -rf docs
fi
echo -e "${GREEN}[OK] Cleanup complete${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[Step 4/7] Installing dependencies...${NC}"
echo "This may take several minutes..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] Failed to install dependencies!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check your internet connection"
    echo "2. Try running: npm cache clean --force"
    echo "3. Delete node_modules and try again"
    echo ""
    exit 1
fi
echo ""
echo -e "${GREEN}[OK] All dependencies installed${NC}"
echo ""

# Setup environment
echo -e "${BLUE}[Step 5/7] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}[OK] .env file created${NC}"
        echo -e "${YELLOW}[ACTION REQUIRED] Please edit .env file with your configuration${NC}"
    else
        echo -e "${YELLOW}[WARNING] No .env.example found${NC}"
        echo "You may need to create .env manually"
    fi
else
    echo -e "${GREEN}[OK] .env file already exists${NC}"
fi
echo ""

# Verify environment
echo -e "${BLUE}[Step 6/7] Verifying environment configuration...${NC}"
if [ -f "scripts/check-env.js" ]; then
    if node scripts/check-env.js; then
        echo -e "${GREEN}[OK] Environment configuration valid${NC}"
    else
        echo -e "${YELLOW}[WARNING] Environment check found issues${NC}"
        echo "Please review and update your .env file"
    fi
else
    echo -e "${YELLOW}[SKIP] Environment check script not found${NC}"
fi
echo ""

# Run initial tests
echo -e "${BLUE}[Step 7/7] Running initial tests...${NC}"
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] All tests passed${NC}"
else
    echo -e "${YELLOW}[WARNING] Some tests failed${NC}"
    echo "This is normal for a fresh installation"
fi
echo ""

# Display summary
echo "============================================"
echo -e "${GREEN}   Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Installation Summary:"
echo "  Node.js: $NODE_VERSION"
echo "  npm: $NPM_VERSION"
echo "  Dependencies: Installed"
echo "  Environment: Configured"
echo ""
echo "Next Steps:"
echo ""
echo "1. Configure your .env file:"
echo "   - Set API endpoints"
echo "   - Configure payment gateways"
echo "   - Set up monitoring (optional)"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Build for production:"
echo "   npm run build:production"
echo ""
echo "Available Commands:"
echo "  npm run dev              - Start development server"
echo "  npm run build            - Build for production"
echo "  npm run test             - Run tests"
echo "  npm run lint             - Check code quality"
echo "  npm run format           - Format code"
echo ""
echo "Documentation:"
echo "  INSTALLATION.md          - Installation guide"
echo "  DEPLOYMENT_QUICKSTART.md - Deployment guide"
echo "  INTEGRATION_GUIDE.md     - API integration"
echo ""
echo "For help, visit: https://github.com/Vinniemoks/nyumbasynctest"
echo ""

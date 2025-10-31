#!/bin/bash

# ============================================
# NyumbaSync Installation Script (Unix/Linux/Mac)
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "   NyumbaSync Installation Script"
echo "========================================"
echo ""

# Check if Node.js is installed
echo -e "${BLUE}[1/6] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Recommended version: Node.js 18.x or higher"
    exit 1
fi

echo -e "${GREEN}[OK] Node.js is installed${NC}"
node --version
echo ""

# Check if npm is installed
echo -e "${BLUE}[2/6] Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] npm is installed${NC}"
npm --version
echo ""

# Clean previous installations
echo -e "${BLUE}[3/6] Cleaning previous installations...${NC}"
if [ -d "node_modules" ]; then
    echo "Removing old node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing old package-lock.json..."
    rm -f package-lock.json
fi
if [ -d "dist" ]; then
    echo "Removing old build files..."
    rm -rf dist
fi
echo -e "${GREEN}[OK] Cleanup complete${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[4/6] Installing project dependencies...${NC}"
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Dependencies installed successfully${NC}"
echo ""

# Check environment configuration
echo -e "${BLUE}[5/6] Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}[WARNING] Please configure your .env file with appropriate values${NC}"
    else
        echo -e "${YELLOW}[WARNING] No .env file found. You may need to create one.${NC}"
    fi
else
    echo -e "${GREEN}[OK] .env file exists${NC}"
fi
echo ""

# Verify installation
echo -e "${BLUE}[6/6] Verifying installation...${NC}"
if [ -f "scripts/check-env.js" ]; then
    node scripts/check-env.js || echo -e "${YELLOW}[WARNING] Environment check completed with warnings${NC}"
else
    echo -e "${YELLOW}[WARNING] Environment check script not found${NC}"
fi
echo ""

echo "========================================"
echo -e "${GREEN}   Installation Complete!${NC}"
echo "========================================"
echo ""
echo "Available commands:"
echo "  npm run dev              - Start development server"
echo "  npm run build            - Build for production"
echo "  npm run build:staging    - Build for staging"
echo "  npm run build:production - Build for production"
echo "  npm test                 - Run tests"
echo "  npm run lint             - Check code quality"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""

#!/bin/bash
# Quick Installation Script for NyumbaSync (Unix/Linux/Mac)

echo "Installing NyumbaSync..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found! Install from https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env if needed
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created .env file - please configure it"
fi

echo ""
echo "Installation complete!"
echo "Run: npm run dev"
echo ""

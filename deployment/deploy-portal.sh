#!/bin/bash

# MIZU Portal - Quick Deployment Script
# Run this script to deploy portal updates

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

PORTAL_DIR="/var/www/mmb-portal"

print_status "🚀 Deploying MIZU Portal updates..."

# Check if portal directory exists
if [ ! -d "$PORTAL_DIR" ]; then
    print_error "Portal directory not found at $PORTAL_DIR"
    print_error "Please run the setup script first: sudo ./setup-portal.sh"
    exit 1
fi

cd $PORTAL_DIR

# Pull latest changes
print_status "Pulling latest changes from repository..."
git pull origin main

# Install/update dependencies
print_status "Installing/updating dependencies..."
npm install

# Build for production
print_status "Building portal for production..."
npm run build

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data $PORTAL_DIR/dist
sudo chmod -R 755 $PORTAL_DIR/dist

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid."
else
    print_error "Nginx configuration test failed!"
    exit 1
fi

print_status "✅ Portal deployment completed successfully!"
print_status "🌐 Portal is available at: http://your-server-ip/"

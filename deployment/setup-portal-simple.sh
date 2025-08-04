#!/bin/bash

# MIZU Micro Bank Portal - Simple Setup Script
# This script adds portal configuration to the existing mmb-api nginx config

set -e

echo "🚀 Setting up MIZU Portal deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root and adjust accordingly
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root user. This is acceptable for VPS setups."
    SUDO_CMD=""
    WEB_USER="www-data"
else
    print_status "Running as regular user with sudo privileges."
    SUDO_CMD="sudo"
    WEB_USER="www-data"
fi

# Check if Node.js is already installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please run the API setup script first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"

# Create portal directory
PORTAL_DIR="/var/www/mmb-portal"
print_status "Creating portal directory: $PORTAL_DIR"
$SUDO_CMD mkdir -p $PORTAL_DIR

# Clone or update portal repository
if [ -d "$PORTAL_DIR/.git" ]; then
    print_status "Updating existing portal repository..."
    cd $PORTAL_DIR
    git pull origin main
else
    print_status "Cloning portal repository..."
    cd /var/www
    $SUDO_CMD git clone https://github.com/uniquedj95/mmb-portal.git mmb-portal
    cd mmb-portal
fi

# Install dependencies and build
print_status "Installing portal dependencies..."
$SUDO_CMD npm install

print_status "Building portal for production..."
$SUDO_CMD npm run build

# Backup existing nginx config
print_status "Backing up existing nginx configuration..."
$SUDO_CMD cp /etc/nginx/sites-available/mmb-api /etc/nginx/sites-available/mmb-api.backup.$(date +%Y%m%d-%H%M%S)

# Add portal location to existing nginx config
print_status "Adding portal configuration to nginx..."

# Get the current config and add portal location before the first location block
$SUDO_CMD sed -i '/location.*{/i\
    # Portal (Admin Dashboard) - served as static files\
    location / {\
        root /var/www/mmb-portal/dist;\
        try_files $uri $uri/ /index.html;\
        \
        # Cache static assets\
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\
            expires 1y;\
            add_header Cache-Control "public, immutable";\
            access_log off;\
        }\
        \
        # Don'\''t cache HTML files\
        location ~* \\.html$ {\
            expires -1;\
            add_header Cache-Control "no-cache, no-store, must-revalidate";\
        }\
    }\
' /etc/nginx/sites-available/mmb-api

# Test nginx configuration
print_status "Testing nginx configuration..."
$SUDO_CMD nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid. Reloading nginx..."
    $SUDO_CMD systemctl reload nginx
else
    print_error "Nginx configuration test failed. Restoring backup..."
    $SUDO_CMD cp /etc/nginx/sites-available/mmb-api.backup.$(date +%Y%m%d)* /etc/nginx/sites-available/mmb-api
    exit 1
fi

# Set proper permissions
print_status "Setting proper permissions..."
$SUDO_CMD chown -R $WEB_USER:$WEB_USER /var/www/mmb-portal
$SUDO_CMD chmod -R 755 /var/www/mmb-portal

print_status "✅ MIZU Portal setup completed!"
print_status ""
print_status "🌐 Your portal should now be available at: http://your-server-ip/"
print_status "🔗 Your API should still be available at: http://your-server-ip/api"
print_status ""
print_warning "If you see any issues, check: tail -f /var/log/nginx/error.log"

#!/bin/bash

# MIZU Micro Bank Portal - VPS Setup Script
# This script sets up the portal deployment on the same VPS as the API

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
    USER_HOME="/root"
else
    print_status "Running as regular user with sudo privileges."
    SUDO_CMD="sudo"
    WEB_USER="www-data"
    USER_HOME="$HOME"
fi

# Check if Node.js is already installed (should be from API setup)
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

# Set ownership appropriately
if [[ $EUID -eq 0 ]]; then
    chown root:root $PORTAL_DIR
else
    $SUDO_CMD chown $USER:$USER $PORTAL_DIR
fi

# Install build dependencies if not already present
print_status "Installing build dependencies..."
$SUDO_CMD apt-get update
$SUDO_CMD apt-get install -y git

# Clone or update portal repository
if [ -d "$PORTAL_DIR/.git" ]; then
    print_status "Updating existing portal repository..."
    cd $PORTAL_DIR
    git pull origin main
else
    print_status "Cloning portal repository..."
    print_warning "Please manually clone your portal repository to $PORTAL_DIR"
    print_warning "Or update this script with your repository URL"
    git clone https://github.com/uniquedj95/mmb-portal.git $PORTAL_DIR
fi

# Install dependencies and build
print_status "Installing portal dependencies..."
cd $PORTAL_DIR
npm install

print_status "Building portal for production..."
npm run build

# Create nginx configuration for portal
print_status "Creating nginx configuration for portal..."

# Backup existing nginx config
$SUDO_CMD cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d-%H%M%S)

# Create new nginx config that includes both API and Portal
$SUDO_CMD tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=portal:10m rate=30r/s;

server {
    listen 80;
    server_name _;  # Accept any server name (IP address)
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Portal (Admin Dashboard) - served as static files
    location / {
        root /var/www/mmb-portal/dist;
        try_files $uri $uri/ /index.html;
        
        # Rate limiting for portal
        limit_req zone=portal burst=50 nodelay;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Don't cache HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # API routes
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Rate limiting for API
        limit_req zone=api burst=20 nodelay;
    }

    # API documentation
    location /api-docs {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file uploads from API
    location /uploads {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static files
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://127.0.0.1:5000;
        access_log off;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

# Test nginx configuration
print_status "Testing nginx configuration..."
$SUDO_CMD nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid. Reloading nginx..."
    $SUDO_CMD systemctl reload nginx
else
    print_error "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Set proper permissions
print_status "Setting proper permissions..."
$SUDO_CMD chown -R $WEB_USER:$WEB_USER /var/www/mmb-portal/dist
$SUDO_CMD chmod -R 755 /var/www/mmb-portal/dist

# Create deployment script for future updates
print_status "Creating deployment script..."
$SUDO_CMD tee /usr/local/bin/deploy-portal.sh > /dev/null << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying MIZU Portal..."

# Check if running as root and adjust accordingly
if [[ $EUID -eq 0 ]]; then
    SUDO_CMD=""
    WEB_USER="www-data"
else
    SUDO_CMD="sudo"
    WEB_USER="www-data"
fi

cd /var/www/mmb-portal

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build

# Set permissions
$SUDO_CMD chown -R $WEB_USER:$WEB_USER /var/www/mmb-portal/dist
$SUDO_CMD chmod -R 755 /var/www/mmb-portal/dist

echo "✅ Portal deployment completed!"
EOF

$SUDO_CMD chmod +x /usr/local/bin/deploy-portal.sh

print_status "✅ MIZU Portal setup completed!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Clone your portal repository to /var/www/mmb-portal (if not done automatically)"
print_status "2. Configure your portal's API base URL to point to your server"
print_status "3. Run: sudo /usr/local/bin/deploy-portal.sh (for future deployments)"
print_status ""
print_status "🌐 Your portal will be available at: http://your-server-ip/"
print_status "🔗 Your API will remain available at: http://your-server-ip/api"
print_status ""
print_warning "Don't forget to configure your portal's API endpoints to use the correct base URL!"

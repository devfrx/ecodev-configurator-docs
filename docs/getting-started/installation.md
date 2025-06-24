# Installation Guide

This guide provides detailed instructions for installing and configuring the EcoDev Configurator in different environments.

## Table of Contents

- [System Requirements](#system-requirements)
- [Development Installation](#development-installation)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Odoo Backend Setup](#odoo-backend-setup)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Development Environment

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with Vue.js extensions

### Production Environment

- **Web Server**: Nginx, Apache, or similar
- **HTTPS**: Required for production deployment
- **Domain**: Configured domain with SSL certificate

### Browser Support

- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+

## Development Installation

### 1. Clone Repository

```bash
# Clone the project repository
git clone <repository-url>
cd configurator-ecoctrl

# Verify Node.js version
node --version  # Should be 18.0+
npm --version   # Should be 9.0+
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# If you encounter permission issues on macOS/Linux:
sudo npm install

# Alternative using yarn (if preferred):
yarn install
```

### 3. Environment Setup

Create environment files for different configurations:

```bash
# Create development environment file
cp .env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

### 4. Configure Environment Variables

```bash
# .env - Development Configuration
VITE_API_BASE_URL=http://localhost:8069
VITE_DATABASE=dev_database

# Optional development settings
NODE_ENV=development
VITE_DEBUG=true
```

### 5. Start Development Server

```bash
# Start the development server with hot reload
npm run dev

# Alternative start command
npm start

# Server will be available at:
# Local:   http://localhost:5173
# Network: http://192.168.x.x:5173
```

### 6. Verify Installation

1. Open browser to `http://localhost:5173`
2. You should see the EcoDev Configurator login page
3. Check browser console for any errors
4. Test basic navigation (may show connection errors without Odoo)

## Production Deployment

### 1. Build Application

```bash
# Create optimized production build
npm run build

# The build output will be in the `dist/` directory
# Files are minified and optimized for production
```

### 2. Configure Production Environment

```bash
# .env.production
VITE_API_BASE_URL=https://your-odoo-domain.com
VITE_DATABASE=production_database
NODE_ENV=production
```

### 3. Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /path/to/configurator-ecoctrl/dist;
    index index.html;

    # Handle Vue Router history mode
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /path/to/configurator-ecoctrl/dist

    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key

    # Handle Vue Router history mode
    <Directory "/path/to/configurator-ecoctrl/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static files
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

### 4. Deploy to Server

```bash
# Copy built files to web server
scp -r dist/* user@your-server:/path/to/web/root/

# Or using rsync
rsync -avz dist/ user@your-server:/path/to/web/root/

# Set proper permissions
chmod -R 644 /path/to/web/root/*
chmod 755 /path/to/web/root
```

## Environment Configuration

### Environment Variables Reference

| Variable            | Description        | Example                    | Required |
| ------------------- | ------------------ | -------------------------- | -------- |
| `VITE_API_BASE_URL` | Odoo server URL    | `https://odoo.company.com` | Yes      |
| `VITE_DATABASE`     | Odoo database name | `production_db`            | Yes      |
| `NODE_ENV`          | Environment mode   | `production`               | No       |

### Configuration Files

#### Development (`vite.config.js`)

```javascript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
});
```

#### Production Optimization

```javascript
// vite.config.js - Production optimizations
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          ionic: ["@ionic/vue"],
          pdf: ["pdfmake"],
        },
      },
    },
  },
});
```

## Odoo Backend Setup

### Required Models

The application requires these custom Odoo models:

```python
# Custom models that must be installed in Odoo
x_product_categories      # Product categories
x_supercategories        # Supercategories
x_steps                  # Configuration steps
x_options                # Configuration options
x_constraints            # Option constraints
x_rules                  # Business rules
```

### User Permissions

Configure Odoo user with these permissions:

```yaml
Read Access:
  - x_product_categories
  - x_supercategories
  - x_steps
  - x_options
  - x_constraints
  - x_rules
  - sale.order
  - res.partner

Write Access:
  - sale.order
  - sale.order.line
  - res.partner
  - product.product
  - product.template
```

### API Endpoints

Ensure these Odoo endpoints are accessible:

```bash
# Authentication
POST /web/session/authenticate
POST /web/session/get_session_info
POST /web/session/destroy

# Data access
POST /web/dataset/call_kw/{model}/{method}

# File upload
POST /web/binary/upload_attachment
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Conflicts

```bash
# Check current version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

#### npm Installation Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use

```bash
# Find process using port 5173
lsof -ti:5173

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### Development Issues

#### CORS Errors

If you encounter CORS errors during development:

```javascript
// vite.config.js - Add proxy for development
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://your-odoo-server:8069",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

#### Environment Variables Not Loading

```bash
# Ensure .env file is in project root
ls -la .env

# Check file permissions
chmod 644 .env

# Verify variable names start with VITE_
echo $VITE_API_BASE_URL
```

### Production Issues

#### Static Files Not Found

```bash
# Verify build output
ls -la dist/

# Check web server document root
# Ensure all files are properly uploaded
```

#### HTTPS/SSL Issues

```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Verify certificate chain
ssl-checker your-domain.com
```

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for error details
2. Review the network tab for failed requests
3. Verify Odoo server accessibility
4. Check file permissions and ownership
5. Consult the API documentation for backend issues

For additional support, contact the development team or check the project repository for known issue

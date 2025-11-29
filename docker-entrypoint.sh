#!/bin/sh
set -e

# Get port from environment variable, default to 80
PORT=${PORT:-80}

# Log the port being used
echo "Starting nginx on port ${PORT}"

# Generate nginx config with the correct port
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Disable any redirects
    absolute_redirect off;
    
    # Serve root path explicitly - no redirects
    location = / {
        root /usr/share/nginx/html;
        try_files /index.html =404;
        add_header X-Debug-Root "serving-index";
    }
    
    # Serve static assets directly
    location ~* \.(png|jpg|jpeg|gif|ico|svg|pdf|docx|css|js|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    # Serve assets directory
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    # Block /lander path explicitly (if it exists, return 404)
    location = /lander {
        return 404;
    }
    
    # Fallback to index.html for HTML routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"


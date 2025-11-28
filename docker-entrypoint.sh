#!/bin/sh
set -e

# Get port from environment variable, default to 80
PORT=${PORT:-80}

# Generate nginx config with the correct port
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
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
    
    # Fallback to index.html for HTML routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Start nginx
exec nginx -g "daemon off;"


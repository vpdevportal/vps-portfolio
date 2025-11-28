# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-workspaces

# Copy source code
COPY . .

# Build the Astro site
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (properly serve static assets)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Serve static assets directly \
    location ~* \.(png|jpg|jpeg|gif|ico|svg|pdf|docx|css|js|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Serve assets directory \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Fallback to index.html for HTML routes \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]


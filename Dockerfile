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

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy startup script that handles PORT environment variable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy health check script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Expose port 80 (default) and 3000 (for Coolify)
EXPOSE 80 3000

# Health check for Coolify - checks if nginx is responding on the configured port
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD /healthcheck.sh || exit 1

# Start nginx with dynamic port support
ENTRYPOINT ["/docker-entrypoint.sh"]


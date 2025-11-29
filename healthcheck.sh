#!/bin/sh
# Health check script for Coolify
# Checks if nginx is responding on the configured port

# Get port from environment variable, default to 80
PORT=${PORT:-80}

# Try to connect to nginx on the configured port
if wget --quiet --tries=1 --timeout=2 --spider "http://localhost:${PORT}/" 2>/dev/null; then
  exit 0
fi

# If that fails, try common ports as fallback
if wget --quiet --tries=1 --timeout=2 --spider "http://localhost:80/" 2>/dev/null; then
  exit 0
fi

if wget --quiet --tries=1 --timeout=2 --spider "http://localhost:3000/" 2>/dev/null; then
  exit 0
fi

# If all checks fail, return unhealthy
exit 1


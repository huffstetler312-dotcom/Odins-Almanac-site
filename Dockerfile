# Multi-stage build for Odin's Almanac Server
FROM node:18-alpine AS dependencies

# Install dependencies for better caching
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM node:18-alpine AS build-deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci

# Final runtime stage
FROM node:18-alpine AS runtime

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs server/ ./

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_CACHE=/tmp/.npm

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/healthz', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) \
  }).on('error', () => { process.exit(1) })"

# Switch to non-root user
USER nodejs

# Start the application
CMD ["node", "index.js"]
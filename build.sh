#!/bin/bash
set -e

echo "🛡️ Building Odin's Almanac for production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
cd server
npm ci --only=production

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high

# Run tests
echo "🧪 Running tests..."
npm test

# Build completion
echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment on port ${PORT:-8080}"
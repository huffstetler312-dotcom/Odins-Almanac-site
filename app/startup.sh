#!/bin/sh
# Azure App Service startup script for Odin's Eye

echo "Starting Odin's Eye application..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Navigate to the app directory
cd /home/site/wwwroot

# Install dependencies if needed (Azure should do this automatically)
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Run the application
echo "Starting application with: npm start"
npm start

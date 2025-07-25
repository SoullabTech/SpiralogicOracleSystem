#!/bin/bash

# Oracle Frontend Deployment Script
# Run this from the root directory

set -e

echo "🚀 Starting Oracle Frontend Deployment Setup..."

# Navigate to frontend directory
cd oracle-frontend

echo "📁 Current directory: $(pwd)"

# Clean up conflicting files
echo "🧹 Cleaning up conflicting configuration files..."
rm -f next.config.js
rm -f vite.config.*.ts vite.config.*.js vite.config.mjs vite.config.base.ts vite.config.prod.ts vite.config.ssr.ts
rm -f server.js server.ts
rm -rf oracle-test/
rm -f swisseph

# Create necessary directories
echo "📂 Creating build directories..."
mkdir -p dist
mkdir -p public

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Add missing Babel dependencies
echo "📦 Adding missing Babel dependencies..."
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/plugin-proposal-class-properties @babel/plugin-syntax-dynamic-import core-js@3

# Add PostCSS and Tailwind
echo "📦 Adding PostCSS and Tailwind dependencies..."
npm install --save-dev postcss postcss-loader autoprefixer tailwindcss

# Add serve for production
echo "📦 Adding serve for production..."
npm install --save-dev serve

# Copy static assets to public if they don't exist
echo "📋 Setting up public assets..."
if [ ! -f "public/index.html" ]; then
    echo "Creating default index.html..."
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/spiral-loader.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Oracle Frontend - Spiralogic Oracle System" />
    <title>Oracle Frontend</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
fi

# Test build
echo "🔨 Testing build process..."
npm run build

echo "✅ Build successful!"

# Go back to root
cd ..

echo "📝 Next Steps:"
echo ""
echo "For Vercel deployment:"
echo "1. Deploy from the oracle-frontend/ directory"
echo "2. Use the vercel.json configuration provided"
echo "3. Set build command: npm run build"
echo "4. Set output directory: dist"
echo ""
echo "For Render deployment:"
echo "1. Use the render.yaml configuration provided"
echo "2. Deploy from the root directory"
echo "3. Render will automatically build and serve the frontend"
echo ""
echo "🎉 Deployment setup complete!"
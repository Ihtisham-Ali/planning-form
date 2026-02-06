#!/bin/bash

# Planning Assessment Form - Deployment Script
# This script helps deploy the application to various platforms

echo "🏗️  Planning Assessment Form - Deployment Helper"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

echo "Select deployment option:"
echo ""
echo "1) Netlify (Recommended - Free tier available)"
echo "2) Vercel (Free tier available)"
echo "3) Surge.sh (Simple and free)"
echo "4) Test locally (Python HTTP server)"
echo "5) Test locally (Node.js HTTP server)"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying to Netlify..."
        echo ""
        
        # Check if netlify-cli is installed
        if ! command -v netlify &> /dev/null; then
            echo "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi
        
        echo ""
        echo "Starting Netlify deployment..."
        echo "You'll need to:"
        echo "  1. Authorize Netlify CLI (browser will open)"
        echo "  2. Choose 'Create & configure a new site'"
        echo "  3. Select your team"
        echo "  4. Choose a site name (or use auto-generated)"
        echo ""
        read -p "Press Enter to continue..."
        
        netlify deploy --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Don't forget to configure your API keys in the settings page!"
        ;;
        
    2)
        echo ""
        echo "📦 Deploying to Vercel..."
        echo ""
        
        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        echo ""
        echo "Starting Vercel deployment..."
        echo "You'll need to authorize Vercel CLI"
        echo ""
        read -p "Press Enter to continue..."
        
        vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Don't forget to configure your API keys in the settings page!"
        ;;
        
    3)
        echo ""
        echo "📦 Deploying to Surge.sh..."
        echo ""
        
        # Check if surge is installed
        if ! command -v surge &> /dev/null; then
            echo "Surge CLI not found. Installing..."
            npm install -g surge
        fi
        
        echo ""
        echo "Starting Surge deployment..."
        echo "You'll need to:"
        echo "  1. Create an account (if first time)"
        echo "  2. Choose a domain name"
        echo ""
        read -p "Press Enter to continue..."
        
        surge .
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Don't forget to configure your API keys in the settings page!"
        ;;
        
    4)
        echo ""
        echo "🚀 Starting local Python HTTP server..."
        echo ""
        echo "The form will be available at: http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        echo ""
        sleep 2
        
        # Try Python 3 first, then Python 2
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "❌ Python not found. Please install Python to use this option."
            exit 1
        fi
        ;;
        
    5)
        echo ""
        echo "🚀 Starting local Node.js HTTP server..."
        echo ""
        
        # Check if http-server is installed
        if ! command -v http-server &> /dev/null; then
            echo "http-server not found. Installing..."
            npm install -g http-server
        fi
        
        echo "The form will be available at: http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        echo ""
        sleep 2
        
        http-server -p 8000
        ;;
        
    6)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "📝 Next Steps:"
echo "   1. Open your deployed site"
echo "   2. Go to Settings (gear icon)"
echo "   3. Configure your Google Maps API key"
echo "   4. Configure your Webhook URL"
echo "   5. Test the form!"
echo ""
echo "Need help? Check README.md for detailed instructions"
echo "=================================================="

#!/bin/bash

# Mihu AI Deployment Script
echo "🚀 Mihu AI Deployment Script"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your API keys before deploying!"
    echo "   Required: JWT_SECRET, GROQ_API_KEY, TAVILY_API_KEY"
    exit 1
fi

# Check if required environment variables are set
source .env
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-here" ]; then
    echo "❌ JWT_SECRET not set in .env file"
    exit 1
fi

if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your-groq-api-key-here" ]; then
    echo "❌ GROQ_API_KEY not set in .env file"
    exit 1
fi

if [ -z "$TAVILY_API_KEY" ] || [ "$TAVILY_API_KEY" = "your-tavily-api-key-here" ]; then
    echo "❌ TAVILY_API_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment variables configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test the application
echo "🧪 Testing application..."
node -e "
try {
    require('./final-server.js');
    console.log('✅ Server can start successfully');
    process.exit(0);
} catch (error) {
    console.log('❌ Server test failed:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Your Mihu AI app is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Choose a deployment platform:"
    echo "   • Railway (recommended): https://railway.app"
    echo "   • Vercel: https://vercel.com"
    echo "   • Heroku: https://heroku.com"
    echo "   • DigitalOcean: https://cloud.digitalocean.com"
    echo ""
    echo "3. Add your environment variables to the platform"
    echo "4. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Deployment preparation failed. Please check the errors above."
    exit 1
fi

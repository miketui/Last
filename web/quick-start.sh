#!/bin/bash
# Quick Start Script for Curls & Contemplation Website
# This script automates the initial setup process

set -e  # Exit on any error

echo "🎨 Curls & Contemplation - Quick Start"
echo "======================================"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install
echo "✅ Dependencies installed"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
if [ -f "curls-contemplation.db" ]; then
    echo "⚠️  Database already exists. Skipping..."
else
    bun setup-database.ts
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your API keys:"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_PUBLISHABLE_KEY"
    echo "   - RESEND_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create private directory for book files
echo "📚 Setting up directories..."
mkdir -p private
mkdir -p public/downloads
echo "✅ Directories created"
echo ""

# Check for book files
if [ ! -f "private/CurlsAndContemplation.epub" ]; then
    echo "📖 Book files not found in private/ directory"

    # Try to copy from parent directory (repository root)
    if [ -f "../CurlsAndContemplationV4.epub" ]; then
        echo "   Copying EPUB from repository root..."
        cp "../CurlsAndContemplationV4.epub" "./private/CurlsAndContemplation.epub"
        echo "   ✅ EPUB copied"
    else
        echo "   ⚠️  Please add CurlsAndContemplation.epub to private/ directory"
    fi
else
    echo "✅ EPUB file found"
fi

if [ ! -f "private/CurlsAndContemplation.pdf" ]; then
    # Try to copy from parent directory (repository root)
    if [ -f "../CurlsAndContemplation-POD-6x9.pdf" ]; then
        echo "   Copying PDF from repository root..."
        cp "../CurlsAndContemplation-POD-6x9.pdf" "./private/CurlsAndContemplation.pdf"
        echo "   ✅ PDF copied"
    else
        echo "   ⚠️  Please add CurlsAndContemplation.pdf to private/ directory"
    fi
else
    echo "✅ PDF file found"
fi
echo ""

# Check for free resource PDF
if [ ! -f "public/downloads/pricing-confidence-kit.pdf" ]; then
    echo "🎁 Free resource PDF not found"

    # Use book PDF as placeholder
    if [ -f "../CurlsAndContemplation-POD-6x9.pdf" ]; then
        echo "   Using book PDF as placeholder for free resource..."
        cp "../CurlsAndContemplation-POD-6x9.pdf" "./public/downloads/pricing-confidence-kit.pdf"
        echo "   ✅ Placeholder created (replace with actual pricing kit PDF later)"
    else
        echo "   ⚠️  Please add pricing-confidence-kit.pdf to public/downloads/"
    fi
else
    echo "✅ Free resource PDF found"
fi
echo ""

# Summary
echo "======================================"
echo "✨ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your API keys:"
echo "   nano .env"
echo ""
echo "2. Start the development server:"
echo "   bun --hot server.ts"
echo ""
echo "3. Visit: http://localhost:3000"
echo ""
echo "4. Test the checkout flow with Stripe test card:"
echo "   Card: 4242 4242 4242 4242"
echo "   Expiry: Any future date"
echo "   CVC: Any 3 digits"
echo ""
echo "📖 For detailed setup instructions, see SETUP.md"
echo ""

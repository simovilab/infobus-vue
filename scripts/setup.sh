#!/bin/bash

# @infobus/vue Setup Script
# This script sets up the development environment for the @infobus/vue package

echo "🚌 Setting up @infobus/vue development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Running type check..."
pnpm type-check

echo "🧪 Running tests..."
pnpm test --run

echo "📋 Running linting..."
pnpm lint

echo "🎨 Running formatting..."
pnpm format

echo "🏗️ Building library..."
pnpm build:lib

echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev        - Start development server"
echo "  pnpm build:lib  - Build library for production"
echo "  pnpm test       - Run tests"
echo "  pnpm lint       - Run linter"
echo "  pnpm format     - Format code"
echo "  pnpm type-check - Check TypeScript types"
echo ""
echo "📚 Check the README.md for detailed usage instructions."

#!/bin/bash

# Infrastructure deployment script for CI/CD
# This script ensures the database is properly set up before deployment
# Designed to run on Linux-based deployment servers (GitHub Actions, etc.)

set -e

echo "🚀 Starting infrastructure deployment..."

# Set environment variables for deployment
export NODE_ENV=production

# Ensure we have required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

echo "📋 Generating migration files..."
bun run db:generate

echo "🔄 Running database migrations..."
bun run db:migrate

echo "🌱 Running database seeding..."
bun run db:seed

echo "✅ Infrastructure deployment completed successfully"

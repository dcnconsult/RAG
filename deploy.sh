#!/bin/bash

# RAG Explorer Production Deployment Script
set -e

echo "🚀 Starting RAG Explorer Production Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads logs database

# Set environment variables
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-rag_password}
export POSTGRES_USER=${POSTGRES_USER:-rag_user}
export POSTGRES_DB=${POSTGRES_DB:-rag_db}

echo "🔧 Environment variables set:"
echo "   POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
echo "   POSTGRES_USER: $POSTGRES_USER"
echo "   POSTGRES_DB: $POSTGRES_DB"

# Build and start the application
echo "🏗️  Building and starting RAG Explorer..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ RAG Explorer is running successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   PostgreSQL: localhost:5432"
    echo "   Redis: localhost:6379"
    echo ""
    echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

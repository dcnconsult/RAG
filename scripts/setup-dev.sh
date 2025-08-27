#!/bin/bash

# RAG Explorer Development Setup Script
# This script sets up the development environment for the RAG Explorer project

set -e

echo "🚀 Setting up RAG Explorer development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3.11+ is required but not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 18+ is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
    fi
    
    # Check Poetry
    if ! command -v poetry &> /dev/null; then
        print_warning "Poetry is not installed. Installing via pip..."
        pip install poetry
    fi
    
    print_success "System requirements check completed"
}

# Setup backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    poetry install
    
    # Create environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up React frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create environment file if it doesn't exist
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file from template..."
        cp env.local.example .env.local
        print_warning "Please edit .env.local file with your configuration"
    fi
    
    # Setup Git hooks
    print_status "Setting up Git hooks..."
    npx husky install
    
    cd ..
    print_success "Frontend setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting PostgreSQL with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_success "Database setup completed"
    else
        print_warning "Docker not available. Please set up PostgreSQL manually."
    fi
}

# Setup pre-commit hooks
setup_precommit() {
    print_status "Setting up pre-commit hooks..."
    
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        pre-commit install --hook-type commit-msg
        print_success "Pre-commit hooks installed"
    else
        print_warning "Pre-commit not available. Installing..."
        pip install pre-commit
        pre-commit install
        pre-commit install --hook-type commit-msg
        print_success "Pre-commit hooks installed"
    fi
}

# Generate SSL certificates for development
generate_ssl_certs() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        mkdir -p nginx/ssl
        
        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:2048 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        print_success "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Main setup function
main() {
    print_status "Starting RAG Explorer development setup..."
    
    # Check requirements
    check_requirements
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Setup database
    setup_database
    
    # Setup pre-commit hooks
    setup_precommit
    
    # Generate SSL certificates
    generate_ssl_certs
    
    print_success "🎉 Development environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env with your configuration"
    echo "2. Edit frontend/.env.local with your configuration"
    echo "3. Start the development servers:"
    echo "   - Backend: cd backend && poetry run uvicorn main:app --reload"
    echo "   - Frontend: cd frontend && npm run dev"
    echo "4. Or use Docker: docker-compose up"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"

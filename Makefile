.PHONY: help install setup dev build test clean docker-up docker-down docker-build docker-logs

# Default target
help:
	@echo "RAG Explorer - Development Commands"
	@echo "=================================="
	@echo ""
	@echo "Installation:"
	@echo "  install     Install all dependencies"
	@echo "  setup       Setup development environment"
	@echo ""
	@echo "Development:"
	@echo "  dev         Start development servers"
	@echo "  dev-backend Start backend development server"
	@echo "  dev-frontend Start frontend development server"
	@echo ""
	@echo "Building:"
	@echo "  build       Build production versions"
	@echo "  build-backend Build backend production version"
	@echo "  build-frontend Build frontend production version"
	@echo ""
	@echo "Testing:"
	@echo "  test        Run all tests"
	@echo "  test-backend Run backend tests"
	@echo "  test-frontend Run frontend tests"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   Start all Docker services"
	@echo "  docker-down Stop all Docker services"
	@echo "  docker-build Build Docker images"
	@echo "  docker-logs Show Docker logs"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        Run linting on all code"
	@echo "  format      Format all code"
	@echo "  type-check  Run type checking"
	@echo ""
	@echo "Database:"
	@echo "  db-migrate  Run database migrations"
	@echo "  db-reset    Reset database"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       Clean build artifacts"
	@echo "  logs        Show application logs"

# Installation
install:
	@echo "Installing dependencies..."
	cd backend && poetry install
	cd frontend && npm install

setup:
	@echo "Setting up development environment..."
	@if [ -f "scripts/setup-dev.sh" ]; then \
		chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh; \
	else \
		echo "Setup script not found. Please run manually:"; \
		echo "1. cd backend && poetry install"; \
		echo "2. cd frontend && npm install"; \
		echo "3. Copy env.example files and configure"; \
	fi

# Development
dev: docker-up
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Database: http://localhost:5432"
	@echo "Redis: http://localhost:6379"
	@echo ""
	@echo "Press Ctrl+C to stop all services"
	@docker-compose up

dev-backend:
	@echo "Starting backend development server..."
	cd backend && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Building
build: build-backend build-frontend

build-backend:
	@echo "Building backend..."
	cd backend && poetry build

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

# Testing
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && poetry run pytest

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm run test

# Docker
docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d postgres redis

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-logs:
	@echo "Showing Docker logs..."
	docker-compose logs -f

# Code Quality
lint:
	@echo "Running linting..."
	cd backend && poetry run flake8 app tests
	cd frontend && npm run lint

format:
	@echo "Formatting code..."
	cd backend && poetry run black app tests
	cd backend && poetry run isort app tests
	cd frontend && npm run format

type-check:
	@echo "Running type checks..."
	cd backend && poetry run mypy app
	cd frontend && npm run type-check

# Database
db-migrate:
	@echo "Running database migrations..."
	cd backend && poetry run alembic upgrade head

db-reset:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 10
	cd backend && poetry run alembic upgrade head

# Utilities
clean:
	@echo "Cleaning build artifacts..."
	cd backend && poetry run python -c "import shutil; shutil.rmtree('dist', ignore_errors=True); shutil.rmtree('build', ignore_errors=True)"
	cd frontend && rm -rf dist node_modules/.cache
	@echo "Cleanup completed"

logs:
	@echo "Showing application logs..."
	docker-compose logs -f backend frontend

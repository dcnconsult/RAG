@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting RAG Explorer Production Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "database" mkdir database

REM Set environment variables
set POSTGRES_PASSWORD=rag_password
set POSTGRES_USER=rag_user
set POSTGRES_DB=rag_db

echo 🔧 Environment variables set:
echo    POSTGRES_PASSWORD: %POSTGRES_PASSWORD%
echo    POSTGRES_USER: %POSTGRES_USER%
echo    POSTGRES_DB: %POSTGRES_DB%

REM Build and start the application
echo 🏗️  Building and starting RAG Explorer...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check health
echo 🏥 Checking service health...
docker-compose -f docker-compose.prod.yml ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Some services failed to start. Check logs:
    docker-compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
) else (
    echo ✅ RAG Explorer is running successfully!
    echo.
    echo 🌐 Access URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    PostgreSQL: localhost:5432
echo    Redis: localhost:6379
echo.
echo 📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo 🛑 To stop: docker-compose -f docker-compose.prod.yml down
echo.
echo 🔍 To check specific service logs:
echo    Backend: docker-compose -f docker-compose.prod.yml logs -f backend
echo    PostgreSQL: docker-compose -f docker-compose.prod.yml logs -f postgres
echo    Redis: docker-compose -f docker-compose.prod.yml logs -f redis
)

pause

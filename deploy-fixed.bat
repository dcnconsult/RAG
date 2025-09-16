@echo off
REM RAG Explorer Production Deployment Script for Windows
REM This script builds and deploys the RAG application in production mode

echo ========================================
echo RAG Explorer Production Deployment
echo ========================================
echo.

REM Check if Docker is running
echo Checking Docker status...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo Docker is running ✓
echo.

REM Check if we're in the right directory
if not exist "Dockerfile.prod" (
    echo ERROR: Dockerfile.prod not found.
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)
echo Project structure verified ✓
echo.

REM Clean up Docker resources to prevent build issues
echo Cleaning up Docker resources...
docker system prune -f >nul 2>&1
docker builder prune -f >nul 2>&1
echo Docker cleanup completed ✓
echo.

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down 2>nul
echo.

REM Remove any existing images to force rebuild
echo Removing existing images...
docker rmi rag-rag_app:latest 2>nul
docker rmi rag-rag_db:latest 2>nul
echo.

REM Build frontend first to ensure it's ready
echo Building frontend...
cd frontend
call npm run build:mvp
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    echo Please check the frontend build errors above.
    pause
    exit /b 1
)
cd ..
echo Frontend build completed ✓
echo.

REM Build and start the application with no cache
echo Building and starting RAG Explorer...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed!
    echo This might be due to:
    echo - Insufficient disk space
    echo - Docker daemon issues
    echo - Network connectivity problems
    echo.
    echo Try running: docker system prune -a
    echo Then run this script again.
    pause
    exit /b 1
)

echo Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Container startup failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.

REM Wait for services to start
echo Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check container status
echo Checking container status...
docker-compose ps

echo.
echo Application URLs:
echo - Frontend: http://localhost
echo - API: http://localhost:8000
echo - Database: localhost:5432
echo.

REM Test the application
echo Testing application...
timeout /t 5 /nobreak >nul
curl -s http://localhost/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Application is running successfully!
    echo ✓ Frontend: http://localhost
    echo ✓ API Health: http://localhost/api/v1/health
) else (
    echo ⚠ Application may still be starting up...
    echo Check http://localhost in your browser
    echo Check logs with: docker-compose logs -f
)

echo.
echo Useful commands:
echo - View logs: docker-compose logs -f
echo - Check status: docker-compose ps
echo - Stop application: docker-compose down
echo - Restart: docker-compose restart
echo.

echo Press any key to exit...
pause >nul

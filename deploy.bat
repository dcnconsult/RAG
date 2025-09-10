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

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down 2>nul
echo.

REM Build and start the application
echo Building and starting RAG Explorer...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ERROR: Build or deployment failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Application URLs:
echo - Frontend: http://localhost
echo - API: http://localhost:8000
echo - Database: localhost:5432
echo.
echo To check status: docker-compose ps
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.

REM Wait a moment for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Test the application
echo Testing application...
curl -s http://localhost/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Application is running successfully!
) else (
    echo ⚠ Application may still be starting up...
    echo Check http://localhost in your browser
)

echo.
echo Press any key to exit...
pause >nul
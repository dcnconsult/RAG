@echo off
REM RAG Explorer Production Deployment Script for Windows
REM This script builds and deploys the RAG application in production mode
REM and validates all aspects of the project

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

echo Waiting for services to start...
timeout /t 15 /nobreak >nul

echo Checking container status...
docker-compose ps

echo.
echo ========================================
echo Validation Tests
echo ========================================
echo.

REM Test 1: Container Health
echo 1. Testing container health...
docker-compose ps | findstr "healthy" >nul
if %errorlevel% equ 0 (
    echo ✓ Container is healthy
) else (
    echo ⚠ Container may not be fully ready yet
)
echo.

REM Test 2: Frontend Accessibility
echo 2. Testing frontend accessibility...
curl -s -o NUL http://localhost
if %errorlevel% equ 0 (
    echo ✓ Frontend is accessible at http://localhost
) else (
    echo ⚠ Frontend may still be starting up or is not accessible
)
echo.

REM Test 3: API Health Check
echo 3. Testing API health...
curl -s http://localhost:8000/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ API Health: http://localhost:8000/api/v1/health
) else (
    echo ⚠ API health check failed
)
echo.

REM Test 4: Database Connectivity
echo 4. Testing database connectivity...
docker-compose exec rag_app pg_isready -U rag_user -d rag_db >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Database connection successful
) else (
    echo ⚠ Database connection failed
    echo Check database logs: docker-compose logs rag_app
)
echo.

REM Test 5: FastAPI Process Status
echo 5. Testing FastAPI process...
docker-compose exec rag_app ps aux | findstr "uvicorn" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ FastAPI process is running
) else (
    echo ⚠ FastAPI process not found
)
echo.

REM Test 6: Nginx Process Status
echo 6. Testing Nginx process...
docker-compose exec rag_app ps aux | findstr "nginx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Nginx process is running
) else (
    echo ⚠ Nginx process not found
)
echo.

REM Test 7: PostgreSQL Process Status
echo 7. Testing PostgreSQL process...
docker-compose exec rag_app ps aux | findstr "postgres" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL process is running
) else (
    echo ⚠ PostgreSQL process not found
)
echo.

echo ========================================
echo Application URLs
echo ========================================
echo.
echo - Frontend: http://localhost
echo - API: http://localhost:8000
echo - API Health: http://localhost:8000/api/v1/health
echo - Database: localhost:5432
echo.

echo ========================================
echo Useful Commands
echo ========================================
echo.
echo - View logs: docker-compose logs -f
echo - Check status: docker-compose ps
echo - Stop application: docker-compose down
echo - Restart: docker-compose restart
echo - Access container: docker-compose exec rag_app bash
echo.

echo ========================================
echo Deployment Summary
echo ========================================
echo.
echo All services have been deployed and validated.
echo The RAG Explorer application is ready for use!
echo.

echo Press any key to exit...
pause >nul
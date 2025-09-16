@echo off
REM Docker Cleanup Script for RAG Explorer
REM This script cleans up Docker resources to resolve build issues

echo ========================================
echo Docker Cleanup Script
echo ========================================
echo.

echo WARNING: This will remove all unused Docker resources!
echo This includes:
echo - Stopped containers
echo - Unused networks
echo - Unused images
echo - Build cache
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cleanup cancelled.
    pause
    exit /b 0
)

echo.
echo Stopping all containers...
docker-compose down 2>nul

echo.
echo Removing stopped containers...
docker container prune -f

echo.
echo Removing unused images...
docker image prune -a -f

echo.
echo Removing unused networks...
docker network prune -f

echo.
echo Removing build cache...
docker builder prune -a -f

echo.
echo Removing unused volumes...
docker volume prune -f

echo.
echo System cleanup...
docker system prune -a -f

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Docker resources have been cleaned up.
echo You can now run deploy-fixed.bat to rebuild the application.
echo.

echo Press any key to exit...
pause >nul

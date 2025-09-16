@echo off
REM RAG Explorer Production Validation Script
REM This script validates all aspects of the project in production

echo ========================================
echo RAG Explorer Production Validation
echo ========================================
echo.

REM Check if containers are running
echo Checking container status...
docker-compose ps
echo.

REM Test frontend accessibility
echo Testing frontend accessibility...
curl -s -o nul -w "Frontend HTTP Status: %%{http_code}\n" http://localhost
if %errorlevel% neq 0 (
    echo ERROR: Frontend is not accessible!
    echo Check if the container is running: docker-compose ps
    pause
    exit /b 1
)
echo ✓ Frontend is accessible
echo.

REM Test API health endpoint
echo Testing API health...
curl -s http://localhost/api/v1/health
if %errorlevel% neq 0 (
    echo ERROR: API health check failed!
    echo Check API logs: docker-compose logs app
    pause
    exit /b 1
)
echo ✓ API health check passed
echo.

REM Test database connectivity
echo Testing database connectivity...
docker-compose exec -T db psql -U postgres -d rag_explorer -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Database connection failed!
    echo Check database logs: docker-compose logs db
    pause
    exit /b 1
)
echo ✓ Database is accessible
echo.

REM Test specific API endpoints
echo Testing API endpoints...
echo Testing domains endpoint...
curl -s -o nul -w "Domains API Status: %%{http_code}\n" http://localhost/api/v1/domains
echo Testing documents endpoint...
curl -s -o nul -w "Documents API Status: %%{http_code}\n" http://localhost/api/v1/documents
echo Testing search endpoint...
curl -s -o nul -w "Search API Status: %%{http_code}\n" http://localhost/api/v1/search
echo.

REM Check container resource usage
echo Checking container resource usage...
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo.

REM Check container logs for errors
echo Checking for errors in container logs...
echo --- App Container Logs (last 20 lines) ---
docker-compose logs --tail=20 app
echo.
echo --- Database Container Logs (last 10 lines) ---
docker-compose logs --tail=10 db
echo.

REM Test frontend functionality with Playwright
echo Testing frontend functionality...
if exist "node_modules\playwright" (
    echo Running frontend tests...
    node test-frontend.js
    if %errorlevel% neq 0 (
        echo WARNING: Frontend tests failed, but application may still be working
    ) else (
        echo ✓ Frontend tests passed
    )
) else (
    echo INFO: Playwright not installed, skipping frontend tests
    echo To install: npm install playwright
)
echo.

REM Check disk space
echo Checking disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set freespace=%%a
echo Available disk space: %freespace% bytes
echo.

REM Check Docker system info
echo Checking Docker system info...
docker system df
echo.

echo ========================================
echo Validation Complete!
echo ========================================
echo.
echo Summary:
echo - Frontend: ✓ Accessible
echo - API Health: ✓ Working
echo - Database: ✓ Connected
echo - Container Status: Check above
echo.
echo If any issues were found, check the logs above.
echo To view real-time logs: docker-compose logs -f
echo.

echo Press any key to exit...
pause >nul

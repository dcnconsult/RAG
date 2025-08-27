@echo off
REM RAG Explorer Development Setup Script for Windows
REM This script sets up the development environment for the RAG Explorer project

echo 🚀 Setting up RAG Explorer development environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is required but not installed
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is required but not installed
    pause
    exit /b 1
)

REM Check if Poetry is installed
poetry --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Poetry is not installed. Installing via pip...
    pip install poetry
)

REM Setup backend
echo [INFO] Setting up Python backend...
cd backend

echo [INFO] Installing Python dependencies...
poetry install

REM Create environment file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy env.example .env
    echo [WARNING] Please edit .env file with your configuration
)

cd ..

REM Setup frontend
echo [INFO] Setting up React frontend...
cd frontend

echo [INFO] Installing Node.js dependencies...
npm install

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo [INFO] Creating .env.local file from template...
    copy env.local.example .env.local
    echo [WARNING] Please edit .env.local file with your configuration
)

REM Setup Git hooks
echo [INFO] Setting up Git hooks...
npx husky install

cd ..

REM Setup database
echo [INFO] Setting up database...
docker-compose up -d postgres redis

REM Wait for database to be ready
echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Setup pre-commit hooks
echo [INFO] Setting up pre-commit hooks...
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg

echo [SUCCESS] 🎉 Development environment setup completed!
echo.
echo Next steps:
echo 1. Edit backend/.env with your configuration
echo 2. Edit frontend/.env.local with your configuration
echo 3. Start the development servers:
echo    - Backend: cd backend ^&^& poetry run uvicorn main:app --reload
echo    - Frontend: cd frontend ^&^& npm run dev
echo 4. Or use Docker: docker-compose up
echo.
echo Happy coding! 🚀
pause

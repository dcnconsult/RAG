@echo off
setlocal enabledelayedexpansion

REM Comprehensive Test Runner Script for RAG Frontend (Windows)
REM This script provides various testing options and configurations

REM Default values
set TEST_MODE=run
set COVERAGE=false
set WATCH=false
set UI=false
set VERBOSE=false
set DEBUG=false
set CI=false

REM Function to print usage
:print_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -m, --mode MODE       Test mode: run, watch, ui, coverage (default: run)
echo   -c, --coverage        Enable coverage reporting
echo   -w, --watch           Enable watch mode
echo   -u, --ui              Enable UI mode
echo   -v, --verbose         Enable verbose output
echo   -d, --debug           Enable debug mode
echo   --ci                  CI mode with coverage and verbose output
echo   -h, --help            Show this help message
echo.
echo Examples:
echo   %0                    # Run tests once
echo   %0 -w                 # Run tests in watch mode
echo   %0 -u                 # Run tests with UI
echo   %0 -c                 # Run tests with coverage
echo   %0 --ci               # CI mode
echo   %0 -m coverage -v     # Coverage mode with verbose output
goto :eof

REM Function to print header
:print_header
echo ================================
echo   RAG Frontend Test Runner
echo ================================
echo.
goto :eof

REM Function to print test info
:print_test_info
echo Test Configuration:
echo   Mode: %TEST_MODE%
echo   Coverage: %COVERAGE%
echo   Watch: %WATCH%
echo   UI: %UI%
echo   Verbose: %VERBOSE%
echo   Debug: %DEBUG%
echo   CI: %CI%
echo.
goto :eof

REM Function to check dependencies
:check_dependencies
echo Checking dependencies...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    exit /b 1
)

echo ✓ Dependencies check passed
echo.
goto :eof

REM Function to install dependencies if needed
:install_dependencies
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)
echo.
goto :eof

REM Function to run tests
:run_tests
echo Running tests...

set cmd=npm run

if "%TEST_MODE%"=="run" (
    if "%COVERAGE%"=="true" (
        set cmd=%cmd% test:coverage
    ) else (
        set cmd=%cmd% test:run
    )
) else if "%TEST_MODE%"=="watch" (
    set cmd=%cmd% test:watch
) else if "%TEST_MODE%"=="ui" (
    set cmd=%cmd% test:ui
) else if "%TEST_MODE%"=="coverage" (
    set cmd=%cmd% test:coverage
) else (
    echo Error: Invalid test mode: %TEST_MODE%
    exit /b 1
)

if "%VERBOSE%"=="true" (
    set cmd=%cmd% --reporter=verbose
)

if "%DEBUG%"=="true" (
    set cmd=%cmd% --inspect-brk --no-coverage
)

echo Executing: %cmd%
echo.

REM Execute the command
%cmd%
goto :eof

REM Function to run CI tests
:run_ci_tests
echo Running CI tests...
echo Executing: npm run test:ci
echo.

npm run test:ci
goto :eof

REM Function to show test results summary
:show_summary
echo.
echo ================================
echo   Test Run Complete
echo ================================

if "%COVERAGE%"=="true" (
    echo Coverage report generated in coverage/ directory
    echo Open coverage/index.html to view detailed coverage
)

if "%TEST_MODE%"=="ui" (
    echo UI mode: Tests are running in interactive mode
)

if "%WATCH%"=="true" (
    echo Watch mode: Tests will re-run on file changes
)

echo.
goto :eof

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :main
if "%~1"=="-m" (
    set TEST_MODE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--mode" (
    set TEST_MODE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-c" (
    set COVERAGE=true
    shift
    goto :parse_args
)
if "%~1"=="--coverage" (
    set COVERAGE=true
    shift
    goto :parse_args
)
if "%~1"=="-w" (
    set WATCH=true
    set TEST_MODE=watch
    shift
    goto :parse_args
)
if "%~1"=="--watch" (
    set WATCH=true
    set TEST_MODE=watch
    shift
    goto :parse_args
)
if "%~1"=="-u" (
    set UI=true
    set TEST_MODE=ui
    shift
    goto :parse_args
)
if "%~1"=="--ui" (
    set UI=true
    set TEST_MODE=ui
    shift
    goto :parse_args
)
if "%~1"=="-v" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if "%~1"=="-d" (
    set DEBUG=true
    shift
    goto :parse_args
)
if "%~1"=="--debug" (
    set DEBUG=true
    shift
    goto :parse_args
)
if "%~1"=="--ci" (
    set CI=true
    set TEST_MODE=run
    set COVERAGE=true
    set VERBOSE=true
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :print_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :print_usage
    exit /b 0
)
echo Error: Unknown option %~1
call :print_usage
exit /b 1

REM Main execution
:main
call :print_header
call :print_test_info

call :check_dependencies
if %errorlevel% neq 0 exit /b %errorlevel%

call :install_dependencies
if %errorlevel% neq 0 exit /b %errorlevel%

if "%CI%"=="true" (
    call :run_ci_tests
) else (
    call :run_tests
)

call :show_summary
exit /b 0

#!/bin/bash

# Comprehensive Test Runner Script for RAG Frontend
# This script provides various testing options and configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_MODE="run"
COVERAGE=false
WATCH=false
UI=false
VERBOSE=false
DEBUG=false
CI=false

# Function to print usage
print_usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE       Test mode: run, watch, ui, coverage (default: run)"
    echo "  -c, --coverage        Enable coverage reporting"
    echo "  -w, --watch           Enable watch mode"
    echo "  -u, --ui              Enable UI mode"
    echo "  -v, --verbose         Enable verbose output"
    echo "  -d, --debug           Enable debug mode"
    echo "  --ci                  CI mode with coverage and verbose output"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run tests once"
    echo "  $0 -w                 # Run tests in watch mode"
    echo "  $0 -u                 # Run tests with UI"
    echo "  $0 -c                 # Run tests with coverage"
    echo "  $0 --ci               # CI mode"
    echo "  $0 -m coverage -v     # Coverage mode with verbose output"
}

# Function to print header
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  RAG Frontend Test Runner${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to print test info
print_test_info() {
    echo -e "${YELLOW}Test Configuration:${NC}"
    echo "  Mode: $TEST_MODE"
    echo "  Coverage: $COVERAGE"
    echo "  Watch: $WATCH"
    echo "  UI: $UI"
    echo "  Verbose: $VERBOSE"
    echo "  Debug: $DEBUG"
    echo "  CI: $CI"
    echo ""
}

# Function to check dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Dependencies check passed${NC}"
    echo ""
}

# Function to install dependencies if needed
install_dependencies() {
    echo -e "${YELLOW}Checking if dependencies are installed...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✓ Dependencies already installed${NC}"
    fi
    echo ""
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    
    local cmd="npm run"
    
    case $TEST_MODE in
        "run")
            if [ "$COVERAGE" = true ]; then
                cmd="$cmd test:coverage"
            else
                cmd="$cmd test:run"
            fi
            ;;
        "watch")
            cmd="$cmd test:watch"
            ;;
        "ui")
            cmd="$cmd test:ui"
            ;;
        "coverage")
            cmd="$cmd test:coverage"
            ;;
        *)
            echo -e "${RED}Error: Invalid test mode: $TEST_MODE${NC}"
            exit 1
            ;;
    esac
    
    if [ "$VERBOSE" = true ]; then
        cmd="$cmd --reporter=verbose"
    fi
    
    if [ "$DEBUG" = true ]; then
        cmd="$cmd --inspect-brk --no-coverage"
    fi
    
    echo -e "${BLUE}Executing: $cmd${NC}"
    echo ""
    
    # Execute the command
    eval $cmd
}

# Function to run CI tests
run_ci_tests() {
    echo -e "${YELLOW}Running CI tests...${NC}"
    echo -e "${BLUE}Executing: npm run test:ci${NC}"
    echo ""
    
    npm run test:ci
}

# Function to show test results summary
show_summary() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Test Run Complete${NC}"
    echo -e "${BLUE}================================${NC}"
    
    if [ "$COVERAGE" = true ]; then
        echo -e "${YELLOW}Coverage report generated in coverage/ directory${NC}"
        echo -e "${YELLOW}Open coverage/index.html to view detailed coverage${NC}"
    fi
    
    if [ "$TEST_MODE" = "ui" ]; then
        echo -e "${YELLOW}UI mode: Tests are running in interactive mode${NC}"
    fi
    
    if [ "$WATCH" = true ]; then
        echo -e "${YELLOW}Watch mode: Tests will re-run on file changes${NC}"
    fi
    
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            TEST_MODE="$2"
            shift 2
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -w|--watch)
            WATCH=true
            TEST_MODE="watch"
            shift
            ;;
        -u|--ui)
            UI=true
            TEST_MODE="ui"
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        --ci)
            CI=true
            TEST_MODE="run"
            COVERAGE=true
            VERBOSE=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    print_test_info
    
    check_dependencies
    install_dependencies
    
    if [ "$CI" = true ]; then
        run_ci_tests
    else
        run_tests
    fi
    
    show_summary
}

# Run main function
main "$@"

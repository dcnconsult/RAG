#!/usr/bin/env python3
"""
Backend test runner script
"""

import subprocess
import sys
import os
from pathlib import Path


def run_tests(test_type: str = "all", coverage: bool = True, verbose: bool = False):
    """Run backend tests"""
    
    # Base pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add coverage if requested
    if coverage:
        cmd.extend(["--cov=app", "--cov-report=term-missing"])
    
    # Add verbosity if requested
    if verbose:
        cmd.append("-v")
    
    # Add test type filters
    if test_type == "unit":
        cmd.append("-m unit")
    elif test_type == "integration":
        cmd.append("-m integration")
    elif test_type == "api":
        cmd.append("-m api")
    elif test_type == "fast":
        cmd.extend(["-m", "not slow"])
    
    # Add test directory
    cmd.append("tests/")
    
    print(f"Running {test_type} tests...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, check=True)
        print("-" * 50)
        print("✅ All tests passed!")
        return True
    except subprocess.CalledProcessError as e:
        print("-" * 50)
        print(f"❌ Tests failed with exit code {e.returncode}")
        return False


def run_coverage_report():
    """Generate coverage report"""
    print("Generating coverage report...")
    
    try:
        subprocess.run(["python", "-m", "coverage", "html"], check=True)
        print("✅ Coverage report generated in htmlcov/")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to generate coverage report")
        return False


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run backend tests")
    parser.add_argument(
        "--type", 
        choices=["all", "unit", "integration", "api", "fast"],
        default="all",
        help="Type of tests to run"
    )
    parser.add_argument(
        "--no-coverage",
        action="store_true",
        help="Disable coverage reporting"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output"
    )
    parser.add_argument(
        "--coverage-only",
        action="store_true",
        help="Only generate coverage report"
    )
    
    args = parser.parse_args()
    
    if args.coverage_only:
        run_coverage_report()
        return
    
    success = run_tests(
        test_type=args.type,
        coverage=not args.no_coverage,
        verbose=args.verbose
    )
    
    if success:
        if not args.no_coverage:
            run_coverage_report()
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

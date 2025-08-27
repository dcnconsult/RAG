# E2E Testing with Playwright

This directory contains end-to-end tests for the RAG Explorer application using Playwright.

## Test Structure

- **`navigation.spec.ts`** - Tests for navigation functionality across all pages
- **`domain-management.spec.ts`** - Tests for domain CRUD operations
- **`document-management.spec.ts`** - Tests for document upload, processing, and management
- **`fixtures/`** - Test data files used in E2E tests

## Running E2E Tests

### Prerequisites
- Make sure the backend server is running
- Ensure the database is properly configured

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Show E2E test report
npm run test:e2e:report
```

## Test Configuration

The Playwright configuration is in `playwright.config.ts` and includes:

- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic dev server startup
- Screenshot and video capture on failure
- Trace collection for debugging

## Writing New Tests

1. Create a new `.spec.ts` file in this directory
2. Use the `test.describe()` and `test()` functions
3. Follow the existing test patterns
4. Add appropriate `data-testid` attributes to components
5. Use page objects for complex interactions

## Best Practices

- Use `data-testid` attributes for reliable element selection
- Keep tests independent and isolated
- Use meaningful test descriptions
- Handle async operations properly with `waitFor`
- Test both success and error scenarios
- Include accessibility testing where appropriate

## Debugging

- Use `test:e2e:debug` for step-by-step debugging
- Check the HTML report for detailed failure information
- Use `page.pause()` in tests for manual inspection
- Enable traces for detailed execution flow

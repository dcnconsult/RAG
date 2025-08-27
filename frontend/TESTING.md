# Testing Documentation

## Overview

This document provides comprehensive information about the testing framework used in the RAG Frontend application. The testing suite is built with **Vitest** and **React Testing Library**, providing a modern, fast, and reliable testing experience.

## Testing Stack

### Core Testing Framework
- **Vitest**: Fast unit test framework with native TypeScript support
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing browser APIs
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

### Testing Utilities
- **Custom Test Utils**: Enhanced render functions with providers
- **Mock Data Generators**: Helper functions for creating test data
- **Accessibility Testing**: Built-in accessibility testing support

## Project Structure

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.ts          # Test environment setup
│   │   └── utils.tsx         # Custom test utilities
│   ├── components/
│   │   └── __tests__/        # Component test files
│   ├── contexts/
│   │   └── __tests__/        # Context test files
│   └── hooks/
│       └── __tests__/        # Hook test files
├── vitest.config.ts          # Vitest configuration
├── scripts/
│   ├── run-tests.sh          # Unix/Linux test runner
│   └── run-tests.bat         # Windows test runner
└── TESTING.md                # This file
```

## Quick Start

### Running Tests

#### Basic Test Commands
```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

#### Using Test Runner Scripts
```bash
# Unix/Linux
./scripts/run-tests.sh

# Windows
scripts\run-tests.bat

# With options
./scripts/run-tests.sh -w -c -v  # Watch mode with coverage and verbose
./scripts/run-tests.sh --ci       # CI mode
```

### Test Runner Options

| Option | Description | Example |
|--------|-------------|---------|
| `-m, --mode` | Test mode (run, watch, ui, coverage) | `-m coverage` |
| `-c, --coverage` | Enable coverage reporting | `-c` |
| `-w, --watch` | Enable watch mode | `-w` |
| `-u, --ui` | Enable UI mode | `-u` |
| `-v, --verbose` | Enable verbose output | `-v` |
| `-d, --debug` | Enable debug mode | `-d` |
| `--ci` | CI mode with coverage and verbose | `--ci` |

## Writing Tests

### Test File Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/utils'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    render(<ComponentName />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument()
    })
  })
})
```

### Testing Patterns

#### Component Testing
```typescript
// Test component rendering
it('should render with default props', () => {
  render(<Component />)
  expect(screen.getByTestId('component')).toBeInTheDocument()
})

// Test prop variations
it('should render with custom props', () => {
  render(<Component variant="outlined" size="lg" />)
  expect(screen.getByTestId('component')).toHaveClass('outlined', 'lg')
})

// Test user interactions
it('should handle click events', () => {
  const handleClick = vi.fn()
  render(<Component onClick={handleClick} />)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'

it('should return initial state', () => {
  const { result } = renderHook(() => useCustomHook())
  expect(result.current.value).toBe('initial')
})

it('should update state', () => {
  const { result } = renderHook(() => useCustomHook())
  
  act(() => {
    result.current.updateValue('new value')
  })
  
  expect(result.current.value).toBe('new value')
})
```

#### Context Testing
```typescript
it('should provide context values', () => {
  render(
    <ContextProvider>
      <TestComponent />
    </ContextProvider>
  )
  
  expect(screen.getByText('Context Value')).toBeInTheDocument()
})
```

### Custom Test Utilities

#### Enhanced Render Function
```typescript
import { render } from '../test/utils'

// Render with default providers
render(<Component />)

// Render with custom route
render(<Component />, { route: '/custom-path' })

// Render with custom query client
const queryClient = new QueryClient()
render(<Component />, { queryClient })
```

#### Mock Data Generators
```typescript
import { createMockUser, createMockDocument } from '../test/utils'

const mockUser = createMockUser({ role: 'admin' })
const mockDocument = createMockDocument({ type: 'pdf' })
```

#### User Interaction Helpers
```typescript
import { simulateUserInteraction } from '../test/utils'

simulateUserInteraction.click(element)
simulateUserInteraction.type(inputElement, 'text')
simulateUserInteraction.focus(element)
```

## Testing Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Component Testing
- Test component behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText) over getByTestId
- Test accessibility features and keyboard navigation

### 3. Async Testing
- Use `waitFor` for asynchronous operations
- Mock timers when testing time-based functionality
- Handle loading states and error conditions

### 4. Mocking
- Mock external dependencies (APIs, libraries)
- Use `vi.fn()` for function mocks
- Mock browser APIs when necessary

### 5. Accessibility Testing
- Test keyboard navigation
- Verify ARIA attributes
- Test screen reader compatibility

## Coverage Requirements

The testing suite maintains a minimum coverage threshold of **80%** across:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
Coverage reports are generated in the `coverage/` directory:
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage.json`
- Console output during test runs

## Continuous Integration

### CI Pipeline
The testing suite is integrated into the CI/CD pipeline with:
- Automated test execution on every commit
- Coverage reporting and thresholds
- Test result reporting
- Failure notifications

### Pre-commit Hooks
Tests are automatically run before commits to ensure:
- All tests pass
- Coverage thresholds are met
- Code quality standards are maintained

## Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Watch Mode with Debug
```bash
npm run test:watch -- --inspect-brk
```

### Console Logging
```typescript
it('should debug test', () => {
  console.log('Debug information')
  // Test code here
})
```

### VS Code Integration
Add this to your VS Code settings for better test debugging:
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test:run"
}
```

## Performance Testing

### Test Execution Time
- Individual tests should complete within 100ms
- Test suites should complete within 30 seconds
- Use `vi.setConfig({ testTimeout: 5000 })` for slow tests

### Memory Management
- Clean up mocks and timers after each test
- Use `vi.clearAllMocks()` in `afterEach` blocks
- Avoid memory leaks in test setup

## Troubleshooting

### Common Issues

#### Test Environment Setup
```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
npm install

# Clear npm cache
npm cache clean --force
```

#### Mock Issues
```typescript
// Ensure mocks are properly reset
beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

// Check mock implementation
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)
```

#### Async Test Failures
```typescript
// Use proper async/await patterns
it('should handle async operations', async () => {
  const result = await asyncOperation()
  expect(result).toBe(expectedValue)
})

// Use waitFor for DOM updates
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### Getting Help
- Check the [Vitest documentation](https://vitest.dev/)
- Review [React Testing Library guides](https://testing-library.com/docs/react-testing-library/intro/)
- Check existing test files for examples
- Review test output and error messages

## Contributing to Tests

### Adding New Tests
1. Create test file in appropriate `__tests__` directory
2. Follow existing naming conventions
3. Ensure adequate coverage
4. Add test to relevant test suites

### Updating Tests
1. Update tests when component behavior changes
2. Maintain backward compatibility when possible
3. Update documentation for breaking changes
4. Ensure all tests pass after updates

### Test Review Process
1. All new tests must pass
2. Coverage thresholds must be maintained
3. Tests follow established patterns
4. Accessibility features are tested
5. Performance requirements are met

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Examples
- Check existing test files in the project
- Review test utilities in `src/test/`
- Examine test configuration in `vitest.config.ts`

### Community
- [Vitest Discord](https://discord.gg/vitest)
- [React Testing Library Discussions](https://github.com/testing-library/react-testing-library/discussions)
- [Testing Library Discord](https://discord.gg/DwNZmP3)

---

*This testing documentation is maintained by the development team. For questions or suggestions, please open an issue or contact the team.*

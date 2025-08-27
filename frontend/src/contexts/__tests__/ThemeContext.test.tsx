import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Test component to display theme state
const TestComponent = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark')
    // Default to system theme
    localStorageMock.getItem.mockReturnValue('system')
    
    // Mock matchMedia with proper implementation
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('should render with default system theme', () => {
    localStorageMock.getItem.mockReturnValue('system')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('should render with saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('should change theme when setTheme is called', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const lightButton = screen.getByText('Light')
    const darkButton = screen.getByText('Dark')

    fireEvent.click(lightButton)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

    fireEvent.click(darkButton)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('should persist theme preference in localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByText('Dark')
    fireEvent.click(darkButton)

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should detect system dark mode preference', async () => {
    // Mock system prefers dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for system theme detection
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    })
  })

  it('should detect system light mode preference', async () => {
    // Mock system prefers light mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for system theme detection
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    })
  })

  it('should apply theme classes to document element', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByText('Dark')
    fireEvent.click(darkButton)

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('light')
  })

  it('should handle invalid theme values gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should fallback to system theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('should update resolved theme when system preference changes', async () => {
    // Start with system theme
    localStorageMock.getItem.mockReturnValue('system')
    
    // Mock system prefers dark mode initially
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should start with dark theme (system preference)
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    })

    // Now change system preference to light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Trigger the change event manually
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.dispatchEvent(new Event('change'))

    // Should update to light theme
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { ThemeProvider, useTheme } from '../ThemeContext'
import { act } from 'react'

// Test component to access theme context
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
    // Clear localStorage before each test
    localStorage.clear()
    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
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
    vi.clearAllMocks()
  })

  it('should render with default system theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('should render with saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    
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

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    const lightButton = screen.getByText('Light')
    fireEvent.click(lightButton)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('should handle invalid theme values gracefully', () => {
    localStorage.setItem('theme', 'invalid-theme')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should fall back to system theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('should update resolved theme when system preference changes', async () => {
    let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = []
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            mediaQueryListeners.push(listener)
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Initially dark
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    })

    // Simulate system preference change to light
    act(() => {
      mediaQueryListeners.forEach(listener => {
        listener({
          matches: false,
          media: '(prefers-color-scheme: dark)',
        } as MediaQueryListEvent)
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    })
  })
})

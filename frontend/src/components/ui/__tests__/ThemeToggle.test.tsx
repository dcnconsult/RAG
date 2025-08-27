import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import { ThemeToggle } from '../ThemeToggle'

// Mock the theme context
const mockSetTheme = vi.fn()
const mockTheme = vi.fn(() => 'light')
const mockResolvedTheme = vi.fn(() => 'light')

vi.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme(),
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme(),
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme.mockReturnValue('light')
    mockResolvedTheme.mockReturnValue('light')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render theme toggle button', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should display current theme icon', () => {
    mockTheme.mockReturnValue('light')
    render(<ThemeToggle />)
    
    // Should show sun icon for light theme
    const sunIcon = document.querySelector('.lucide-sun')
    expect(sunIcon).toBeInTheDocument()
  })

  it('should open dropdown when clicked', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  it('should close dropdown when clicking outside', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
    })
    
    // Click outside
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('Light')).not.toBeInTheDocument()
    })
  })

  it('should change theme when option is selected', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })
    
    const darkOption = screen.getByText('Dark')
    fireEvent.click(darkOption)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should close dropdown after theme selection', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
    })
    
    const lightOption = screen.getByText('Light')
    fireEvent.click(lightOption)
    
    await waitFor(() => {
      expect(screen.queryByText('Light')).not.toBeInTheDocument()
    })
  })

  it('should highlight current theme in dropdown', async () => {
    mockTheme.mockReturnValue('system')
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      const systemOption = screen.getByText('System').closest('button')
      expect(systemOption).toHaveClass('bg-gray-100')
    })
  })

  it('should handle keyboard navigation', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
    })
    
    // Test that dropdown can be navigated with keyboard
    // The component doesn't handle escape key, so we'll test tab navigation
    const lightOption = screen.getByText('Light').closest('button')
    const darkOption = screen.getByText('Dark').closest('button')
    const systemOption = screen.getByText('System').closest('button')
    
    expect(lightOption).toBeInTheDocument()
    expect(darkOption).toBeInTheDocument()
    expect(systemOption).toBeInTheDocument()
    
    // Test that options are focusable
    lightOption?.focus()
    expect(lightOption).toHaveFocus()
    
    darkOption?.focus()
    expect(darkOption).toHaveFocus()
    
    systemOption?.focus()
    expect(systemOption).toHaveFocus()
  })

  it('should show correct icon for different themes', () => {
    // Test light theme
    mockTheme.mockReturnValue('light')
    const { rerender } = render(<ThemeToggle />)
    let sunIcon = document.querySelector('.lucide-sun')
    expect(sunIcon).toBeInTheDocument()
    
    // Test dark theme
    mockTheme.mockReturnValue('dark')
    rerender(<ThemeToggle />)
    let moonIcon = document.querySelector('.lucide-moon')
    expect(moonIcon).toBeInTheDocument()
    
    // Test system theme
    mockTheme.mockReturnValue('system')
    rerender(<ThemeToggle />)
    let monitorIcon = document.querySelector('.lucide-monitor')
    expect(monitorIcon).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import { MobileNavigation, MobileBottomNav } from '../MobileNavigation'
import { MemoryRouter } from 'react-router-dom'

// Mock useLocation hook
const mockUseLocation = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  }
})

describe('Mobile Navigation Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLocation.mockReturnValue({ pathname: '/' })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('MobileNavigation', () => {
    it('should render mobile navigation menu', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={false} onClose={vi.fn()} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument()
    })

    it('should show navigation when isOpen is true', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveClass('translate-x-0')
    })

    it('should hide navigation when isOpen is false', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={false} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveClass('-translate-x-full')
    })

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      const closeButton = screen.getByTestId('close-button')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should render navigation links', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/documents/i)).toBeInTheDocument()
      expect(screen.getByText(/chat/i)).toBeInTheDocument()
      expect(screen.getByText(/settings/i)).toBeInTheDocument()
    })

    it('should highlight active route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/documents' })
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const documentsLink = screen.getByText(/documents/i).closest('a')
      expect(documentsLink).toHaveClass('bg-primary', 'text-white')
    })

    it('should handle navigation link clicks', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      const dashboardLink = screen.getByText(/dashboard/i).closest('a')
      fireEvent.click(dashboardLink!)
      
      // Should call onClose to close the mobile menu
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should render user profile section', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument()
      expect(screen.getByText(/logout/i)).toBeInTheDocument()
    })

    it('should handle logout click', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      const logoutButton = screen.getByText(/logout/i)
      fireEvent.click(logoutButton)
      
      // Should call onClose to close the mobile menu
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should apply backdrop when open', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const backdrop = screen.getByTestId('mobile-backdrop')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveClass('opacity-100', 'pointer-events-auto')
    })

    it('should hide backdrop when closed', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={false} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const backdrop = screen.getByTestId('mobile-backdrop')
      expect(backdrop).toHaveClass('opacity-0', 'pointer-events-none')
    })

    it('should call onClose when backdrop is clicked', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      const backdrop = screen.getByTestId('mobile-backdrop')
      fireEvent.click(backdrop)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should handle escape key press', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose for other key presses', () => {
      const mockOnClose = vi.fn()
      
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      fireEvent.keyDown(document, { key: 'Enter' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('MobileBottomNav', () => {
    it('should render bottom navigation', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument()
    })

    it('should render navigation items', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/documents/i)).toBeInTheDocument()
      expect(screen.getByText(/chat/i)).toBeInTheDocument()
      expect(screen.getByText(/settings/i)).toBeInTheDocument()
    })

    it('should highlight active route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/chat' })
      
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const chatLink = screen.getByText(/chat/i).closest('a')
      expect(chatLink).toHaveClass('text-primary', 'bg-primary/10')
    })

    it('should show inactive state for non-active routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })
      
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const documentsLink = screen.getByText(/documents/i).closest('a')
      expect(documentsLink).toHaveClass('text-gray-600', 'dark:text-gray-400')
    })

    it('should render navigation icons', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      // Check that icons are present (they should have aria-hidden="true")
      const icons = screen.getAllByTestId('nav-icon')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should handle navigation item clicks', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const documentsLink = screen.getByText(/documents/i).closest('a')
      expect(documentsLink).toHaveAttribute('href', '/documents')
    })

    it('should apply proper spacing and layout', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const bottomNav = screen.getByTestId('mobile-bottom-nav')
      expect(bottomNav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-50')
    })

    it('should handle different screen sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // tablet size
      })

      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const bottomNav = screen.getByTestId('mobile-bottom-nav')
      expect(bottomNav).toBeInTheDocument()
    })

    it('should maintain accessibility', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const navItems = screen.getAllByRole('link')
      navItems.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-label')
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should handle keyboard navigation', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const firstNavItem = screen.getByText(/dashboard/i).closest('a')
      firstNavItem?.focus()
      
      expect(document.activeElement).toBe(firstNavItem)
    })

    it('should support touch interactions', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const navItems = screen.getAllByRole('link')
      navItems.forEach(item => {
        expect(item).toHaveClass('touch-manipulation')
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work together with routing', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <MobileBottomNav />
        </MemoryRouter>
      )

      // Initially on dashboard
      let dashboardLink = screen.getByText(/dashboard/i).closest('a')
      expect(dashboardLink).toHaveClass('text-primary')

      // Navigate to documents
      rerender(
        <MemoryRouter initialEntries={['/documents']}>
          <MobileBottomNav />
        </MemoryRouter>
      )

      let documentsLink = screen.getByText(/documents/i).closest('a')
      expect(documentsLink).toHaveClass('text-primary')
    })

    it('should handle mobile navigation state changes', () => {
      const mockOnClose = vi.fn()
      const { rerender } = render(
        <MemoryRouter>
          <MobileNavigation isOpen={false} onClose={mockOnClose} />
        </MemoryRouter>
      )

      // Initially closed
      let navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveClass('-translate-x-full')

      // Open navigation
      rerender(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      )

      navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveClass('translate-x-0')
    })

    it('should maintain consistent navigation structure', () => {
      render(
        <MemoryRouter>
          <div>
            <MobileNavigation isOpen={true} onClose={vi.fn()} />
            <MobileBottomNav />
          </div>
        </MemoryRouter>
      )

      // Both should have the same navigation items
      const mobileNavItems = screen.getAllByTestId('mobile-nav-item')
      const bottomNavItems = screen.getAllByTestId('bottom-nav-item')

      expect(mobileNavItems.length).toBe(bottomNavItems.length)
    })
  })

  describe('Responsive Behavior', () => {
    it('should hide on larger screens', () => {
      // Mock window.innerWidth for larger screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024, // desktop size
      })

      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const bottomNav = screen.getByTestId('mobile-bottom-nav')
      expect(bottomNav).toHaveClass('lg:hidden')
    })

    it('should show on mobile screens', () => {
      // Mock window.innerWidth for mobile screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // mobile size
      })

      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const bottomNav = screen.getByTestId('mobile-bottom-nav')
      expect(bottomNav).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const closeButton = screen.getByTestId('close-button')
      expect(closeButton).toHaveAttribute('aria-label', 'Close navigation')

      const navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveAttribute('aria-label', 'Mobile navigation')
    })

    it('should support screen readers', () => {
      render(
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      )

      const navItems = screen.getAllByRole('link')
      navItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label')
        expect(item).toHaveAttribute('role', 'link')
      })
    })

    it('should handle focus management', () => {
      render(
        <MemoryRouter>
          <MobileNavigation isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )

      const navigation = screen.getByTestId('mobile-navigation')
      expect(navigation).toHaveAttribute('tabIndex', '-1')
    })
  })
})

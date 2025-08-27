import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { Badge } from '../Badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>)
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<Badge className="custom-badge">Custom Badge</Badge>)
      const badge = screen.getByText('Custom Badge')
      expect(badge).toHaveClass('custom-badge')
    })

    it('renders without children', () => {
      render(<Badge>{null}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
    })

    it('renders with empty string children', () => {
      render(<Badge>{''}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(<Badge variant="primary">Primary Badge</Badge>)
      const badge = screen.getByText('Primary Badge')
      expect(badge).toHaveClass('bg-primary-100', 'text-primary-800')
    })

    it('renders secondary variant by default', () => {
      render(<Badge>Secondary Badge</Badge>)
      const badge = screen.getByText('Secondary Badge')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('renders success variant', () => {
      render(<Badge variant="success">Success Badge</Badge>)
      const badge = screen.getByText('Success Badge')
      expect(badge).toHaveClass('bg-success-100', 'text-success-800')
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning Badge</Badge>)
      const badge = screen.getByText('Warning Badge')
      expect(badge).toHaveClass('bg-warning-100', 'text-warning-800')
    })

    it('renders error variant', () => {
      render(<Badge variant="error">Error Badge</Badge>)
      const badge = screen.getByText('Error Badge')
      expect(badge).toHaveClass('bg-error-100', 'text-error-800')
    })

    it('renders accent variant', () => {
      render(<Badge variant="accent">Accent Badge</Badge>)
      const badge = screen.getByText('Accent Badge')
      expect(badge).toHaveClass('bg-accent-100', 'text-accent-800')
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm">Small Badge</Badge>)
      const badge = screen.getByText('Small Badge')
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
    })

    it('renders medium size by default', () => {
      render(<Badge>Medium Badge</Badge>)
      const badge = screen.getByText('Medium Badge')
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs')
    })

    it('renders large size', () => {
      render(<Badge size="lg">Large Badge</Badge>)
      const badge = screen.getByText('Large Badge')
      expect(badge).toHaveClass('px-3', 'py-1', 'text-sm')
    })
  })

  describe('Base Classes', () => {
    it('applies base classes to all badges', () => {
      render(<Badge>Base Classes Badge</Badge>)
      const badge = screen.getByText('Base Classes Badge')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium')
    })

    it('maintains base classes with custom variants and sizes', () => {
      render(
        <Badge variant="primary" size="lg" className="custom-class">
          Custom Badge
        </Badge>
      )
      const badge = screen.getByText('Custom Badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center', 
        'rounded-full',
        'font-medium',
        'bg-primary-100',
        'text-primary-800',
        'px-3',
        'py-1',
        'text-sm',
        'custom-class'
      )
    })
  })

  describe('Combinations', () => {
    it('combines primary variant with small size', () => {
      render(
        <Badge variant="primary" size="sm">
          Primary Small Badge
        </Badge>
      )
      const badge = screen.getByText('Primary Small Badge')
      expect(badge).toHaveClass(
        'bg-primary-100',
        'text-primary-800',
        'px-2',
        'py-0.5',
        'text-xs'
      )
    })

    it('combines success variant with large size', () => {
      render(
        <Badge variant="success" size="lg">
          Success Large Badge
        </Badge>
      )
      const badge = screen.getByText('Success Large Badge')
      expect(badge).toHaveClass(
        'bg-success-100',
        'text-success-800',
        'px-3',
        'py-1',
        'text-sm'
      )
    })

    it('combines warning variant with medium size', () => {
      render(
        <Badge variant="warning" size="md">
          Warning Medium Badge
        </Badge>
      )
      const badge = screen.getByText('Warning Medium Badge')
      expect(badge).toHaveClass(
        'bg-warning-100',
        'text-warning-800',
        'px-2.5',
        'py-0.5',
        'text-xs'
      )
    })
  })

  describe('Accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Badge ref={ref}>Ref Badge</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards additional props', () => {
      render(
        <Badge 
          data-testid="test-badge"
          aria-label="Test badge"
          role="status"
          title="Badge tooltip"
        >
          Props Badge
        </Badge>
      )
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('aria-label', 'Test badge')
      expect(badge).toHaveAttribute('role', 'status')
      expect(badge).toHaveAttribute('title', 'Badge tooltip')
    })

    it('maintains semantic structure', () => {
      render(<Badge role="status">Status Badge</Badge>)
      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Badge>Simple text</Badge>)
      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('renders number content', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders HTML content', () => {
      render(
        <Badge>
          <strong>Bold text</strong>
        </Badge>
      )
      expect(screen.getByText('Bold text')).toBeInTheDocument()
      expect(screen.getByText('Bold text').tagName).toBe('STRONG')
    })

    it('renders complex nested content', () => {
      render(
        <Badge>
          <span>Count: </span>
          <strong>5</strong>
          <span> items</span>
        </Badge>
      )
      expect(screen.getByText('Count:', { exact: false })).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('items', { exact: false })).toBeInTheDocument()
    })
  })

  describe('Styling Consistency', () => {
    it('maintains consistent styling across variants', () => {
      const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'accent']
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Badge variant={variant as any}>Test Badge</Badge>
        )
        const badge = screen.getByText('Test Badge')
        
        // All variants should have base classes
        expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium')
        
        // All variants should have size classes
        expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs')
        
        unmount()
      })
    })

    it('maintains consistent styling across sizes', () => {
      const sizes = ['sm', 'md', 'lg']
      
      sizes.forEach(size => {
        const { unmount } = render(
          <Badge size={size as any}>Test Badge</Badge>
        )
        const badge = screen.getByText('Test Badge')
        
        // All sizes should have base classes
        expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium')
        
        // All sizes should have variant classes
        expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
        
        unmount()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles null children', () => {
      render(<Badge>{null}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Badge>{undefined}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
    })

    it('handles boolean children', () => {
      render(<Badge>{true}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
      // Boolean values don't render as text in React, so just check the badge exists
    })

    it('handles zero as children', () => {
      render(<Badge>{0}</Badge>)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles empty array children', () => {
      render(<Badge>{[]}</Badge>)
      const badge = document.querySelector('.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
    })

    it('handles function children', () => {
      const TestComponent = () => <span data-testid="function-child">Function Child</span>
      render(<Badge><TestComponent /></Badge>)
      expect(screen.getByTestId('function-child')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders multiple badges efficiently', () => {
      const badges = Array.from({ length: 100 }, (_, i) => `Badge ${i}`)
      
      render(
        <div>
          {badges.map((text, index) => (
            <Badge key={index} variant="primary">
              {text}
            </Badge>
          ))}
        </div>
      )
      
      badges.forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument()
      })
    })

    it('handles rapid prop changes', () => {
      const { rerender } = render(<Badge variant="primary">Test</Badge>)
      
      // Rapidly change variants
      rerender(<Badge variant="secondary">Test</Badge>)
      rerender(<Badge variant="success">Test</Badge>)
      rerender(<Badge variant="warning">Test</Badge>)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('bg-warning-100', 'text-warning-800')
    })
  })
})

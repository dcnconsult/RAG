import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import { Button } from '../Button'
import { Loader2, Plus, ArrowRight } from 'lucide-react'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary-600')
      expect(button).toHaveClass('px-4 py-2')
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>)
      const button = screen.getByRole('button', { name: 'Custom Button' })
      expect(button).toHaveClass('custom-class')
    })

    it('renders with fullWidth prop', () => {
      render(<Button fullWidth>Full Width Button</Button>)
      const button = screen.getByRole('button', { name: 'Full Width Button' })
      expect(button).toHaveClass('w-full')
    })
  })

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary Button</Button>)
      const button = screen.getByRole('button', { name: 'Primary Button' })
      expect(button).toHaveClass('bg-primary-600', 'text-white')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary Button</Button>)
      const button = screen.getByRole('button', { name: 'Secondary Button' })
      expect(button).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300')
    })

    it('renders accent variant', () => {
      render(<Button variant="accent">Accent Button</Button>)
      const button = screen.getByRole('button', { name: 'Accent Button' })
      expect(button).toHaveClass('bg-accent-600', 'text-white')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost Button</Button>)
      const button = screen.getByRole('button', { name: 'Ghost Button' })
      expect(button).toHaveClass('text-gray-700', 'hover:bg-gray-100')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger Button</Button>)
      const button = screen.getByRole('button', { name: 'Danger Button' })
      expect(button).toHaveClass('bg-error-600', 'text-white')
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>)
      const button = screen.getByRole('button', { name: 'Outline Button' })
      expect(button).toHaveClass('bg-transparent', 'text-primary-600', 'border', 'border-primary-600')
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small Button</Button>)
      const button = screen.getByRole('button', { name: 'Small Button' })
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs', 'rounded-md')
    })

    it('renders medium size by default', () => {
      render(<Button>Medium Button</Button>)
      const button = screen.getByRole('button', { name: 'Medium Button' })
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'rounded-lg')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large Button</Button>)
      const button = screen.getByRole('button', { name: 'Large Button' })
      expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'rounded-lg')
    })

    it('renders extra large size', () => {
      render(<Button size="xl">XL Button</Button>)
      const button = screen.getByRole('button', { name: 'XL Button' })
      expect(button).toHaveClass('px-8', 'py-4', 'text-lg', 'rounded-xl')
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button', { name: 'Loading Button' })
      const spinner = button.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('disables button when loading is true', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button', { name: 'Loading Button' })
      expect(button).toBeDisabled()
    })

    it('hides left icon when loading', () => {
      render(
        <Button loading leftIcon={<Plus />}>
          Loading Button
        </Button>
      )
      const button = screen.getByRole('button', { name: 'Loading Button' })
      const leftIcon = button.querySelector('[class*="mr-2"]')
      expect(leftIcon).not.toBeInTheDocument()
    })

    it('hides right icon when loading', () => {
      render(
        <Button loading rightIcon={<ArrowRight />}>
          Loading Button
        </Button>
      )
      const button = screen.getByRole('button', { name: 'Loading Button' })
      const rightIcon = button.querySelector('[class*="ml-2"]')
      expect(rightIcon).not.toBeInTheDocument()
    })

    it('adjusts spinner size based on button size', () => {
      render(<Button loading size="sm">Small Loading</Button>)
      const button = screen.getByRole('button', { name: 'Small Loading' })
      const spinner = button.querySelector('svg')
      expect(spinner).toHaveClass('w-3', 'h-3')
    })
  })

  describe('Icons', () => {
    it('renders left icon when provided', () => {
      render(
        <Button leftIcon={<Plus data-testid="left-icon" />}>
          Button with Left Icon
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon when provided', () => {
      render(
        <Button rightIcon={<ArrowRight data-testid="right-icon" />}>
          Button with Right Icon
        </Button>
      )
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders both left and right icons', () => {
      render(
        <Button 
          leftIcon={<Plus data-testid="left-icon" />}
          rightIcon={<ArrowRight data-testid="right-icon" />}
        >
          Button with Both Icons
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('adjusts icon size based on button size', () => {
      render(
        <Button size="lg" leftIcon={<Plus data-testid="left-icon" />}>
          Large Button
        </Button>
      )
      const leftIcon = screen.getByTestId('left-icon')
      expect(leftIcon.parentElement).toHaveClass('w-5', 'h-5')
    })
  })

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: 'Disabled Button' })
      expect(button).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: 'Disabled Button' })
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      const button = screen.getByRole('button', { name: 'Clickable Button' })
      
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: 'Disabled Button' })
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<Button loading onClick={handleClick}>Loading Button</Button>)
      const button = screen.getByRole('button', { name: 'Loading Button' })
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref).toHaveBeenCalled()
    })

    it('forwards additional props', () => {
      render(
        <Button 
          data-testid="custom-button"
          aria-label="Custom aria label"
          type="submit"
        >
          Custom Button
        </Button>
      )
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom aria label')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('has proper focus styles', () => {
      render(<Button>Focusable Button</Button>)
      const button = screen.getByRole('button', { name: 'Focusable Button' })
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
    })
  })

  describe('Edge Cases', () => {
    it('renders without children', () => {
      render(<Button />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles empty string children', () => {
      render(<Button>{''}</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('combines multiple variants and sizes correctly', () => {
      render(
        <Button 
          variant="danger" 
          size="lg" 
          fullWidth 
          className="extra-class"
        >
          Complex Button
        </Button>
      )
      const button = screen.getByRole('button', { name: 'Complex Button' })
      expect(button).toHaveClass('bg-error-600', 'px-6', 'py-3', 'w-full', 'extra-class')
    })
  })
})

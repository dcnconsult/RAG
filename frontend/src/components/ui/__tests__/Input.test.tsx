import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import { Input } from '../Input'
import { Search, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders with label', () => {
      render(<Input label="Email Address" placeholder="Enter email" />)
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Input className="custom-input" placeholder="Custom input" />)
      const input = screen.getByPlaceholderText('Custom input')
      expect(input).toHaveClass('custom-input')
    })

    it('renders with fullWidth prop', () => {
      render(<Input fullWidth placeholder="Full width input" />)
      const container = screen.getByPlaceholderText('Full width input').closest('.space-y-2')
      expect(container).toHaveClass('w-full')
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input placeholder="Text input" />)
      const input = screen.getByPlaceholderText('Text input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders email input', () => {
      render(<Input type="email" placeholder="Email input" />)
      const input = screen.getByPlaceholderText('Email input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" placeholder="Password input" />)
      const input = screen.getByPlaceholderText('Password input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" placeholder="Number input" />)
      const input = screen.getByPlaceholderText('Number input')
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} placeholder="With left icon" />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('With left icon')
      expect(input).toHaveClass('pl-10')
    })

    it('renders right icon', () => {
      render(<Input rightIcon={<Mail data-testid="right-icon" />} placeholder="With right icon" />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('With right icon')
      expect(input).toHaveClass('pr-10')
    })

    it('renders both left and right icons', () => {
      render(
        <Input 
          leftIcon={<Search data-testid="left-icon" />}
          rightIcon={<Mail data-testid="right-icon" />}
          placeholder="With both icons"
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('With both icons')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })

    it('adjusts padding when icons are present', () => {
      render(<Input placeholder="No icons" />)
      const input = screen.getByPlaceholderText('No icons')
      expect(input).toHaveClass('pl-3', 'pr-3')
    })
  })

  describe('Password Toggle', () => {
    it('shows password toggle button for password type', () => {
      render(<Input type="password" showPasswordToggle placeholder="Password" />)
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
    })

    it('toggles password visibility when clicked', async () => {
      render(<Input type="password" showPasswordToggle placeholder="Password" />)
      const input = screen.getByPlaceholderText('Password')
      const toggleButton = screen.getByRole('button')
      
      // Initially password type
      expect(input).toHaveAttribute('type', 'password')
      
      // Click to show password
      fireEvent.click(toggleButton)
      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'text')
      })
      
      // Click to hide password
      fireEvent.click(toggleButton)
      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })

    it('shows eye icon when password is hidden', () => {
      render(<Input type="password" showPasswordToggle placeholder="Password" />)
      const eyeIcon = screen.getByTestId('eye-icon')
      expect(eyeIcon).toBeInTheDocument()
    })

    it('shows eye-off icon when password is visible', async () => {
      render(<Input type="password" showPasswordToggle placeholder="Password" />)
      const toggleButton = screen.getByRole('button')
      
      fireEvent.click(toggleButton)
      await waitFor(() => {
        const eyeOffIcon = screen.getByTestId('eye-off-icon')
        expect(eyeOffIcon).toBeInTheDocument()
      })
    })

    it('does not show password toggle for non-password types', () => {
      render(<Input type="text" showPasswordToggle placeholder="Text input" />)
      const toggleButton = screen.queryByRole('button')
      expect(toggleButton).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('renders error message', () => {
      render(<Input error="This field is required" placeholder="Error input" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByText('This field is required')).toHaveClass('text-error-600')
    })

    it('shows error icon', () => {
      render(<Input error="Error message" placeholder="Error input" />)
      const errorIcon = screen.getByTestId('alert-circle-icon')
      expect(errorIcon).toBeInTheDocument()
    })

    it('applies error styles to input', () => {
      render(<Input error="Error message" placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveClass('border-error-300', 'focus:border-error-500', 'focus:ring-error-500')
    })

    it('prioritizes error over success', () => {
      render(
        <Input 
          error="Error message" 
          success="Success message" 
          placeholder="Error priority"
        />
      )
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('renders success message', () => {
      render(<Input success="Field is valid" placeholder="Success input" />)
      expect(screen.getByText('Field is valid')).toBeInTheDocument()
      expect(screen.getByText('Field is valid')).toHaveClass('text-success-600')
    })

    it('shows success icon', () => {
      render(<Input success="Success message" placeholder="Success input" />)
      const successIcon = screen.getByTestId('check-circle-icon')
      expect(successIcon).toBeInTheDocument()
    })

    it('applies success styles to input', () => {
      render(<Input success="Success message" placeholder="Success input" />)
      const input = screen.getByPlaceholderText('Success input')
      expect(input).toHaveClass('border-success-300', 'focus:border-success-500', 'focus:ring-success-500')
    })

    it('does not show success when error is present', () => {
      render(
        <Input 
          error="Error message" 
          success="Success message" 
          placeholder="Error priority"
        />
      )
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })
  })

  describe('Helper Text', () => {
    it('renders helper text', () => {
      render(<Input helperText="This field is optional" placeholder="With helper" />)
      expect(screen.getByText('This field is optional')).toBeInTheDocument()
      expect(screen.getByText('This field is optional')).toHaveClass('text-gray-500')
    })

    it('does not show helper text when error is present', () => {
      render(
        <Input 
          error="Error message" 
          helperText="Helper text" 
          placeholder="Error priority"
        />
      )
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })

    it('does not show helper text when success is present', () => {
      render(
        <Input 
          success="Success message" 
          helperText="Helper text" 
          placeholder="Success priority"
        />
      )
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles input changes', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} placeholder="Changeable input" />)
      const input = screen.getByPlaceholderText('Changeable input')
      
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('handles focus events', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} placeholder="Focusable input" />)
      const input = screen.getByPlaceholderText('Focusable input')
      
      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('handles blur events', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} placeholder="Blur input" />)
      const input = screen.getByPlaceholderText('Blur input')
      
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Email" id="email-input" placeholder="Enter email" />)
      const label = screen.getByText('Email')
      const input = screen.getByPlaceholderText('Enter email')
      
      expect(label).toHaveAttribute('for', 'email-input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('generates unique ID when not provided', () => {
      render(<Input label="Auto ID" placeholder="Auto ID input" />)
      const label = screen.getByText('Auto ID')
      const input = screen.getByPlaceholderText('Auto ID input')
      
      const labelFor = label.getAttribute('for')
      const inputId = input.getAttribute('id')
      
      expect(labelFor).toBe(inputId)
      expect(labelFor).toMatch(/^input-[a-z0-9]+$/)
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Input ref={ref} placeholder="Ref input" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('forwards additional props', () => {
      render(
        <Input 
          data-testid="custom-input"
          aria-label="Custom aria label"
          required
          minLength={5}
          maxLength={50}
          placeholder="Custom props"
        />
      )
      const input = screen.getByTestId('custom-input')
      expect(input).toHaveAttribute('aria-label', 'Custom aria label')
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('minLength', '5')
      expect(input).toHaveAttribute('maxLength', '50')
    })
  })

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  describe('Focus Styles', () => {
    it('has proper focus styles', () => {
      render(<Input placeholder="Focusable input" />)
      const input = screen.getByPlaceholderText('Focusable input')
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-0')
    })

    it('applies focus styles based on state', () => {
      render(<Input placeholder="Default focus" />)
      const input = screen.getByPlaceholderText('Default focus')
      expect(input).toHaveClass('focus:border-primary-500', 'focus:ring-primary-500')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string values', () => {
      render(<Input value="" placeholder="Empty value" />)
      const input = screen.getByPlaceholderText('Empty value')
      expect(input).toHaveValue('')
    })

    it('handles null and undefined values', () => {
      render(<Input value={undefined} placeholder="Undefined value" />)
      const input = screen.getByPlaceholderText('Undefined value')
      expect(input).toBeInTheDocument()
    })

    it('handles complex icon components', () => {
      const ComplexIcon = () => <div data-testid="complex-icon">🚀</div>
      render(<Input leftIcon={<ComplexIcon />} placeholder="Complex icon" />)
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
    })

    it('maintains proper spacing with multiple states', () => {
      render(
        <Input 
          error="Error message"
          helperText="Helper text"
          placeholder="Multiple states"
        />
      )
      // Error should take priority
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })
  })
})

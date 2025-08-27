import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  showPasswordToggle?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      fullWidth = false,
      showPasswordToggle = false,
      helperText,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type
    
    const widthClass = fullWidth ? 'w-full' : ''
    const hasError = !!error
    const hasSuccess = !!success && !hasError
    
    return (
      <div className={cn('space-y-2', widthClass)}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              'block w-full rounded-lg border shadow-sm transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-400',
              leftIcon ? 'pl-10' : 'pl-3',
              (rightIcon || showPasswordToggle) ? 'pr-10' : 'pr-3',
              'py-2.5 text-sm',
              hasError 
                ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
                : hasSuccess
                ? 'border-success-300 focus:border-success-500 focus:ring-success-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
              className
            )}
            {...props}
          />
          
          {rightIcon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <div className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff data-testid="eye-off-icon" /> : <Eye data-testid="eye-icon" />}
              </div>
            </button>
          )}
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-error-500">
                <AlertCircle data-testid="alert-circle-icon" />
              </div>
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-success-500">
                <CheckCircle data-testid="check-circle-icon" />
              </div>
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-error-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-success-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

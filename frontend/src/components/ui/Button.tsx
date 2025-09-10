import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus:ring-yellow-500 shadow-soft font-medium',
      secondary: 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 focus:ring-gray-500 shadow-soft font-medium',
      accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-soft font-medium',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 font-medium',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-soft font-medium',
      outline: 'bg-transparent text-yellow-600 border border-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500 font-medium',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-2xl',
    }
    
    const widthClass = fullWidth ? 'w-full' : ''
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          widthClass,
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className={cn(
            'animate-spin',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
          )} />
        )}
        {!loading && leftIcon && (
          <span className={cn(
            'mr-2',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
          )}>
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className={cn(
            'ml-2',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
          )}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

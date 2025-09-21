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
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2'

    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white shadow-[0_18px_35px_-18px_rgba(37,99,235,0.6)] hover:shadow-[0_22px_45px_-18px_rgba(37,99,235,0.55)] focus:ring-blue-500',
      secondary: 'bg-white/70 text-slate-700 border border-white/60 hover:bg-white focus:ring-blue-200 shadow-sm',
      accent: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_18px_35px_-18px_rgba(14,165,233,0.5)] hover:shadow-[0_22px_45px_-18px_rgba(14,165,233,0.5)] focus:ring-sky-400',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200',
      danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_18px_35px_-18px_rgba(244,63,94,0.45)] hover:shadow-[0_22px_45px_-18px_rgba(244,63,94,0.45)] focus:ring-rose-400',
      outline: 'bg-transparent text-blue-600 border border-blue-500 hover:bg-blue-50 focus:ring-blue-400',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-full',
      md: 'px-5 py-2.5 text-sm rounded-full',
      lg: 'px-6 py-3 text-base rounded-full',
      xl: 'px-8 py-3.5 text-lg rounded-full',
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
          <span
            className={cn(
              'flex items-center justify-center',
              size === 'sm'
                ? 'h-3.5 w-3.5'
                : size === 'md'
                ? 'h-4 w-4'
                : size === 'lg'
                ? 'h-5 w-5'
                : 'h-6 w-6'
            )}
          >
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span
            className={cn(
              'flex items-center justify-center',
              size === 'sm'
                ? 'h-3.5 w-3.5'
                : size === 'md'
                ? 'h-4 w-4'
                : size === 'lg'
                ? 'h-5 w-5'
                : 'h-6 w-6'
            )}
          >
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

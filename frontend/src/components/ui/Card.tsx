import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_22px_55px_-30px_rgba(37,99,235,0.45)] dark:border-slate-700/60 dark:bg-slate-900/70',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-5 border-b border-white/60 bg-white/70 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-5', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-5 border-t border-white/60 bg-white/70 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardBody.displayName = 'CardBody'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardBody, CardFooter }

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animation?: 'pulse' | 'none'
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse'
}) => {
  const baseClasses = animation === 'pulse' ? "animate-pulse bg-gray-200 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-700"
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-line"
            className={cn(
              baseClasses,
              "h-4 rounded",
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            style={{
              ...(width && { width }),
              ...(height && { height })
            }}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
    rounded: "rounded-lg"
  }

  return (
    <div
      data-testid="skeleton"
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{
        ...(width && { width }),
        ...(height && { height })
      }}
    />
  )
}

// Specialized skeleton components
export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  lineHeight?: string;
}> = ({ 
  lines = 1, 
  className,
  lineHeight
}) => {
  if (lines === 1) {
    return (
      <div data-testid="skeleton-text" className={className}>
        <div data-testid="skeleton-line">
          <Skeleton variant="text" className={lineHeight} />
        </div>
      </div>
    )
  }
  
  return (
    <div data-testid="skeleton-text" className={className}>
      <Skeleton variant="text" lines={lines} className={lineHeight} />
    </div>
  )
}

export const SkeletonAvatar: React.FC<{ 
  size?: number | string; 
  className?: string;
  width?: string;
  height?: string;
}> = ({ 
  size = 40, 
  className,
  width,
  height
}) => {
  // Handle size variants
  let sizeClasses = ""
  if (typeof size === 'string') {
    switch (size) {
      case 'sm': sizeClasses = "w-8 h-8"; break;
      case 'md': sizeClasses = "w-12 h-12"; break;
      case 'lg': sizeClasses = "w-16 h-16"; break;
      case 'xl': sizeClasses = "w-20 h-20"; break;
      default: sizeClasses = "";
    }
  }
  
  const actualWidth = width || (typeof size === 'number' ? `${size}px` : size)
  const actualHeight = height || (typeof size === 'number' ? `${size}px` : size)
  
  // When width/height props are provided, they should override size classes
  const hasCustomDimensions = width || height
  const finalSizeClasses = hasCustomDimensions ? "" : sizeClasses
  
  return (
    <div 
      data-testid="skeleton-avatar" 
      className={cn(className, finalSizeClasses)}
      style={hasCustomDimensions ? { width: actualWidth, height: actualHeight } : undefined}
    >
      <Skeleton 
        variant="circular" 
        width={actualWidth} 
        height={actualHeight} 
      />
    </div>
  )
}

export const SkeletonCard: React.FC<{ 
  className?: string;
  padding?: string;
  borderRadius?: string;
  children?: React.ReactNode;
}> = ({ className, padding, borderRadius, children }) => (
  <div 
    data-testid="skeleton-card" 
    className={cn("space-y-3 p-4 border rounded-lg", padding, borderRadius, className)}
  >
    {children || (
      <>
        <Skeleton variant="rounded" height={200} />
        <SkeletonText lines={2} />
        <div className="flex items-center space-x-2">
          <SkeletonAvatar size={24} />
          <Skeleton width="60%" height={16} />
        </div>
      </>
    )}
  </div>
)

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
  rowHeight?: string;
  cellWidth?: string;
}> = ({ rows = 5, columns = 4, className, rowHeight, cellWidth }) => (
  <div data-testid="skeleton-table" className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width="100%" height={20} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} data-testid="skeleton-row" className={cn("flex space-x-4", rowHeight)}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} data-testid="skeleton-cell" className={cellWidth}>
            <Skeleton 
              width="100%" 
              height={16}
              className={colIndex === 0 ? "w-1/3" : undefined}
            />
          </div>
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonList: React.FC<{ 
  items?: number; 
  className?: string;
  itemHeight?: string;
  spacing?: string;
}> = ({ items = 3, className, itemHeight, spacing }) => (
  <div data-testid="skeleton-list" className={cn(spacing || "space-y-4", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} data-testid="skeleton-item" className={cn("flex items-center space-x-4", itemHeight)}>
        <SkeletonAvatar size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonForm: React.FC<{ 
  fields?: number; 
  className?: string;
  fieldHeight?: string;
  spacing?: string;
}> = ({ fields = 4, className, fieldHeight, spacing }) => (
  <div data-testid="skeleton-form" className={cn(spacing || "space-y-6", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} data-testid="skeleton-field" className={cn("space-y-2", fieldHeight)}>
        <Skeleton width="30%" height={16} />
        <Skeleton variant="rounded" height={40} />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton width={100} height={40} />
      <Skeleton width={80} height={40} />
    </div>
  </div>
)

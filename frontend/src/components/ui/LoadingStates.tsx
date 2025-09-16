import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Skeleton components for professional loading states
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("card-modern animate-pulse", className)}>
    <div className="p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
)

export const SkeletonTable: React.FC = () => (
  <div className="card-modern animate-pulse">
    <div className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
        </div>
        
        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 py-3 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Animated loading spinner with professional design
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <motion.div
      className={cn("inline-block", sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        className="w-full h-full text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  )
}

// Progress bar with smooth animations
export const ProgressBar: React.FC<{ 
  progress: number
  className?: string
  showLabel?: boolean
  label?: string
}> = ({ progress, className, showLabel = true, label }) => (
  <div className={cn("space-y-2", className)}>
    {showLabel && (
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label || 'Progress'}</span>
        <span className="text-slate-500">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-slate-200 rounded-full h-2">
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  </div>
)

// Pulsing dot indicator for real-time status
export const StatusIndicator: React.FC<{ 
  status: 'online' | 'offline' | 'processing' | 'error'
  size?: 'sm' | 'md' | 'lg'
}> = ({ status, size = 'md' }) => {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    processing: 'bg-blue-500',
    error: 'bg-red-500'
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={cn("rounded-full", colors[status], sizes[size])} />
        {(status === 'online' || status === 'processing') && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full opacity-75",
              colors[status],
              sizes[size]
            )}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  )
}

// Content loading placeholder with shimmer effect
export const ContentPlaceholder: React.FC<{ 
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-pulse",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
        style={{
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    ))}
  </div>
)

// Add shimmer keyframes to CSS
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = shimmerStyles
  document.head.appendChild(style)
}
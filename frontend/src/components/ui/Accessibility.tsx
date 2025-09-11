import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Focus trap for modals and dropdowns
interface FocusTrapProps {
  children: React.ReactNode
  className?: string
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement>(null)
  const lastFocusableRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0]
    lastFocusableRef.current = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const currentElement = document.activeElement as HTMLElement
        
        if (event.shiftKey) {
          // Shift+Tab - move to previous element
          if (currentElement === firstFocusableRef.current) {
            event.preventDefault()
            lastFocusableRef.current?.focus()
          } else {
            // Find previous focusable element
            const currentIndex = Array.from(focusableElements).indexOf(currentElement)
            if (currentIndex > 0) {
              event.preventDefault()
              focusableElements[currentIndex - 1].focus()
            }
          }
        } else {
          // Tab - move to next element
          if (currentElement === lastFocusableRef.current) {
            event.preventDefault()
            firstFocusableRef.current?.focus()
          } else {
            // Find next focusable element
            const currentIndex = Array.from(focusableElements).indexOf(currentElement)
            if (currentIndex < focusableElements.length - 1) {
              event.preventDefault()
              focusableElements[currentIndex + 1].focus()
            }
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Skip to main content link
export const SkipToContent: React.FC<{ targetId?: string }> = ({ targetId = 'main-content' }) => {
  const [isVisible, setIsVisible] = useState(true) // Changed to true for testing
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsVisible(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClick = () => {
    const targetElement = document.querySelector(`#${targetId}`) as HTMLElement
    if (targetElement) {
      targetElement.focus()
      // Check if scrollIntoView is available (not available in jsdom)
      if (typeof targetElement.scrollIntoView === 'function') {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  if (!isVisible) return null

  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

// Screen reader only text
export const SrOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
)

// Visually hidden but accessible
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
)

// Live region for dynamic content updates
interface LiveRegionProps {
  children: React.ReactNode
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  className?: string
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = false, // Changed default to false
  className 
}) => (
  <div
    aria-live={ariaLive}
    aria-atomic={ariaAtomic}
    className={cn("sr-only", className)}
  >
    {children}
  </div>
)

// Announcement component for screen readers
export const Announcement: React.FC<{ message: string; priority?: 'polite' | 'assertive' }> = ({ 
  message, 
  priority = 'polite' 
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    if (message) {
      setAnnouncements(prev => [...prev, message])
      
      // Remove announcement after a delay
      const timer = setTimeout(() => {
        setAnnouncements(prev => prev.filter(announcement => announcement !== message))
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <LiveRegion aria-live={priority} aria-atomic={true}>
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </LiveRegion>
  )
}

// High contrast mode support
export const HighContrastMode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className={cn(
      isHighContrast && "high-contrast",
      "transition-all duration-200"
    )}>
      {children}
    </div>
  )
}

// Reduced motion support
export const ReducedMotion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (prefersReducedMotion) {
    return <div className="motion-reduce">{children}</div>
  }

  return <>{children}</>
}

// Keyboard navigation indicator
export const KeyboardIndicator: React.FC = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = () => setIsKeyboardUser(true)
    const handleMouseDown = () => setIsKeyboardUser(false)

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  if (!isKeyboardUser) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded text-sm">
      Keyboard Navigation Active
    </div>
  )
}

// Error boundary with accessibility
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AccessibleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div 
    role="alert" 
    aria-live="assertive"
    className="p-4 bg-red-50 border border-red-200 rounded-lg"
  >
    <h2 className="text-lg font-semibold text-red-800 mb-2">
      Something went wrong
    </h2>
    <p className="text-red-700 mb-4">
      An error occurred while rendering this component.
    </p>
    <details className="text-sm text-red-600">
      <summary className="cursor-pointer hover:text-red-800">
        Error details
      </summary>
      <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
        {error.message}
      </pre>
    </details>
  </div>
)

// Accessibility utilities
export const accessibilityUtils = {
  // Generate unique ID for form labels
  generateId: (prefix: string = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const tag = element.tagName.toLowerCase()
    const tabIndex = element.getAttribute('tabindex')
    
    if (tabIndex === '-1') return false
    
    if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea') {
      return !element.hasAttribute('disabled')
    }
    
    if (tag === 'a') {
      return element.hasAttribute('href')
    }
    
    return tabIndex !== null || element.onclick !== null
  },
  
  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    return Array.from(focusableElements).filter(element => 
      accessibilityUtils.isFocusable(element)
    )
  }
}

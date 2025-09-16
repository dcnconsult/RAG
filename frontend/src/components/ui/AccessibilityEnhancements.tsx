import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Skip to main content link for screen readers
export const SkipToContent: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    Skip to main content
  </a>
)

// Screen reader announcements
export const LiveRegion: React.FC<{ 
  children: React.ReactNode
  politeness?: 'polite' | 'assertive'
}> = ({ children, politeness = 'polite' }) => (
  <div
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {children}
  </div>
)

// Focus trap for modals
export const FocusTrap: React.FC<{
  children: React.ReactNode
  isActive: boolean
}> = ({ children, isActive }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Could trigger modal close here
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)
    
    // Focus first element
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// High contrast mode support
export const HighContrastButton: React.FC = () => {
  const [highContrast, setHighContrast] = React.useState(false)

  React.useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [highContrast])

  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
      title={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
  )
}

// Reduced motion support
export const MotionWrapper: React.FC<{
  children: React.ReactNode
  [key: string]: any
}> = ({ children, ...motionProps }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (prefersReducedMotion) {
    return <div>{children}</div>
  }

  return <motion.div {...motionProps}>{children}</motion.div>
}

// Keyboard navigation helper
export const KeyboardNavigation: React.FC<{
  children: React.ReactNode
  onKeyDown?: (e: React.KeyboardEvent) => void
}> = ({ children, onKeyDown }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const focusableElements = Array.from(
        document.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      
      if (currentIndex > -1) {
        let nextIndex: number
        
        switch (e.key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
            break
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
            break
          default:
            return
        }
        
        focusableElements[nextIndex]?.focus()
        e.preventDefault()
      }
    }
    
    onKeyDown?.(e)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      {children}
    </div>
  )
}

// Focus indicator enhancement
export const FocusIndicator: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn(
    "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-lg",
    className
  )}>
    {children}
  </div>
)

// ARIA label helpers
export const AriaLabel: React.FC<{
  label: string
  description?: string
  children: React.ReactNode
}> = ({ label, description, children }) => {
  const labelId = React.useId()
  const descId = React.useId()

  return (
    <>
      <div aria-labelledby={labelId} aria-describedby={description ? descId : undefined}>
        {children}
      </div>
      <span id={labelId} className="sr-only">{label}</span>
      {description && (
        <span id={descId} className="sr-only">{description}</span>
      )}
    </>
  )
}

// Color contrast checker (development tool)
export const ColorContrastChecker: React.FC<{
  foreground: string
  background: string
  text?: string
}> = ({ foreground, background, text = "Sample text" }) => {
  const [contrast, setContrast] = React.useState<number>(0)
  const [level, setLevel] = React.useState<'AA' | 'AAA' | 'Fail'>('Fail')

  React.useEffect(() => {
    // Simple contrast calculation (for development)
    const getLuminance = (color: string) => {
      const rgb = parseInt(color.replace('#', ''), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      
      const lum = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    
    setContrast(ratio)
    setLevel(ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail')
  }, [foreground, background])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <div 
        className="p-2 rounded mb-2"
        style={{ color: foreground, backgroundColor: background }}
      >
        {text}
      </div>
      <div className="text-xs">
        <div>Contrast: {contrast.toFixed(2)}:1</div>
        <div className={cn(
          "font-medium",
          level === 'AAA' ? 'text-green-600' : 
          level === 'AA' ? 'text-yellow-600' : 'text-red-600'
        )}>
          WCAG {level}
        </div>
      </div>
    </div>
  )
}
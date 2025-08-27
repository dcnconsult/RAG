import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// Fade in animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
}

// Slide in from left variants
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: { duration: 0.3 }
  }
}

// Slide in from right variants
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: 50,
    transition: { duration: 0.3 }
  }
}

// Scale in variants
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.3 }
  }
}

// Stagger children variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Page transition variants
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.4 }
  }
}

// Hover variants for interactive elements
export const hoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
}

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: { 
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
  },
  hover: { 
    y: -4,
    boxShadow: "0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: { duration: 0.3 }
  }
}

// Fade in component
export const FadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  variant?: string
  'data-testid'?: string
  'aria-label'?: string
}> = ({ children, delay = 0, duration = 0.5, className, variant, 'data-testid': dataTestId, 'aria-label': ariaLabel }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={fadeInVariants}
    transition={{ delay, duration }}
    className={className}
    data-variant={variant}
    data-testid={dataTestId || 'motion-div'}
    aria-label={ariaLabel}
  >
    {children}
  </motion.div>
)

// Stagger children component
export const StaggerContainer: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}> = ({ children, className, staggerDelay = 0.1 }) => {
  const customVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2
      }
    }
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customVariants}
      className={className}
      data-stagger-delay={staggerDelay}
      data-testid="motion-div"
    >
      {children}
    </motion.div>
  )
}

// Page transition wrapper
export const PageTransition: React.FC<{
  children: React.ReactNode
  className?: string
  transitionType?: string
  'data-testid'?: string
  'aria-label'?: string
}> = ({ children, className, transitionType = 'default', 'data-testid': dataTestId, 'aria-label': ariaLabel }) => (
  <motion.section
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={pageTransitionVariants}
    className={className}
    data-transition-type={transitionType}
    data-testid={dataTestId || 'motion-section'}
    aria-label={ariaLabel}
  >
    {children}
  </motion.section>
)

// Hoverable component
export const Hoverable: React.FC<{
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverRotate?: number
  hoverShadow?: string
  'data-testid'?: string
  'aria-label'?: string
}> = ({ children, className, hoverScale = 1.02, hoverRotate = 0, hoverShadow = 'md', 'data-testid': dataTestId, 'aria-label': ariaLabel }) => (
  <motion.div
    variants={{
      initial: { scale: 1, rotate: 0 },
      hover: { 
        scale: hoverScale, 
        rotate: hoverRotate,
        transition: { duration: 0.2 }
      }
    }}
    initial="initial"
    whileHover="hover"
    className={className}
    data-hover-scale={hoverScale}
    data-hover-rotate={hoverRotate}
    data-hover-shadow={hoverShadow}
    data-testid={dataTestId || 'motion-div'}
    aria-label={ariaLabel}
  >
    {children}
  </motion.div>
)

// Animated card component
export const AnimatedCard: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'flat'
  hoverScale?: number
  hoverShadow?: string
  hoverRotate?: number
  onClick?: () => void
  'data-testid'?: string
  'aria-label'?: string
  role?: string
  tabIndex?: number
}> = ({ 
  children, 
  className, 
  variant = 'default',
  hoverScale = 1.02,
  hoverShadow = 'lg',
  hoverRotate = 0,
  onClick,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  role,
  tabIndex
}) => (
  <motion.article
    variants={{
      initial: { 
        y: 0, 
        scale: 1,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
      },
      hover: { 
        y: -4, 
        scale: hoverScale,
        rotate: hoverRotate,
        boxShadow: "0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        transition: { duration: 0.3 }
      }
    }}
    initial="initial"
    whileHover="hover"
    className={className}
    data-card-variant={variant}
    data-hover-scale={hoverScale}
    data-hover-shadow={hoverShadow}
    data-hover-rotate={hoverRotate}
    onClick={onClick}
    data-testid={dataTestId || 'motion-article'}
    aria-label={ariaLabel}
    role={role}
    tabIndex={tabIndex}
  >
    {children}
  </motion.article>
)

// Export AnimatePresence for conditional animations
export { AnimatePresence }

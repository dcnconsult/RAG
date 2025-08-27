import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  Globe, 
  FileText, 
  MessageSquare, 
  Settings, 
  User,
  Search,
  Plus,
  LogOut
} from 'lucide-react'
import { Button } from './Button'
import { useNavigate, useLocation } from 'react-router-dom'
import { routes } from '@/lib/router'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  className?: string
}

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Home', path: routes.home, icon: Home },
  { label: 'Domains', path: routes.domains, icon: Globe },
  { label: 'Documents', path: routes.documents, icon: FileText },
  { label: 'Chat', path: routes.chat, icon: MessageSquare },
  { label: 'Settings', path: routes.settings, icon: Settings },
]

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme } = useTheme()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "lg:hidden h-10 w-10 p-0",
          isScrolled && "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
          className
        )}
        aria-label="Open mobile menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 200
              }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    RAG Explorer
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <motion.button
                      key={item.path}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                        active
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        active ? "text-primary-500" : "text-gray-400"
                      )} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </nav>

              {/* Quick Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    handleNavigation(routes.domains)
                    // TODO: Open create domain modal
                  }}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Domain
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    handleNavigation(routes.documents)
                    // TODO: Open upload modal
                  }}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Upload Document
                </Button>
              </div>

              {/* User Section */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      User Name
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      user@example.com
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Handle logout
                      setIsOpen(false)
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Bottom Navigation Bar for Mobile
export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const bottomNavItems = [
    { label: 'Home', path: routes.home, icon: Home },
    { label: 'Domains', path: routes.domains, icon: Globe },
    { label: 'Documents', path: routes.documents, icon: FileText },
    { label: 'Chat', path: routes.chat, icon: MessageSquare },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors",
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to check if route is active
const isActive = (path: string) => {
  if (path === routes.home) {
    return location.pathname === path
  }
  return location.pathname.startsWith(path)
}

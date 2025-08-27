import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const Icon = currentTheme?.icon || Sun

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 p-0"
        aria-label="Toggle theme"
      >
        <Icon className="h-4 w-4" />
        <ChevronDown className="ml-1 h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
          <div className="py-1">
            {themes.map((themeOption) => {
              const ThemeIcon = themeOption.icon
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value as 'light' | 'dark' | 'system')
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                    theme === themeOption.value && 'bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <ThemeIcon className="mr-3 h-4 w-4" />
                  {themeOption.label}
                  {theme === themeOption.value && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

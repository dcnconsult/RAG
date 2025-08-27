import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
  preventDefault?: boolean
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: KeyboardShortcutsConfig) => {
  const shortcutsRef = useRef(shortcuts)

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const pressedKey = event.key.toLowerCase()
    const ctrl = event.ctrlKey
    const shift = event.shiftKey
    const alt = event.altKey
    const meta = event.metaKey

    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === pressedKey &&
        !!shortcut.ctrl === ctrl &&
        !!shortcut.shift === shift &&
        !!shortcut.alt === alt &&
        !!shortcut.meta === meta
      )
    })

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      shortcut.action()
    }
  }, [enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return { enabled }
}

// Predefined shortcut combinations
export const createShortcut = {
  // Navigation shortcuts
  home: (action: () => void): KeyboardShortcut => ({
    key: 'h',
    ctrl: true,
    description: 'Go to Home',
    action
  }),
  
  domains: (action: () => void): KeyboardShortcut => ({
    key: 'd',
    ctrl: true,
    description: 'Go to Domains',
    action
  }),
  
  documents: (action: () => void): KeyboardShortcut => ({
    key: 'f',
    ctrl: true,
    description: 'Go to Documents',
    action
  }),
  
  chat: (action: () => void): KeyboardShortcut => ({
    key: 'c',
    ctrl: true,
    description: 'Go to Chat',
    action
  }),

  // Action shortcuts
  new: (action: () => void): KeyboardShortcut => ({
    key: 'n',
    ctrl: true,
    description: 'Create New',
    action
  }),
  
  upload: (action: () => void): KeyboardShortcut => ({
    key: 'u',
    ctrl: true,
    description: 'Upload Document',
    action
  }),
  
  search: (action: () => void): KeyboardShortcut => ({
    key: 'k',
    ctrl: true,
    description: 'Search',
    action
  }),
  
  save: (action: () => void): KeyboardShortcut => ({
    key: 's',
    ctrl: true,
    description: 'Save',
    action
  }),

  // Utility shortcuts
  help: (action: () => void): KeyboardShortcut => ({
    key: '?',
    description: 'Show Help',
    action
  }),
  
  settings: (action: () => void): KeyboardShortcut => ({
    key: ',',
    ctrl: true,
    description: 'Open Settings',
    action
  }),
  
  theme: (action: () => void): KeyboardShortcut => ({
    key: 't',
    ctrl: true,
    description: 'Toggle Theme',
    action
  }),

  // Chat shortcuts
  sendMessage: (action: () => void): KeyboardShortcut => ({
    key: 'Enter',
    description: 'Send Message',
    action,
    preventDefault: false
  }),
  
  newLine: (action: () => void): KeyboardShortcut => ({
    key: 'Enter',
    shift: true,
    description: 'New Line',
    action,
    preventDefault: false
  }),

  // Document shortcuts
  nextDocument: (action: () => void): KeyboardShortcut => ({
    key: 'ArrowRight',
    ctrl: true,
    description: 'Next Document',
    action
  }),
  
  prevDocument: (action: () => void): KeyboardShortcut => ({
    key: 'ArrowLeft',
    ctrl: true,
    description: 'Previous Document',
    action
  }),

  // Global shortcuts
  escape: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    description: 'Close/Cancel',
    action
  }),
  
  refresh: (action: () => void): KeyboardShortcut => ({
    key: 'r',
    ctrl: true,
    description: 'Refresh',
    action
  }),
  
  fullscreen: (action: () => void): KeyboardShortcut => ({
    key: 'f',
    description: 'Toggle Fullscreen',
    action
  })
}

// Hook for specific shortcut combinations
export const useSpecificShortcut = (
  key: string,
  action: () => void,
  options: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    enabled?: boolean
    preventDefault?: boolean
  } = {}
) => {
  const { enabled = true, ...modifiers } = options

  const shortcut: KeyboardShortcut = {
    key,
    action,
    description: `Custom shortcut: ${key}`,
    preventDefault: options.preventDefault !== false,
    ...modifiers
  }

  useKeyboardShortcuts({ shortcuts: [shortcut], enabled })
}

// Hook for escape key
export const useEscapeKey = (action: () => void, enabled = true) => {
  useSpecificShortcut('Escape', action, { enabled })
}

// Hook for enter key
export const useEnterKey = (action: () => void, enabled = true) => {
  useSpecificShortcut('Enter', action, { enabled, preventDefault: false })
}

// Hook for ctrl+s
export const useSaveShortcut = (action: () => void, enabled = true) => {
  useSpecificShortcut('s', action, { ctrl: true, enabled })
}

// Hook for ctrl+k
export const useSearchShortcut = (action: () => void, enabled = true) => {
  useSpecificShortcut('k', action, { ctrl: true, enabled })
}

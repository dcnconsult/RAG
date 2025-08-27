import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, createShortcut } from '../useKeyboardShortcuts'

// Mock document event listeners
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
})

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
})

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should register event listener when enabled', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should not register event listener when disabled', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }))

    expect(mockAddEventListener).not.toHaveBeenCalled()
  })

  it('should call callback when shortcut is pressed', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    // Get the event handler that was registered
    const eventHandler = mockAddEventListener.mock.calls[0][1]

    // Simulate key press
    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('should not call callback when modifier keys do not match', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', ctrl: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    // Simulate key press without ctrl
    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).not.toHaveBeenCalled()
  })

  it('should handle multiple shortcuts', () => {
    const mockAction1 = vi.fn()
    const mockAction2 = vi.fn()
    const shortcuts = [
      { key: 'a', description: 'Test 1', action: mockAction1 },
      { key: 'b', description: 'Test 2', action: mockAction2 }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    // Test first shortcut
    const mockEvent1 = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent1)
    })

    expect(mockAction1).toHaveBeenCalled()

    // Test second shortcut
    const mockEvent2 = {
      key: 'b',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent2)
    })

    expect(mockAction2).toHaveBeenCalled()
  })

  it('should handle case-insensitive key matching', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'A', description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    // Simulate lowercase key press
    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should handle special keys', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'Enter', description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'Enter',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should handle alt key modifier', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', alt: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should handle shift key modifier', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', shift: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should handle meta key modifier', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', meta: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: true,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should handle multiple modifier keys', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', ctrl: true, shift: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
  })

  it('should not call callback when any required modifier is missing', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', ctrl: true, shift: true, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    // Missing shift key
    const mockEvent = {
      key: 'a',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).not.toHaveBeenCalled()
  })

  it('should respect preventDefault setting', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', preventDefault: false, description: 'Test', action: mockAction }
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    const eventHandler = mockAddEventListener.mock.calls[0][1]

    const mockEvent = {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    }

    act(() => {
      eventHandler(mockEvent)
    })

    expect(mockAction).toHaveBeenCalled()
    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('should cleanup event listener on unmount', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      { key: 'a', description: 'Test', action: mockAction }
    ]

    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }))

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})

describe('createShortcut', () => {
  it('should create home shortcut', () => {
    const mockAction = vi.fn()
    const shortcut = createShortcut.home(mockAction)

    expect(shortcut).toEqual({
      key: 'h',
      ctrl: true,
      description: 'Go to Home',
      action: mockAction,
      preventDefault: undefined,
    })
  })

  it('should create save shortcut', () => {
    const mockAction = vi.fn()
    const shortcut = createShortcut.save(mockAction)

    expect(shortcut).toEqual({
      key: 's',
      ctrl: true,
      description: 'Save',
      action: mockAction,
      preventDefault: undefined,
    })
  })

  it('should create search shortcut', () => {
    const mockAction = vi.fn()
    const shortcut = createShortcut.search(mockAction)

    expect(shortcut).toEqual({
      key: 'k',
      ctrl: true,
      description: 'Search',
      action: mockAction,
      preventDefault: undefined,
    })
  })
})

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import { ToastProvider, useToast } from '../Toast'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Toast System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render toast provider', () => {
    render(
      <ToastProvider>
        <div>Test Content</div>
      </ToastProvider>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should add success toast when addToast is called', () => {
    const TestComponent = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        addToast({
          type: 'success',
          title: 'Success!',
          message: 'Operation completed successfully'
        })
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
  })

  it('should add different types of toasts', () => {
    const TestComponent = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        addToast({ type: 'error', title: 'Error occurred' })
        addToast({ type: 'warning', title: 'Warning message' })
        addToast({ type: 'info', title: 'Info notice' })
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByText('Error occurred')).toBeInTheDocument()
    expect(screen.getByText('Warning message')).toBeInTheDocument()
    expect(screen.getByText('Info notice')).toBeInTheDocument()
  })

  it('should render toast with action button', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    const TestComponent = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        addToast({
          type: 'success',
          title: 'Action Required',
          action: {
            label: 'Click Me',
            onClick: () => console.log('Action clicked')
          }
        })
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByText('Action Required')).toBeInTheDocument()
    expect(screen.getByText('Click Me')).toBeInTheDocument()

    const actionButton = screen.getByText('Click Me')
    fireEvent.click(actionButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Action clicked')
    consoleSpy.mockRestore()
  })

  it('should remove toast when close button is clicked', () => {
    const TestComponentWithClose = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        addToast({
          type: 'success',
          title: 'Closeable Toast'
        })
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider>
        <TestComponentWithClose />
      </ToastProvider>
    )

    expect(screen.getByText('Closeable Toast')).toBeInTheDocument()

    // Find the close button by finding the X icon and getting its parent button
    const closeIcon = document.querySelector('.lucide-x')
    const closeButton = closeIcon?.closest('button')
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton!)

    expect(screen.queryByText('Closeable Toast')).not.toBeInTheDocument()
  })

  it('should clear all toasts when clearToasts is called', () => {
    const TestComponentWithClear = () => {
      const { addToast, clearToasts } = useToast()
      
      React.useEffect(() => {
        addToast({ type: 'success', title: 'Toast 1' })
        addToast({ type: 'error', title: 'Toast 2' })
      }, [addToast])
      
      return (
        <div>
          <button onClick={clearToasts}>Clear All</button>
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestComponentWithClear />
      </ToastProvider>
    )

    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()

    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)

    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Toast 2')).not.toBeInTheDocument()
  })

  it('should limit maximum number of toasts', () => {
    const TestComponentWithManyToasts = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        // Add more toasts than the default max (5)
        for (let i = 1; i <= 7; i++) {
          addToast({ type: 'info', title: `Toast ${i}` })
        }
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider maxToasts={3}>
        <TestComponentWithManyToasts />
      </ToastProvider>
    )

    // Should only show the last 3 toasts
    expect(screen.getByText('Toast 5')).toBeInTheDocument()
    expect(screen.getByText('Toast 6')).toBeInTheDocument()
    expect(screen.getByText('Toast 7')).toBeInTheDocument()
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Toast 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Toast 3')).not.toBeInTheDocument()
    expect(screen.queryByText('Toast 4')).not.toBeInTheDocument()
  })

  it('should show progress bar for toast duration', () => {
    const TestComponentWithProgress = () => {
      const { addToast } = useToast()
      
      React.useEffect(() => {
        addToast({
          type: 'success',
          title: 'Progress Toast',
          duration: 3000
        })
      }, [addToast])
      
      return <div>Test</div>
    }

    render(
      <ToastProvider>
        <TestComponentWithProgress />
      </ToastProvider>
    )

    expect(screen.getByText('Progress Toast')).toBeInTheDocument()

    // Progress bar should be present
    const progressBar = document.querySelector('[class*="h-1 bg-current"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('should handle toast removal by ID', () => {
    const TestComponentWithRemove = () => {
      const { addToast, removeToast } = useToast()
      const [toastId, setToastId] = React.useState<string>('')
      
      React.useEffect(() => {
        const id = addToast({
          type: 'success',
          title: 'Removable Toast'
        })
        setToastId(id)
      }, [addToast])
      
      return (
        <div>
          <button onClick={() => removeToast(toastId)}>Remove Toast</button>
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestComponentWithRemove />
      </ToastProvider>
    )

    expect(screen.getByText('Removable Toast')).toBeInTheDocument()

    const removeButton = screen.getByText('Remove Toast')
    fireEvent.click(removeButton)

    expect(screen.queryByText('Removable Toast')).not.toBeInTheDocument()
  })
})

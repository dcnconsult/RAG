import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Mock ThemeProvider for testing
const ThemeProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
// Mock ToastProvider for testing  
const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  queryClient?: QueryClient
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const AllTheProviders = ({ 
  children, 
  route = '/',
  queryClient = createTestQueryClient()
}: { 
  children: React.ReactNode
  route?: string
  queryClient?: QueryClient
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { route = '/', queryClient, ...renderOptions } = options
  
  // Set up the route
  window.history.pushState({}, 'Test page', route)
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders route={route} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Export custom providers for specific test cases
export { AllTheProviders }

// Helper function to create mock data
export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockDocument = (overrides = {}) => ({
  id: '1',
  title: 'Test Document',
  content: 'This is a test document content.',
  type: 'pdf',
  size: 1024,
  uploadedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockChat = (overrides = {}) => ({
  id: '1',
  title: 'Test Chat',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you!',
      timestamp: '2024-01-01T00:00:01Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Helper function to wait for async operations
export const waitForElementToBeRemoved = (element: Element | null) =>
  new Promise<void>((resolve) => {
    if (!element) {
      resolve()
      return
    }
    
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect()
        resolve()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })

// Helper function to mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {},
})

// Helper function to create mock functions
export const createMockFunction = <T extends (...args: any[]) => any>() =>
  vi.fn() as T

// Helper function to simulate user interactions
export const simulateUserInteraction = {
  click: (element: Element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  },
  type: (element: HTMLInputElement, text: string) => {
    element.value = text
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  },
  focus: (element: Element) => {
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
  },
  blur: (element: Element) => {
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
  },
}

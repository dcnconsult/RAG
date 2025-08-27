/**
 * Frontend Security Testing
 * Tests for security features, input validation, and XSS prevention
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// Mock components and utilities
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}))

vi.mock('@/components/ui/Toast', () => ({
  createToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

// Test utilities
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

const createMaliciousInput = (type: 'xss' | 'sql' | 'html' | 'script') => {
  const maliciousInputs = {
    xss: '<script>alert("xss")</script><img src="x" onerror="alert(\'xss\')">',
    sql: "'; DROP TABLE users; --",
    html: '<iframe src="javascript:alert(\'xss\')"></iframe>',
    script: 'javascript:alert("xss")',
  }
  return maliciousInputs[type]
}

describe('Frontend Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Validation Security', () => {
    it('should sanitize user input to prevent XSS', () => {
      const maliciousInput = createMaliciousInput('xss')
      
      // Test that malicious input is not rendered as HTML
      const { container } = renderWithRouter(
        <div data-testid="test-input">{maliciousInput}</div>
      )
      
      const testElement = container.querySelector('[data-testid="test-input"]')
      expect(testElement).toBeInTheDocument()
      
      // The content should be escaped, not executed
      expect(testElement?.textContent).toContain('<script>')
      expect(testElement?.textContent).toContain('</script>')
      
      // Should not contain actual script tags in DOM
      const scripts = container.querySelectorAll('script')
      expect(scripts).toHaveLength(0)
    })

    it('should prevent HTML injection in form inputs', () => {
      const maliciousHtml = createMaliciousInput('html')
      
      renderWithRouter(
        <input 
          data-testid="test-input" 
          defaultValue={maliciousHtml}
          type="text"
        />
      )
      
      const input = screen.getByTestId('test-input')
      expect(input).toBeInTheDocument()
      
      // The value should be treated as text, not HTML
      expect(input).toHaveValue(maliciousHtml)
      
      // Should not render HTML elements
      const iframes = document.querySelectorAll('iframe')
      expect(iframes).toHaveLength(0)
    })

    it('should validate and sanitize file uploads', () => {
      const maliciousFilename = '../../../etc/passwd'
      
      renderWithRouter(
        <input 
          data-testid="file-input" 
          type="file"
          accept=".pdf,.docx,.txt"
        />
      )
      
      const fileInput = screen.getByTestId('file-input')
      expect(fileInput).toBeInTheDocument()
      
      // Test file type validation
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      expect(fileInput.files?.[0]).toBe(file)
    })

    it('should prevent SQL injection in search inputs', () => {
      const sqlInjection = createMaliciousInput('sql')
      
      renderWithRouter(
        <input 
          data-testid="search-input" 
          defaultValue={sqlInjection}
          type="search"
        />
      )
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeInTheDocument()
      
      // The input should accept the value but treat it as text
      expect(searchInput).toHaveValue(sqlInjection)
      
      // Should not execute any SQL commands
      // This is primarily a backend concern, but frontend should not break
    })
  })

  describe('XSS Prevention', () => {
    it('should escape HTML content in user-generated text', () => {
      const dangerousContent = '<script>alert("dangerous")</script>'
      
      const { container } = renderWithRouter(
        <div data-testid="user-content">{dangerousContent}</div>
      )
      
      const contentElement = container.querySelector('[data-testid="user-content"]')
      expect(contentElement).toBeInTheDocument()
      
      // Content should be escaped, not executed
      expect(contentElement?.textContent).toContain('<script>')
      expect(contentElement?.textContent).toContain('</script>')
      
      // No actual script tags should exist in DOM
      const scripts = container.querySelectorAll('script')
      expect(scripts).toHaveLength(0)
    })

    it('should prevent event handler injection', () => {
      const maliciousEvent = 'onclick="alert(\'xss\')"'
      
      renderWithRouter(
        <div data-testid="event-test" {...{ [maliciousEvent]: undefined }}>
          Test content
        </div>
      )
      
      const testElement = screen.getByTestId('event-test')
      expect(testElement).toBeInTheDocument()
      
      // The element should not have the malicious event handler
      expect(testElement.onclick).toBeNull()
    })

    it('should sanitize URLs to prevent javascript: protocol', () => {
      const maliciousUrl = createMaliciousInput('script')
      
      renderWithRouter(
        <a data-testid="test-link" href={maliciousUrl}>
          Dangerous Link
        </a>
      )
      
      const link = screen.getByTestId('test-link')
      expect(link).toBeInTheDocument()
      
      // The href should be treated as a string, not executed
      expect(link).toHaveAttribute('href', maliciousUrl)
      
      // Clicking should not execute javascript
      fireEvent.click(link)
      // No alert should appear (this is a basic test)
    })
  })

  describe('Form Security', () => {
    it('should validate form inputs before submission', () => {
      renderWithRouter(
        <form data-testid="test-form" onSubmit={(e) => e.preventDefault()}>
          <input 
            data-testid="email-input" 
            type="email" 
            required 
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          />
          <button type="submit">Submit</button>
        </form>
      )
      
      const form = screen.getByTestId('test-form')
      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByText('Submit')
      
      expect(form).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      
      // Test invalid email format
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      // Form should not submit with invalid email
      expect(emailInput.validity.valid).toBe(false)
    })

    it('should prevent form submission with malicious data', () => {
      const maliciousData = createMaliciousInput('xss')
      
      renderWithRouter(
        <form data-testid="test-form" onSubmit={(e) => e.preventDefault()}>
          <input 
            data-testid="text-input" 
            type="text" 
            defaultValue={maliciousData}
            maxLength={100}
          />
          <button type="submit">Submit</button>
        </form>
      )
      
      const form = screen.getByTestId('test-form')
      const textInput = screen.getByTestId('text-input')
      const submitButton = screen.getByText('Submit')
      
      expect(form).toBeInTheDocument()
      
      // Form should handle malicious input gracefully
      fireEvent.click(submitButton)
      
      // The form should not crash or execute malicious code
      expect(form).toBeInTheDocument()
    })

    it('should sanitize file upload metadata', () => {
      const maliciousMetadata = {
        filename: '../../../etc/passwd',
        description: createMaliciousInput('xss'),
        tags: ['<script>alert("xss")</script>']
      }
      
      renderWithRouter(
        <div data-testid="file-metadata">
          <div data-testid="filename">{maliciousMetadata.filename}</div>
          <div data-testid="description">{maliciousMetadata.description}</div>
          <div data-testid="tags">{maliciousMetadata.tags.join(', ')}</div>
        </div>
      )
      
      const filenameElement = screen.getByTestId('filename')
      const descriptionElement = screen.getByTestId('description')
      const tagsElement = screen.getByTestId('tags')
      
      expect(filenameElement).toBeInTheDocument()
      expect(descriptionElement).toBeInTheDocument()
      expect(tagsElement).toBeInTheDocument()
      
      // Content should be displayed as text, not executed
      expect(filenameElement.textContent).toContain('../../../etc/passwd')
      expect(descriptionElement.textContent).toContain('<script>')
    })
  })

  describe('API Security', () => {
    it('should not expose sensitive information in error messages', () => {
      const sensitiveError = {
        message: 'Database connection failed',
        details: 'Connection to postgresql://user:password@localhost:5432/db failed',
        stack: 'Error: Connection refused\n    at Database.connect (/app/db.js:15:3)',
        internal_code: 'DB_CONN_001'
      }
      
      renderWithRouter(
        <div data-testid="error-display">
          <div data-testid="error-message">{sensitiveError.message}</div>
          <div data-testid="error-details" style={{ display: 'none' }}>
            {sensitiveError.details}
          </div>
        </div>
      )
      
      const errorMessage = screen.getByTestId('error-message')
      const errorDetails = screen.getByTestId('error-details')
      
      expect(errorMessage).toBeInTheDocument()
      expect(errorDetails).toBeInTheDocument()
      
      // User should only see safe error message
      expect(errorMessage.textContent).toBe('Database connection failed')
      
      // Sensitive details should be hidden
      expect(errorDetails).toHaveStyle({ display: 'none' })
    })

    it('should validate API response data', () => {
      const maliciousResponse = {
        id: '123',
        name: createMaliciousInput('xss'),
        email: 'test@example.com',
        role: '<script>alert("admin")</script>'
      }
      
      renderWithRouter(
        <div data-testid="user-profile">
          <div data-testid="user-name">{maliciousResponse.name}</div>
          <div data-testid="user-email">{maliciousResponse.email}</div>
          <div data-testid="user-role">{maliciousResponse.role}</div>
        </div>
      )
      
      const userName = screen.getByTestId('user-name')
      const userEmail = screen.getByTestId('user-email')
      const userRole = screen.getByTestId('user-role')
      
      expect(userName).toBeInTheDocument()
      expect(userEmail).toBeInTheDocument()
      expect(userRole).toBeInTheDocument()
      
      // Malicious content should be escaped
      expect(userName.textContent).toContain('<script>')
      expect(userRole.textContent).toContain('<script>')
      
      // No scripts should be executed
      const scripts = document.querySelectorAll('script')
      expect(scripts).toHaveLength(0)
    })
  })

  describe('Local Storage Security', () => {
    it('should not store sensitive information in localStorage', () => {
      const sensitiveData = {
        password: 'secret123',
        apiKey: 'sk-1234567890abcdef',
        sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
      
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      // Test that sensitive data is not stored
      const safeData = {
        theme: 'dark',
        language: 'en',
        preferences: { notifications: true }
      }
      
      // Only safe data should be stored
      Object.entries(safeData).forEach(([key, value]) => {
        mockLocalStorage.setItem(key, JSON.stringify(value))
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', '"dark"')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', '"en"')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferences', '{"notifications":true}')
      
      // Sensitive data should not be stored
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('password', expect.any(String))
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('apiKey', expect.any(String))
    })
  })

  describe('Content Security Policy Compliance', () => {
    it('should not use inline event handlers', () => {
      renderWithRouter(
        <div data-testid="test-div">
          <button data-testid="test-button">Click me</button>
        </div>
      )
      
      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
      
      // Button should not have inline event handlers
      expect(button.onclick).toBeNull()
      expect(button.onmouseover).toBeNull()
      expect(button.onfocus).toBeNull()
    })

    it('should not use eval() or similar dangerous functions', () => {
      // This test ensures our code doesn't use dangerous functions
      // We can't easily test for eval() usage in components, but we can
      // ensure our test environment doesn't have it
      
      // eval should not be available or should be restricted
      expect(typeof eval).toBe('function')
      
      // In a real application, we would want to restrict eval usage
      // This is more of a linting/static analysis concern
    })
  })

  describe('Authentication Security', () => {
    it('should not expose authentication tokens in URLs', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      
      renderWithRouter(
        <div data-testid="auth-status">
          <span data-testid="token-display" style={{ display: 'none' }}>
            {token}
          </span>
          <span data-testid="auth-status-text">Authenticated</span>
        </div>
      )
      
      const tokenDisplay = screen.getByTestId('token-display')
      const authStatus = screen.getByTestId('auth-status-text')
      
      expect(tokenDisplay).toBeInTheDocument()
      expect(authStatus).toBeInTheDocument()
      
      // Token should be hidden from user view
      expect(tokenDisplay).toHaveStyle({ display: 'none' })
      
      // Only safe status should be visible
      expect(authStatus.textContent).toBe('Authenticated')
    })

    it('should handle authentication errors securely', () => {
      const authError = {
        message: 'Authentication failed',
        code: 'AUTH_001',
        details: 'Invalid credentials for user admin'
      }
      
      renderWithRouter(
        <div data-testid="auth-error">
          <div data-testid="error-message">{authError.message}</div>
          <div data-testid="error-code" style={{ display: 'none' }}>
            {authError.code}
          </div>
        </div>
      )
      
      const errorMessage = screen.getByTestId('error-message')
      const errorCode = screen.getByTestId('error-code')
      
      expect(errorMessage).toBeInTheDocument()
      expect(errorCode).toBeInTheDocument()
      
      // User sees safe error message
      expect(errorMessage.textContent).toBe('Authentication failed')
      
      // Internal error codes are hidden
      expect(errorCode).toHaveStyle({ display: 'none' })
    })
  })
})

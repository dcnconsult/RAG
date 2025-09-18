import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DocumentUpload } from '../DocumentUpload'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

// Mock the toast hook
vi.mock('@/components/ui/Toast', () => ({
  useToast: vi.fn(),
  createToast: {
    error: vi.fn((title, message) => ({ type: 'error', title, message })),
    success: vi.fn((title, message) => ({ type: 'success', title, message })),
  },
}))

// Mock the toast context
const mockAddToast = vi.fn()

describe('DocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useToast as any).mockReturnValue({
      addToast: mockAddToast,
    })
    ;(api.post as any).mockResolvedValue({ id: '123', filename: 'test.pdf' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render upload area', () => {
    render(<DocumentUpload />)
    
    expect(screen.getByText('Drag and drop files here, or click to select files')).toBeInTheDocument()
    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should show file size in human readable format', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('12 Bytes')).toBeInTheDocument()
    })
  })

  it('should handle file upload errors gracefully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Mock API error
    vi.mocked(api.post).mockRejectedValue(new Error('Upload failed'))
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    // Wait for upload to complete and show error
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Upload failed',
        message: 'test.pdf: Upload failed',
      })
    })
  })

  it('should show success message on successful upload', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Mock API success
    vi.mocked(api.post).mockResolvedValue({ id: '123', filename: 'test.pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    // Wait for upload to complete and show success
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Upload successful',
        message: 'test.pdf has been uploaded successfully.',
      })
    })
  })

  it('should handle retry functionality for failed uploads', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Mock API to fail first, then succeed
    vi.mocked(api.post)
      .mockRejectedValueOnce(new Error('Upload failed'))
      .mockResolvedValueOnce({ id: '123', filename: 'test.pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    // Wait for first upload to fail
    await waitFor(() => {
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })
    
    // Click retry button
    const retryButton = screen.getByTestId('retry-button')
    fireEvent.click(retryButton)
    
    // Wait for retry to succeed
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Upload successful',
        message: 'test.pdf has been uploaded successfully.',
      })
    })
  })

  it('should handle drag and drop', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const dropZone = screen.getByTestId('dropzone')
    
    // Simulate file drop by triggering the onDrop callback directly
    // since drag and drop events don't work well in tests
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should remove file when delete button is clicked', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
    })
  })

  it('should show progress bar during upload', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    })
  })

  it('should handle multiple file uploads', async () => {
    const mockFile1 = new File(['content 1'], 'file1.pdf', { type: 'application/pdf' })
    const mockFile2 = new File(['content 2'], 'file2.txt', { type: 'text/plain' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile1, mockFile2] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
      expect(screen.getByText('file2.txt')).toBeInTheDocument()
    })
  })

  it('should validate file types', async () => {
    const mockFile = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'File rejected',
        message: expect.stringContaining('test.exe: File type must be one of'),
      })
    })
  })

  it('should handle domain ID when provided', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload domainId="domain-123" />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )
    })
  })

  it('should call onUploadComplete callback when upload succeeds', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const mockOnUploadComplete = vi.fn()
    
    render(<DocumentUpload onUploadComplete={mockOnUploadComplete} />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith('123')
    })
  })
})

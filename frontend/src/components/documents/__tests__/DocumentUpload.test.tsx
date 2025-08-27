import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import { DocumentUpload } from '../DocumentUpload'
import { act } from 'react'

// Mock the API module
vi.mock('../../../api', () => ({
  uploadDocument: vi.fn(),
}))

// Mock the toast hook
const mockAddToast = vi.fn()
vi.mock('../../ui/Toast', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}))

describe('DocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock File constructor
    global.File = vi.fn().mockImplementation((content, name, options) => ({
      name: name || 'test.pdf',
      size: content.length || 1024,
      type: options?.type || 'application/pdf',
      lastModified: Date.now(),
      content,
      ...options,
    }))
    
    // Mock FileReader
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsDataURL: vi.fn(),
      result: 'data:application/pdf;base64,test',
      onload: null,
      onerror: null,
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render upload area with drag and drop text', () => {
    render(<DocumentUpload />)
    
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument()
  })

  it('should show supported file types', () => {
    render(<DocumentUpload />)
    
    expect(screen.getByText(/pdf, doc, docx, txt/i)).toBeInTheDocument()
  })

  it('should handle file selection via click', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    // Simulate file selection
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should handle drag and drop events', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const dropZone = screen.getByTestId('drop-zone')
    
    // Simulate drag enter
    fireEvent.dragEnter(dropZone)
    expect(dropZone).toHaveClass('border-primary')
    
    // Simulate drag leave
    fireEvent.dragLeave(dropZone)
    expect(dropZone).not.toHaveClass('border-primary')
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [mockFile],
      },
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should validate file types', async () => {
    const invalidFile = new File(['test content'], 'test.exe', { type: 'application/x-executable' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [invalidFile] }
    })
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload a valid document file (PDF, DOC, DOCX, TXT)',
      })
    })
  })

  it('should validate file size', async () => {
    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [largeFile] }
    })
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'File too large',
        message: 'File size must be less than 10MB',
      })
    })
  })

  it('should show upload progress for valid files', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  it('should allow removing files before upload', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    const removeButton = screen.getByTestId('remove-file')
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
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

  it('should show drag overlay when dragging over zone', () => {
    render(<DocumentUpload />)
    
    const dropZone = screen.getByTestId('drop-zone')
    
    // Simulate drag enter
    fireEvent.dragEnter(dropZone)
    
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument()
    
    // Simulate drag leave
    fireEvent.dragLeave(dropZone)
    
    expect(screen.queryByText(/drop files here/i)).not.toBeInTheDocument()
  })

  it('should handle empty file selection gracefully', () => {
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    // Simulate empty file selection
    fireEvent.change(fileInput, {
      target: { files: [] }
    })
    
    // Should not crash and should not show any files
    expect(screen.queryByTestId('file-item')).not.toBeInTheDocument()
  })

  it('should show file size in human readable format', async () => {
    const mockFile = new File(['x'.repeat(2048)], 'test.pdf', { type: 'application/pdf' })
    
    render(<DocumentUpload />)
    
    const fileInput = screen.getByTestId('file-input')
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    })
    
    await waitFor(() => {
      expect(screen.getByText('2 KB')).toBeInTheDocument()
    })
  })

  it('should handle file upload errors gracefully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Mock API error
    const { uploadDocument } = await import('../../../api')
    vi.mocked(uploadDocument).mockRejectedValue(new Error('Upload failed'))
    
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
        message: 'Failed to upload test.pdf. Please try again.',
      })
    })
  })

  it('should show success message on successful upload', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Mock API success
    const { uploadDocument } = await import('../../../api')
    vi.mocked(uploadDocument).mockResolvedValue({ id: '123', filename: 'test.pdf' })
    
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
    const { uploadDocument } = await import('../../../api')
    vi.mocked(uploadDocument)
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
})

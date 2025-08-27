import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Upload, FileText, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { cn } from '@/lib/utils'

// Validation schema
const uploadDocumentSchema = z.object({
  domain_id: z.string().min(1, 'Please select a domain'),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
})

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ open, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
  })

  // Fetch domains
  const { data: domains = [] } = useQuery({
    queryKey: queryKeys.domains,
    queryFn: () => api.get<any[]>('/domains'),
  })

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationKey: mutationKeys.uploadDocument,
    mutationFn: async (data: { file: File; formData: UploadDocumentFormData }) => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('domain_id', data.formData.domain_id)
      if (data.formData.metadata?.title) {
        formData.append('metadata[title]', data.formData.metadata.title)
      }
      if (data.formData.metadata?.author) {
        formData.append('metadata[author]', data.formData.metadata.author)
      }
      if (data.formData.metadata?.description) {
        formData.append('metadata[description]', data.formData.metadata.description)
      }

      return api.upload('/documents/upload', data.file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [data.file.name]: progress }))
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      reset()
      onClose()
    },
  })

  const onSubmit = async (formData: UploadDocumentFormData) => {
    if (selectedFiles.length === 0) return

    // Upload each file
    for (const file of selectedFiles) {
      await uploadMutation.mutateAsync({ file, formData })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setSelectedFiles([])
      setUploadProgress({})
      onClose()
    }
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }, [])

  // File input handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  // Remove file
  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  // Get file icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-400" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                    <p className="text-sm text-gray-500">Add new documents to your knowledge base</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardBody className="py-6">
                <div className="space-y-6">
                  {/* Domain Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('domain_id')}
                      className={cn(
                        'block w-full rounded-lg border shadow-sm transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        'px-3 py-2.5 text-sm',
                        errors.domain_id
                          ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      )}
                    >
                      <option value="">Choose a domain...</option>
                      {domains.map(domain => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                    {errors.domain_id && (
                      <p className="mt-1 text-sm text-error-600">{errors.domain_id.message}</p>
                    )}
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Files
                    </label>
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200',
                        dragActive
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-600">
                        <p className="text-lg font-medium">Drop files here or click to browse</p>
                        <p className="text-sm">Supports PDF, DOCX, TXT, and other text-based formats</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h4>
                      <div className="space-y-3">
                        {selectedFiles.map((file) => (
                          <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {getFileIcon(file.name)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {uploadProgress[file.name] !== undefined && (
                                <div className="text-xs text-gray-500">
                                  {uploadProgress[file.name]}%
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFile(file.name)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Fields */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Document Metadata (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Title"
                        placeholder="Document title"
                        {...register('metadata.title')}
                      />
                      <Input
                        label="Author"
                        placeholder="Document author"
                        {...register('metadata.author')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('metadata.description')}
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Brief description of the document content..."
                      />
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Upload Process</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Documents will be automatically processed and chunked for vector search.</p>
                          <p className="mt-1">Processing time depends on file size and complexity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>

              <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex w-full justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting || selectedFiles.length === 0}
                  >
                    Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

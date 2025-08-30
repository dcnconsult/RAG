import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Cloud,
  Trash2
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast, createToast } from '@/components/ui/Toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface DocumentUploadProps {
  domainId?: string
  onUploadComplete?: (fileId: string) => void
  className?: string
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  domainId,
  onUploadComplete,
  className
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragActiveState, setIsDragActiveState] = useState(false)
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessage = errors.map((e: any) => e.message).join(', ')
        addToast(createToast.error(
          'File rejected',
          `${file.name}: ${errorMessage}`
        ))
      })
    }

    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload each file
    newFiles.forEach(uploadFileFunction)
  }, [addToast])

  const uploadFileFunction = async (uploadFile: UploadedFile) => {
    try {
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      if (domainId) {
        formData.append('domain_id', domainId)
      }

      const response = await api.post<{ id: string }>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, progress }
                  : f
              )
            )
          }
        }
      })

      // Update file status to success
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      )

      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(response.id)
      }

      // Show success toast
      addToast(createToast.success(
        'Upload successful',
        `${uploadFile.file.name} has been uploaded successfully.`
      ))

    } catch (error: any) {
      // Update file status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error.response?.data?.detail || 'Upload failed'
              }
            : f
        )
      )

      // Show error toast
      addToast(createToast.error(
        'Upload failed',
        `${uploadFile.file.name}: ${error.response?.data?.detail || 'Upload failed'}`
      ))
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
            : f
        )
      )
      uploadFileFunction(file)
    }
  }

  const { getRootProps, getInputProps, isDragReject, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />
    if (file.type.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        data-testid="dropzone"
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive && !isDragReject && "border-primary-500 bg-primary-50 dark:bg-primary-900/20",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-900/20",
          !isDragActive && "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
        )}
      >
        <CardBody className="p-8 text-center">
          <input {...getInputProps()} ref={fileInputRef} data-testid="file-input" />
          
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragActive ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Cloud className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {isDragActive ? 'Drop files here' : 'Upload documents'}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Drag and drop files here, or click to select files
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Supports PDF, DOCX, DOC, and TXT files up to 50MB
              </p>
            </div>

            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </motion.div>
        </CardBody>
      </Card>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Progress ({uploadedFiles.length} files)
            </h4>
            
            {uploadedFiles.map((uploadFile) => (
              <motion.div
                key={uploadFile.id}
                data-testid="file-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadFile.file)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {uploadFile.file.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadFile.file.size)}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>
                          {uploadFile.status === 'uploading' && `${uploadFile.progress}%`}
                          {uploadFile.status === 'success' && 'Complete'}
                          {uploadFile.status === 'error' && 'Failed'}
                        </span>
                        {uploadFile.status === 'uploading' && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {uploadFile.status === 'success' && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          data-testid="progress-bar"
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            uploadFile.status === 'success' && "bg-green-500",
                            uploadFile.status === 'error' && "bg-red-500",
                            uploadFile.status === 'uploading' && "bg-primary-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-3">
                      {uploadFile.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => uploadFileFunction(uploadFile)}
                          data-testid="retry-button"
                        >
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                        data-testid="delete-button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

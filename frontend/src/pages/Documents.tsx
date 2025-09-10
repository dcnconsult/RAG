import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  Clock,
  File,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal'
import { DeleteDocumentModal } from '@/components/documents/DeleteDocumentModal'

// Types
interface Document {
  id: string
  name: string
  file_type: string
  size: number
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  chunk_count: number
  domain_id: string
  domain_name: string
  metadata?: {
    author?: string
    title?: string
    pages?: number
    language?: string
  }
}

interface DocumentFilters {
  search: string
  status: string
  fileType: string
  domain: string
  sortBy: 'name' | 'created_at' | 'size' | 'chunk_count'
  sortOrder: 'asc' | 'desc'
}

export const Documents: React.FC = () => {
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    status: '',
    fileType: '',
    domain: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  
  const queryClient = useQueryClient()

  // Fetch documents
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => api.get<Document[]>('/documents'),
    staleTime: 30000, // 30 seconds
  })

  // Fetch domains for filter
  const { data: domains = [] } = useQuery({
    queryKey: queryKeys.domains,
    queryFn: () => api.get<any[]>('/domains'),
    staleTime: 60000, // 1 minute
  })

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationKey: mutationKeys.deleteDocument(''),
    mutationFn: (documentId: string) => api.delete(`/documents/${documentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      setDeleteDocument(null)
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (documentIds: string[]) => 
      Promise.all(documentIds.map(id => api.delete(`/documents/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      setSelectedDocuments(new Set())
    },
  })

  // Filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(document => {
      const matchesSearch = document.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          (document.metadata?.title && document.metadata.title.toLowerCase().includes(filters.search.toLowerCase()))
      const matchesStatus = !filters.status || document.status === filters.status
      const matchesFileType = !filters.fileType || document.file_type === filters.fileType
      const matchesDomain = !filters.domain || document.domain_id === filters.domain
      return matchesSearch && matchesStatus && matchesFileType && matchesDomain
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'chunk_count':
          aValue = a.chunk_count
          bValue = b.chunk_count
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [documents, filters])

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)))
    }
  }

  const handleSelectDocument = (documentId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId)
    } else {
      newSelected.add(documentId)
    }
    setSelectedDocuments(newSelected)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedDocuments.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedDocuments))
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'warning'
      case 'failed': return 'error'
      default: return 'secondary'
    }
  }

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-5 w-5 text-purple-500" />
      case 'mp3':
      case 'wav':
      case 'aac':
        return <FileAudio className="h-5 w-5 text-orange-500" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-5 w-5 text-yellow-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">Error loading documents</div>
          <div className="text-gray-500 mt-2">Please try again later</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
      </div>

      {/* Upload Section */}
      <Card>
        <CardBody className="p-8">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Select files to upload to your domain. Supported formats: PDF, DOCX, TXT, CSV, JSON, and more.
            </p>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-primary-500 transition-colors duration-200">
              <div className="text-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Drag & drop files here</p>
                  <p className="text-gray-500">or</p>
                  <Button
                    variant="primary"
                    onClick={() => setShowUploadModal(true)}
                    className="bg-primary-500 text-gray-900 hover:bg-primary-600"
                  >
                    Click to browse your files
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Uploaded Documents Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg font-medium">No documents uploaded yet</div>
            <div className="text-gray-400 mt-2">Upload your first document to get started</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card 
                key={document.id} 
                className={cn(
                  "hover:shadow-medium transition-all duration-200 cursor-pointer",
                  selectedDocuments.has(document.id) && "ring-2 ring-primary-500 bg-primary-50"
                )}
                onClick={() => handleSelectDocument(document.id)}
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileTypeIcon(document.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{document.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusVariant(document.status)} size="sm">
                            {document.status === 'processing' && (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            )}
                            {document.status === 'completed' && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {document.status === 'failed' && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {document.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Document"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDocument(document)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>


      {/* Modals */}
      <UploadDocumentModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      
      {deleteDocument && (
        <DeleteDocumentModal
          document={deleteDocument}
          open={!!deleteDocument}
          onClose={() => setDeleteDocument(null)}
          onConfirm={() => {
            deleteMutation.mutate(deleteDocument.id)
          }}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

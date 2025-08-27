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
  Loader2
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and organize your uploaded documents across all domains.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedDocuments.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected ({selectedDocuments.size})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search className="h-4 w-4" />}
                fullWidth
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <select
                value={filters.domain}
                onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Domains</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  setFilters(prev => ({ 
                    ...prev, 
                    sortBy: sortBy as any, 
                    sortOrder: sortOrder as any 
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest First</option>
                <option value="chunk_count-desc">Most Chunks</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? 'Loading...' : `${filteredDocuments.length} Document${filteredDocuments.length !== 1 ? 's' : ''}`}
            </h3>
            {filteredDocuments.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={selectedDocuments.size === filteredDocuments.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Select All</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <div className="mt-2 text-gray-500">Loading documents...</div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-lg font-medium">No documents found</div>
              <div className="text-gray-400 mt-2">
                {filters.search || filters.status || filters.fileType || filters.domain ? 'Try adjusting your filters' : 'Upload your first document to get started'}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chunks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr 
                      key={document.id} 
                      className={cn(
                        "hover:bg-gray-50 transition-colors duration-150",
                        selectedDocuments.has(document.id) && "bg-primary-50"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.has(document.id)}
                            onChange={() => handleSelectDocument(document.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                          />
                          <div className="flex items-center">
                            {getFileTypeIcon(document.file_type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              <div className="text-sm text-gray-500">{document.file_type.toUpperCase()}</div>
                              {document.metadata?.title && (
                                <div className="text-xs text-gray-400">{document.metadata.title}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.domain_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(document.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(document.status)}>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.chunk_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(document.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
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
                            className="h-8 w-8 p-0"
                            title="Edit Document"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Document"
                            onClick={() => setDeleteDocument(document)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

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

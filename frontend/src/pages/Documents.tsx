import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  FileText, 
  Upload, 
  Download, 
  ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
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


export const Documents: React.FC = () => {
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null)
  
  const queryClient = useQueryClient()

  // Fetch documents
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => api.get<Document[]>('/documents'),
    staleTime: 30000, // 30 seconds
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
          <div className="text-center py-8">
            <div className="text-gray-500">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg font-medium">No documents uploaded yet</div>
            <div className="text-gray-400 mt-2">Upload your first document to get started</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <Card 
                key={document.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {document.status} • {document.chunk_count} chunks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
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
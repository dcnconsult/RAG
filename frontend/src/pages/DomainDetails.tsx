import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Globe, 
  FileText, 
  MessageSquare, 
  Settings, 
  Activity,
  BarChart3,
  Plus,
  Upload,
  Search,
  Brain
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import { routes } from '@/lib/routes'

// Types
interface Domain {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  document_count: number
  chat_count: number
  status: 'active' | 'inactive' | 'processing'
  settings: {
    chunk_size: number
    chunk_overlap: number
    embedding_model: string
    max_tokens: number
  }
}

interface Document {
  id: string
  name: string
  file_type: string
  size: number
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  chunk_count: number
}

interface Chat {
  id: string
  title: string
  message_count: number
  created_at: string
  updated_at: string
}

export const DomainDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'chats' | 'settings'>('overview')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch domain details
  const { data: domain, isLoading, error } = useQuery<Domain>({
    queryKey: queryKeys.domain(id!),
    queryFn: () => api.get<Domain>(`/domains/${id}`),
    enabled: !!id,
  })

  // Fetch domain documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['domains', id, 'documents'],
    queryFn: () => api.get<Document[]>(`/domains/${id}/documents`),
    enabled: !!id,
  })

  // Fetch domain chats
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ['domains', id, 'chats'],
    queryFn: () => api.get<Chat[]>(`/domains/${id}/chats`),
    enabled: !!id,
  })

  // Delete domain mutation
  const deleteMutation = useMutation<void, unknown>({
    mutationKey: mutationKeys.deleteDomain(id!),
    mutationFn: () => api.delete(`/domains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains })
      navigate(routes.domains)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !domain) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">Error loading domain</div>
          <div className="text-gray-500 mt-2">The domain could not be found or loaded</div>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate(routes.domains)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Domains
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'processing': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(routes.domains)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{domain.name}</h1>
            <p className="mt-1 text-sm text-gray-600">{domain.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={getStatusVariant(domain.status)}>
                  {domain.status}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-success-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Documents</p>
                <p className="text-lg font-semibold text-gray-900">{domain.document_count}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Chats</p>
                <p className="text-lg font-semibold text-gray-900">{domain.chat_count}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(domain.updated_at)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b border-gray-200 pb-0">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'chats', label: 'Chats', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </CardHeader>

        <CardBody className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Domain Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-900">{formatDate(domain.created_at)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="text-gray-900">{formatDate(domain.updated_at)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Chunk Size</span>
                      <span className="text-gray-900">{domain.settings.chunk_size} characters</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Chunk Overlap</span>
                      <span className="text-gray-900">{domain.settings.chunk_overlap} characters</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Embedding Model</span>
                      <span className="text-gray-900">{domain.settings.embedding_model}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Max Tokens</span>
                      <span className="text-gray-900">{domain.settings.max_tokens}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      fullWidth
                      leftIcon={<Upload className="h-4 w-4" />}
                    >
                      Upload Document
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<MessageSquare className="h-4 w-4" />}
                    >
                      Start New Chat
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Search className="h-4 w-4" />}
                    >
                      Search Documents
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Brain className="h-4 w-4" />}
                    >
                      RAG Query
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Upload Document
                </Button>
              </div>
              
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg font-medium">No documents yet</div>
                  <div className="text-gray-400 mt-2">Upload your first document to get started</div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chunks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{doc.file_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(doc.size)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusVariant(doc.status)}>
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{doc.chunk_count}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(doc.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Chats</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Chat
                </Button>
              </div>
              
              {chats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg font-medium">No chats yet</div>
                  <div className="text-gray-400 mt-2">Start a conversation to interact with your domain</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{chat.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{chat.message_count} messages</span>
                            <span>Created {formatDate(chat.created_at)}</span>
                            <span>Updated {formatDate(chat.updated_at)}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Continue Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure how your domain processes documents and generates responses.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Chunk Size"
                      type="number"
                      defaultValue={domain.settings.chunk_size}
                      helperText="Number of characters per text chunk"
                    />
                    <Input
                      label="Chunk Overlap"
                      type="number"
                      defaultValue={domain.settings.chunk_overlap}
                      helperText="Number of characters to overlap between chunks"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embedding Model
                      </label>
                      <select className="block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="text-embedding-ada-002">OpenAI Ada-002 (1536 dimensions)</option>
                        <option value="text-embedding-3-small">OpenAI Embedding-3-Small (1536 dimensions)</option>
                        <option value="text-embedding-3-large">OpenAI Embedding-3-Large (3072 dimensions)</option>
                        <option value="cohere-embed-english-v3.0">Cohere Embed English v3.0 (4096 dimensions)</option>
                      </select>
                    </div>
                    <Input
                      label="Max Response Tokens"
                      type="number"
                      defaultValue={domain.settings.max_tokens}
                      helperText="Maximum tokens for RAG responses"
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <Button variant="primary">
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Domain</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{domain.name}"? This action cannot be undone and will remove all associated documents and chats.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteMutation.mutate()
                    setShowDeleteModal(false)
                  }}
                  loading={deleteMutation.isPending}
                >
                  Delete Domain
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="mr-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

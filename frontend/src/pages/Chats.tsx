import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Globe, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Brain,
  FileText
} from 'lucide-react'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import { CreateChatModal } from '@/components/chats/CreateChatModal'
import { DeleteChatModal } from '@/components/chats/DeleteChatModal'

// Types
interface Chat {
  id: string
  title: string
  domain_id: string
  domain_name: string
  message_count: number
  created_at: string
  updated_at: string
  status: 'active' | 'archived' | 'deleted'
  last_message?: {
    content: string
    role: 'user' | 'assistant'
    timestamp: string
  }
}

interface ChatFilters {
  search: string
  domain: string
  status: string
  sortBy: 'title' | 'created_at' | 'updated_at' | 'message_count'
  sortOrder: 'asc' | 'desc'
}

export const Chats: React.FC = () => {
  const [filters, setFilters] = useState<ChatFilters>({
    search: '',
    domain: '',
    status: '',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  })
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null)
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  
  const queryClient = useQueryClient()

  // Fetch chats
  const { data: chats = [], isLoading, error } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: () => api.get<Chat[]>('/chats'),
    staleTime: 30000, // 30 seconds
  })

  // Fetch domains for filter
  const { data: domains = [] } = useQuery({
    queryKey: queryKeys.domains,
    queryFn: () => api.get<any[]>('/domains'),
    staleTime: 60000, // 1 minute
  })

  // Delete chat mutation
  const deleteMutation = useMutation({
    mutationKey: mutationKeys.deleteChat(''),
    mutationFn: (chatId: string) => api.delete(`/chats/${chatId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats })
      setDeleteChat(null)
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (chatIds: string[]) => 
      Promise.all(chatIds.map(id => api.delete(`/chats/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats })
      setSelectedChats(new Set())
    },
  })

  // Filtered and sorted chats
  const filteredChats = useMemo(() => {
    let filtered = chats.filter(chat => {
      const matchesSearch = chat.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          (chat.last_message?.content && chat.last_message.content.toLowerCase().includes(filters.search.toLowerCase()))
      const matchesDomain = !filters.domain || chat.domain_id === filters.domain
      const matchesStatus = !filters.status || chat.status === filters.status
      return matchesSearch && matchesDomain && matchesStatus
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
        case 'message_count':
          aValue = a.message_count
          bValue = b.message_count
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [chats, filters])

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set())
    } else {
      setSelectedChats(new Set(filteredChats.map(c => c.id)))
    }
  }

  const handleSelectChat = (chatId: string) => {
    const newSelected = new Set(selectedChats)
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId)
    } else {
      newSelected.add(chatId)
    }
    setSelectedChats(newSelected)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedChats.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedChats))
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'archived': return 'secondary'
      case 'deleted': return 'error'
      default: return 'secondary'
    }
  }

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">Error loading chats</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your chat conversations and RAG interactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedChats.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected ({selectedChats.size})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search chats and messages..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search className="h-4 w-4" />}
                fullWidth
              />
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
                <option value="updated_at-desc">Recently Updated</option>
                <option value="updated_at-asc">Oldest Updated</option>
                <option value="created_at-desc">Newest Created</option>
                <option value="created_at-asc">Oldest Created</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="message_count-desc">Most Messages</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Chats List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? 'Loading...' : `${filteredChats.length} Chat${filteredChats.length !== 1 ? 's' : ''}`}
            </h3>
            {filteredChats.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={selectedChats.size === filteredChats.length}
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
              <div className="mt-2 text-gray-500">Loading chats...</div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-lg font-medium">No chats found</div>
              <div className="text-gray-400 mt-2">
                {filters.search || filters.domain ? 'Try adjusting your filters' : 'Start your first conversation to get started'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={cn(
                    "border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150",
                    selectedChats.has(chat.id) && "bg-primary-50 border-primary-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedChats.has(chat.id)}
                        onChange={() => handleSelectChat(chat.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {chat.title}
                          </h4>
                          <Badge variant={getStatusVariant(chat.status)}>
                            {chat.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {chat.domain_name}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {chat.message_count} message{chat.message_count !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created {formatDate(chat.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Updated {formatDate(chat.updated_at)}
                          </div>
                        </div>
                        
                        {chat.last_message && (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500">
                                {chat.last_message.role === 'user' ? 'You' : 'Assistant'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(chat.last_message.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-700">
                              {truncateText(chat.last_message.content, 150)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Continue Chat"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View Chat"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Edit Chat"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Chat"
                        onClick={() => setDeleteChat(chat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <CreateChatModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      {deleteChat && (
        <DeleteChatModal
          chat={deleteChat}
          open={!!deleteChat}
          onClose={() => setDeleteChat(null)}
          onConfirm={() => {
            deleteMutation.mutate(deleteChat.id)
          }}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

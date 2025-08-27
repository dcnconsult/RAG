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
  Globe, 
  FileText, 
  MessageSquare, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock
} from 'lucide-react'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { CreateDomainModal } from '@/components/domains/CreateDomainModal'
import { DeleteDomainModal } from '@/components/domains/DeleteDomainModal'
import { cn } from '@/lib/utils'

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
}

interface DomainFilters {
  search: string
  status: string
  sortBy: 'name' | 'created_at' | 'document_count' | 'chat_count'
  sortOrder: 'asc' | 'desc'
}

export const Domains: React.FC = () => {
  const [filters, setFilters] = useState<DomainFilters>({
    search: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteDomain, setDeleteDomain] = useState<Domain | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set())
  
  const queryClient = useQueryClient()

  // Fetch domains
  const { data: domains = [], isLoading, error } = useQuery({
    queryKey: queryKeys.domains,
    queryFn: () => api.get<Domain[]>('/domains'),
    staleTime: 30000, // 30 seconds
  })

  // Delete domain mutation
  const deleteMutation = useMutation({
    mutationKey: mutationKeys.deleteDomain,
    mutationFn: (domainId: string) => api.delete(`/domains/${domainId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains })
      setDeleteDomain(null)
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (domainIds: string[]) => 
      Promise.all(domainIds.map(id => api.delete(`/domains/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains })
      setSelectedDomains(new Set())
    },
  })

  // Filtered and sorted domains
  const filteredDomains = useMemo(() => {
    let filtered = domains.filter(domain => {
      const matchesSearch = domain.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          domain.description.toLowerCase().includes(filters.search.toLowerCase())
      const matchesStatus = !filters.status || domain.status === filters.status
      return matchesSearch && matchesStatus
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
        case 'document_count':
          aValue = a.document_count
          bValue = b.document_count
          break
        case 'chat_count':
          aValue = a.chat_count
          bValue = b.chat_count
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
  }, [domains, filters])

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedDomains.size === filteredDomains.length) {
      setSelectedDomains(new Set())
    } else {
      setSelectedDomains(new Set(filteredDomains.map(d => d.id)))
    }
  }

  const handleSelectDomain = (domainId: string) => {
    const newSelected = new Set(selectedDomains)
    if (newSelected.has(domainId)) {
      newSelected.delete(domainId)
    } else {
      newSelected.add(domainId)
    }
    setSelectedDomains(newSelected)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedDomains.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedDomains))
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

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'processing': return 'warning'
      default: return 'secondary'
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">Error loading domains</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your knowledge domains and organize your content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedDomains.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected ({selectedDomains.size})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Domain
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search domains..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="processing">Processing</option>
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
                <option value="document_count-desc">Most Documents</option>
                <option value="chat_count-desc">Most Chats</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? 'Loading...' : `${filteredDomains.length} Domain${filteredDomains.length !== 1 ? 's' : ''}`}
            </h3>
            {filteredDomains.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={selectedDomains.size === filteredDomains.length}
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
              <div className="mt-2 text-gray-500">Loading domains...</div>
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-lg font-medium">No domains found</div>
              <div className="text-gray-400 mt-2">
                {filters.search || filters.status ? 'Try adjusting your filters' : 'Create your first domain to get started'}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {filteredDomains.map((domain) => (
                    <tr 
                      key={domain.id} 
                      className={cn(
                        "hover:bg-gray-50 transition-colors duration-150",
                        selectedDomains.has(domain.id) && "bg-primary-50"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDomains.has(domain.id)}
                            onChange={() => handleSelectDomain(domain.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{domain.name}</div>
                            <div className="text-sm text-gray-500">{domain.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {domain.document_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                          {domain.chat_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(domain.status)}>
                          {domain.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(domain.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Domain"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit Domain"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Domain"
                            onClick={() => setDeleteDomain(domain)}
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
      <CreateDomainModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      {deleteDomain && (
        <DeleteDomainModal
          domain={deleteDomain}
          open={!!deleteDomain}
          onClose={() => setDeleteDomain(null)}
          onConfirm={() => {
            deleteMutation.mutate(deleteDomain.id)
          }}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Plus, 
  Globe, 
  Trash2,
  Search,
  Eye,
  Edit
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
  const { data: domains = [], isLoading, error } = useQuery<Domain[]>({
    queryKey: queryKeys.domains,
    queryFn: () => api.get<Domain[]>('/domains'),
    staleTime: 30000, // 30 seconds
  })

  // Delete domain mutation
  const deleteMutation = useMutation<void, unknown, string>({
    mutationKey: mutationKeys.deleteDomain(''),
    mutationFn: (domainId: string) => api.delete(`/domains/${domainId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains })
      setDeleteDomain(null)
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation<void, unknown, string[]>({
    mutationFn: async (domainIds: string[]) => {
      await Promise.all(domainIds.map(id => api.delete(`/domains/${id}`)))
    },
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
      const [valueA, valueB] = (() => {
        switch (filters.sortBy) {
          case 'name':
            return [a.name.toLowerCase(), b.name.toLowerCase()] as const
          case 'created_at':
            return [
              new Date(a.created_at).getTime(),
              new Date(b.created_at).getTime(),
            ] as const
          case 'document_count':
            return [a.document_count, b.document_count] as const
          case 'chat_count':
            return [a.chat_count, b.chat_count] as const
          default:
            return [a.name.toLowerCase(), b.name.toLowerCase()] as const
        }
      })()

      if (valueA === valueB) {
        return 0
      }

      const comparison = valueA > valueB ? 1 : -1
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [domains, filters])


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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Domain Management</h1>
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-base sm:text-lg font-medium text-gray-700">Domains</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="btn-primary"
            >
              Add
            </Button>
          </div>
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
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="card-modern">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* My Domains Section */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">My Domains</h3>
        
        {isLoading ? (
          <div className="grid-mobile">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-modern animate-pulse">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-base sm:text-lg font-medium">No domains found</div>
            <div className="text-gray-400 mt-2 text-sm">
              {filters.search || filters.status ? 'Try adjusting your filters' : 'Create your first domain to get started'}
            </div>
          </div>
        ) : (
          <div className="grid-mobile">
            {filteredDomains.map((domain) => (
              <Card 
                key={domain.id} 
                className={cn(
                  "card-modern cursor-pointer",
                  selectedDomains.has(domain.id) && "ring-2 ring-blue-400 bg-blue-50"
                )}
                onClick={() => handleSelectDomain(domain.id)}
              >
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{domain.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Last updated {formatDate(domain.updated_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="View Domain"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="Edit Domain"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Domain"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDomain(domain)
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

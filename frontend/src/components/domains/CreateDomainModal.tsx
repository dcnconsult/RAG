import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Globe, Settings } from 'lucide-react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
import { cn } from '@/lib/utils'

// Validation schema
const createDomainSchema = z.object({
  name: z.string()
    .min(3, 'Domain name must be at least 3 characters')
    .max(100, 'Domain name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Domain name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  settings: z.object({
    chunk_size: z.number().min(100).max(2000).optional(),
    chunk_overlap: z.number().min(0).max(500).optional(),
    embedding_model: z.string().optional(),
    max_tokens: z.number().min(100).max(4000).optional(),
  }).optional(),
})

type CreateDomainFormData = z.infer<typeof createDomainSchema>

interface CreateDomainModalProps {
  open: boolean
  onClose: () => void
}

export const CreateDomainModal: React.FC<CreateDomainModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateDomainFormData>({
    resolver: zodResolver(createDomainSchema),
    defaultValues: {
      settings: {
        chunk_size: 1000,
        chunk_overlap: 200,
        embedding_model: 'text-embedding-ada-002',
        max_tokens: 2000,
      }
    }
  })

  // Create domain mutation
  const createMutation = useMutation({
    mutationKey: mutationKeys.createDomain,
    mutationFn: (data: CreateDomainFormData) => api.post('/domains', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains })
      reset()
      onClose()
    },
  })

  const onSubmit = (data: CreateDomainFormData) => {
    createMutation.mutate(data)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
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
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Domain</h3>
                    <p className="text-sm text-gray-500">Set up a new knowledge domain for your RAG system</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm',
                      activeTab === 'basic'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Globe className="h-4 w-4 inline mr-2" />
                    Basic Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('advanced')}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm',
                      activeTab === 'advanced'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Advanced Settings
                  </button>
                </nav>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardBody className="py-6">
                {activeTab === 'basic' ? (
                  <div className="space-y-6">
                    {/* Domain Name */}
                    <div>
                      <Input
                        label="Domain Name"
                        placeholder="Enter domain name (e.g., Company Knowledge Base)"
                        error={errors.name?.message}
                        fullWidth
                        {...register('name')}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Choose a descriptive name that represents the content and purpose of this domain
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          {...register('description')}
                          rows={4}
                          className={cn(
                            'block w-full rounded-lg border shadow-sm transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'placeholder:text-gray-400 px-3 py-2.5 text-sm',
                            errors.description
                              ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          )}
                          placeholder="Describe what this domain will contain and how it will be used..."
                        />
                      </div>
                      {errors.description && (
                        <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Provide a clear description to help users understand the scope and purpose of this domain
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Domain Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium text-gray-900">
                            {watch('name') || 'Domain Name'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Description:</span>
                          <span className="font-medium text-gray-900 max-w-xs truncate">
                            {watch('description') || 'Domain description will appear here'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Chunk Size */}
                    <div>
                      <Input
                        label="Chunk Size"
                        type="number"
                        placeholder="1000"
                        helperText="Number of characters per text chunk (100-2000)"
                        error={errors.settings?.chunk_size?.message}
                        fullWidth
                        {...register('settings.chunk_size', { valueAsNumber: true })}
                      />
                    </div>

                    {/* Chunk Overlap */}
                    <div>
                      <Input
                        label="Chunk Overlap"
                        type="number"
                        placeholder="200"
                        helperText="Number of characters to overlap between chunks (0-500)"
                        error={errors.settings?.chunk_overlap?.message}
                        fullWidth
                        {...register('settings.chunk_overlap', { valueAsNumber: true })}
                      />
                    </div>

                    {/* Embedding Model */}
                    <div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Embedding Model
                        </label>
                        <select
                          {...register('settings.embedding_model')}
                          className="block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="text-embedding-ada-002">OpenAI Ada-002 (1536 dimensions)</option>
                          <option value="text-embedding-3-small">OpenAI Embedding-3-Small (1536 dimensions)</option>
                          <option value="text-embedding-3-large">OpenAI Embedding-3-Large (3072 dimensions)</option>
                          <option value="cohere-embed-english-v3.0">Cohere Embed English v3.0 (4096 dimensions)</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Choose the embedding model that best fits your use case and budget
                      </p>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <Input
                        label="Max Response Tokens"
                        type="number"
                        placeholder="2000"
                        helperText="Maximum tokens for RAG responses (100-4000)"
                        error={errors.settings?.max_tokens?.message}
                        fullWidth
                        {...register('settings.max_tokens', { valueAsNumber: true })}
                      />
                    </div>

                    {/* Advanced Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Settings className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Advanced Configuration</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>These settings affect how your documents are processed and how the RAG system generates responses.</p>
                            <p className="mt-1">You can modify these settings later in the domain configuration.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  <div className="flex gap-3">
                    {activeTab === 'basic' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('advanced')}
                        disabled={isSubmitting}
                      >
                        Advanced Settings
                      </Button>
                    )}
                    {activeTab === 'advanced' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('basic')}
                        disabled={isSubmitting}
                      >
                        Back to Basic
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Create Domain
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

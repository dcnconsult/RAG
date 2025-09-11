import React from 'react'
import { X, AlertTriangle, Trash2, Globe, FileText, MessageSquare } from 'lucide-react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Domain {
  id: string
  name: string
  description: string
  document_count: number
  chat_count: number
}

interface DeleteDomainModalProps {
  domain: Domain
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export const DeleteDomainModal: React.FC<DeleteDomainModalProps> = ({
  domain,
  open,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!open) return null

  const hasContent = domain.document_count > 0 || domain.chat_count > 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-error-500 to-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Domain</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>

            <CardBody className="py-6">
              <div className="space-y-4">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Warning</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>You are about to permanently delete the domain <strong>"{domain.name}"</strong>.</p>
                        {hasContent && (
                          <p className="mt-1">This will also remove all associated documents and chat history.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Domain Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Globe className="h-5 w-5 text-gray-400 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">Domain Information</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium text-gray-900">{domain.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span className="font-medium text-gray-900 max-w-xs truncate">
                        {domain.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Summary */}
                {hasContent && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Content to be Deleted</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>{domain.document_count} document{domain.document_count !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span>{domain.chat_count} chat{domain.chat_count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmation Input */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      To confirm deletion, type <strong>"{domain.name}"</strong> below:
                    </p>
                    <input
                      type="text"
                      id="confirm-delete"
                      className="block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2.5 text-sm focus:ring-2 focus:ring-error-500 focus:border-error-500 text-center"
                      placeholder="Enter domain name to confirm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value === domain.name) {
                          onConfirm()
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>

            <CardFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex w-full justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={onConfirm}
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Domain
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

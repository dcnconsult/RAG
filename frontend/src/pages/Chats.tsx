import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  MessageSquare, 
  User,
  Brain,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'
import { queryKeys, mutationKeys } from '@/lib/query-client'
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


export const Chats: React.FC = () => {
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null)
  
  const queryClient = useQueryClient()

  // Fetch chats
  const { error } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: () => api.get<Chat[]>('/chats'),
    staleTime: 30000, // 30 seconds
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
    <div className="space-y-4 sm:space-y-6">
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chat</h1>
      </div>

      {/* Chat Interface */}
      <div className="card-modern flex flex-col h-[500px] sm:h-[600px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* AI Assistant Message */}
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </div>
            <div className="chat-message chat-message-ai">
              <p className="text-sm text-gray-700">
                can I assist you today with your knowledge domain?
              </p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex items-start space-x-3 justify-end">
            <div className="chat-message chat-message-user">
              <p className="text-sm text-gray-900">
                Hi! Can you tell me about the latest developments in AI?
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </div>

          {/* AI Assistant Response */}
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </div>
            <div className="chat-message chat-message-ai">
              <p className="text-sm text-gray-700">
                Certainly! Recent advancements in AI include breakthroughs in natural language processing, computer vision, and reinforcement learning. Would you like more details on a specific area?
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              title="Attach File"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <div className="flex-1">
              <Input
                placeholder="Type your message..."
                className="w-full text-sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              className="btn-primary h-7 w-7 sm:h-8 sm:w-8 p-0"
              title="Send Message"
            >
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>


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

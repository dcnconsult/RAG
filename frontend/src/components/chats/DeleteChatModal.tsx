import type { FC } from 'react'

export type DeleteChatModalProps = {
  chat: { id: string; title?: string }
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

// Minimal stub for MVP build; replace with real modal implementation later
export const DeleteChatModal: FC<DeleteChatModalProps> = () => null



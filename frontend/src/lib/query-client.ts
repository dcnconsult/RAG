export const queryKeys = {
  domains: ['domains'] as const,
  domain: (id: string) => ['domains', id] as const,
  documents: ['documents'] as const,
  chats: ['chats'] as const,
}

export const mutationKeys = {
  createDomain: ['domains', 'create'] as const,
  deleteDomain: (id: string) => ['domains', 'delete', id] as const,
  uploadDocument: ['documents', 'upload'] as const,
  deleteDocument: (id: string) => ['documents', 'delete', id] as const,
  deleteChat: (id: string) => ['chats', 'delete', id] as const,
}

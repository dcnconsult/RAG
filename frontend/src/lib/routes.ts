const withId = (base: string) => (id = ':id') => `${base}/${id}`

export const routes = {
  home: '/',
  dashboard: '/dashboard',
  enhancedDashboard: '/dashboard/enhanced',
  domains: '/domains',
  domainDetails: withId('/domains'),
  documents: '/documents',
  documentDetails: withId('/documents'),
  chats: '/chats',
  chat: '/chat',
  chatDetails: withId('/chats'),
  rag: '/rag',
  search: '/search',
  externalModels: '/external-models',
  settings: '/settings',
  styleGuide: '/style-guide',
  notFound: '*',
} as const

export type Routes = typeof routes

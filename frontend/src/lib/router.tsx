import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { EnhancedDashboard } from '@/pages/EnhancedDashboard'
import { Domains } from '@/pages/Domains'
import { DomainDetails } from '@/pages/DomainDetails'
import { Documents } from '@/pages/Documents'
import { DocumentDetails } from '@/pages/DocumentDetails'
import { Chats } from '@/pages/Chats'
import { ChatDetails } from '@/pages/ChatDetails'
import { Search } from '@/pages/Search'
import { RAG } from '@/pages/RAG'
import { ExternalModels } from '@/pages/ExternalModels'
import { Settings } from '@/pages/Settings'
import { StyleGuide } from '@/pages/StyleGuide'
import { NotFound } from '@/pages/NotFound'
import { routes } from './routes'

const trimLeadingSlash = (path: string) => path.replace(/^\//, '')

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={routes.home} element={<Layout />}>
      <Route index element={<EnhancedDashboard />} />
      <Route path={trimLeadingSlash(routes.dashboard)} element={<Dashboard />} />
      <Route path={trimLeadingSlash(routes.enhancedDashboard)} element={<EnhancedDashboard />} />
      <Route path={trimLeadingSlash(routes.domains)} element={<Domains />} />
      <Route path={trimLeadingSlash(routes.domainDetails())} element={<DomainDetails />} />
      <Route path={trimLeadingSlash(routes.documents)} element={<Documents />} />
      <Route path={trimLeadingSlash(routes.documentDetails())} element={<DocumentDetails />} />
      <Route path={trimLeadingSlash(routes.chats)} element={<Chats />} />
      <Route path={trimLeadingSlash(routes.chat)} element={<ChatDetails />} />
      <Route path={trimLeadingSlash(routes.chatDetails())} element={<ChatDetails />} />
      <Route path={trimLeadingSlash(routes.search)} element={<Search />} />
      <Route path={trimLeadingSlash(routes.rag)} element={<RAG />} />
      <Route path={trimLeadingSlash(routes.externalModels)} element={<ExternalModels />} />
      <Route path={trimLeadingSlash(routes.settings)} element={<Settings />} />
      <Route path={trimLeadingSlash(routes.styleGuide)} element={<StyleGuide />} />
      <Route path={routes.notFound} element={<NotFound />} />
    </Route>
  )
)

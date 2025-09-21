import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { routes } from '@/lib/routes'
import {
  Home,
  Globe,
  FileText,
  MessageSquare,
  Search,
  Brain,
  Database,
  BarChart3,
  Users,
  Shield,
  Settings,
  Sparkles,
  X
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Dashboard', href: routes.dashboard, icon: Home },
  { name: 'Domains', href: routes.domains, icon: Globe },
  { name: 'Documents', href: routes.documents, icon: FileText },
  { name: 'Chats', href: routes.chats, icon: MessageSquare },
  { name: 'Search', href: routes.search, icon: Search },
  { name: 'RAG', href: routes.rag, icon: Brain },
  { name: 'External Models', href: routes.externalModels, icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: routes.settings, icon: Settings },
]

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation()

  const renderNavigation = (onNavigate?: () => void) =>
    navigation.map((item) => {
      const isActive = location.pathname === item.href ||
        (item.href !== routes.dashboard && location.pathname.startsWith(item.href))

      return (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={() => onNavigate?.()}
          className={cn(
            'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/70 hover:shadow-sm'
          )}
        >
          <item.icon
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'
            )}
          />
          <span>{item.name}</span>
        </NavLink>
      )
    })

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform px-4 transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-900">RAG Explorer</span>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Control Center</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-600"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Navigation
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            {renderNavigation(() => setOpen(false))}
          </nav>

          <div className="mt-6 rounded-2xl border border-blue-100/70 bg-blue-50/80 p-4 text-sm text-slate-600 shadow-inner">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Workspace Health</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Storage usage at 68%. Keep performance optimal by maintaining healthy domains.
            </p>
            <div className="mt-3 h-2 rounded-full bg-white/70">
              <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            </div>
          </div>

          <div className="mt-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            RAG Explorer v2.1
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col lg:px-6 lg:py-8">
        <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_24px_45px_-25px_rgba(15,23,42,0.4)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-white shadow-lg">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-900">RAG Explorer</span>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-500/80">Knowledge Studio</p>
            </div>
          </div>

          <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Navigation
          </div>

          <nav className="mt-4 flex-1 space-y-2 pr-2">
            {renderNavigation()}
          </nav>

          <div className="mt-6 rounded-2xl border border-blue-100/60 bg-blue-50/70 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Workspace Insights</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              You are operating in enterprise mode. Monitor ingestion and chat adoption from the dashboard.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>Storage Utilization</span>
                  <span>68%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/70">
                  <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-blue-600">
                <Sparkles className="h-4 w-4" />
                <span>Pro tip: Archive inactive domains quarterly.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            RAG Explorer v2.1
          </div>
        </div>
      </div>
    </>
  )
}

import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bell,
  Search,
  User,
  Settings,
  Menu,
  Sparkles,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type HeaderProps = {
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Experience Center'
      case '/domains':
        return 'Domains'
      case '/documents':
        return 'Documents'
      case '/chat':
        return 'Chat'
      case '/settings':
        return 'Settings'
      default:
        return 'RAG Explorer'
    }
  }

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/':
        return 'Monitor ingestion, search performance, and knowledge activation across every domain in real time.'
      case '/domains':
        return 'Curate, organize, and secure your knowledge domains with effortless controls.'
      case '/documents':
        return 'Upload, track, and validate content pipelines powering your RAG experiences.'
      case '/chat':
        return 'Review conversations, unlock insights, and empower teams with guided responses.'
      case '/settings':
        return 'Personalize policies, integrations, and workspace preferences for your team.'
      default:
        return 'Your unified control room for AI powered knowledge discovery.'
    }
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-6 sm:px-6 lg:px-12">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-11 w-11 rounded-2xl border border-white/60 bg-white/80 p-0 text-slate-500 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 lg:hidden"
                aria-label="Open navigation menu"
                onClick={onMenuClick}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-500/80">Workspace</span>
                  <span className="hidden items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 md:inline-flex">
                    <Sparkles className="h-3 w-3" />
                    Live
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {getPageTitle()}
                  </h1>
                </div>
                <p className="mt-3 max-w-xl text-sm text-slate-500">
                  {getPageDescription()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end">
            <div className="relative hidden w-full max-w-md md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search domains, documents, or chats"
                className="w-full rounded-full border border-white/60 bg-white/80 py-3 pl-12 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-11 w-11 rounded-2xl border border-white/60 bg-white/80 p-0 text-slate-500 shadow-sm"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="relative h-11 w-11 rounded-2xl border border-white/60 bg-white/80 p-0 text-slate-500 shadow-sm hover:border-blue-200 hover:text-blue-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-br from-rose-500 to-red-500" />
              </Button>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="sm"
                className="hidden h-11 w-11 rounded-2xl border border-white/60 bg-white/80 p-0 text-slate-500 shadow-sm hover:border-blue-200 hover:text-blue-600 md:inline-flex"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Upload
              </Button>

              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-semibold text-white">
                  <span>SC</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">Sarah Collins</span>
                  <span className="text-xs text-slate-500">Workspace Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-2xl border border-transparent p-0 text-slate-400 hover:text-blue-600"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

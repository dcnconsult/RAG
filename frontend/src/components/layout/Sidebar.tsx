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

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">RAG Explorer</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== routes.dashboard && location.pathname.startsWith(item.href))
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              RAG Explorer v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">RAG Explorer</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== routes.dashboard && location.pathname.startsWith(item.href))
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              RAG Explorer v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

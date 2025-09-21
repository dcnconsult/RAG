import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { routes } from '@/lib/routes'
import { 
  Globe, 
  MessageSquare, 
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Domains', href: routes.domains, icon: Globe },
  { name: 'Chat', href: routes.chats, icon: MessageSquare },
  { name: 'Settings', href: routes.settings, icon: Settings },
]

export const BottomNavigation: React.FC = () => {
  const location = useLocation()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center lg:hidden">
      <div className="pointer-events-auto flex w-[calc(100%-3rem)] max-w-xl items-center justify-between rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== routes.domains && location.pathname.startsWith(item.href))

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex flex-1 items-center justify-center"
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200',
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                      : 'border-white/50 bg-white/80 text-slate-500 shadow-sm'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-current')} />
                </div>
                <span>{item.name}</span>
              </div>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}


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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden shadow-lg">
      <div className="grid grid-cols-3 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== routes.domains && location.pathname.startsWith(item.href))
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isActive ? 'text-yellow-600' : 'text-gray-400'
                )}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}


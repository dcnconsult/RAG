import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50">
      {/* Decorative background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-[26rem] w-[26rem] rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-blue-200/25 blur-[120px]" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="relative z-10 transition-[padding] duration-300 lg:pl-80">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="px-4 pb-32 pt-6 sm:px-6 lg:px-12 lg:pb-16">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  )
}

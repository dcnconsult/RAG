import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'
import { AppRoutes } from '@/lib/router'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SkipToContent } from '@/components/ui/Accessibility'
import { ReducedMotion } from '@/components/ui/Accessibility'
import { MobileBottomNav } from '@/components/ui/MobileNavigation'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <SkipToContent />
              <ReducedMotion>
                <div className="flex h-screen">
                  {/* Sidebar - Hidden on mobile */}
                  <div className="hidden lg:block">
                    <Sidebar />
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    
                    <main 
                      id="main-content"
                      className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6"
                      tabIndex={-1}
                    >
                      <AppRoutes />
                    </main>
                  </div>
                </div>
                
                {/* Mobile bottom navigation */}
                <MobileBottomNav />
              </ReducedMotion>
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

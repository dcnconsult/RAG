import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Globe, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '@/lib/routes'

// Import our new components
import { MetricCard, AnalyticsChart, DonutChart, ActivityFeed } from '@/components/ui/DataVisualization'
import { LoadingSpinner, ProgressBar, StatusIndicator } from '@/components/ui/LoadingStates'
import { NotificationCenter, NotificationToaster, showNotification } from '@/components/ui/NotificationSystem'

export const EnhancedDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Document Processing Complete',
      message: 'Successfully processed 15 new documents in AI Research domain',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false
    },
    {
      id: '2', 
      title: 'System Update Available',
      message: 'A new version of RAG Explorer is available for update',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '3',
      title: 'High Memory Usage Detected',
      message: 'Vector database is using 85% of allocated memory',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true
    }
  ])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  // Sample data for showcase
  const metrics = [
    {
      title: 'Total Domains',
      value: '24',
      change: 15,
      changeType: 'positive' as const,
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      trend: [
        { value: 18 }, { value: 20 }, { value: 19 }, { value: 22 }, { value: 24 }
      ]
    },
    {
      title: 'Documents Processed',
      value: '1,847',
      change: 23,
      changeType: 'positive' as const,
      icon: <FileText className="h-5 w-5 text-green-600" />,
      trend: [
        { value: 1200 }, { value: 1400 }, { value: 1600 }, { value: 1700 }, { value: 1847 }
      ]
    },
    {
      title: 'Active Sessions',
      value: '156',
      change: -8,
      changeType: 'negative' as const,
      icon: <MessageSquare className="h-5 w-5 text-purple-600" />,
      trend: [
        { value: 180 }, { value: 170 }, { value: 165 }, { value: 160 }, { value: 156 }
      ]
    },
    {
      title: 'Query Performance',
      value: '0.8s',
      change: 12,
      changeType: 'positive' as const,
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      trend: [
        { value: 1.2 }, { value: 1.0 }, { value: 0.9 }, { value: 0.85 }, { value: 0.8 }
      ]
    }
  ]

  const analyticsData = [
    { name: 'Jan', value: 400, queries: 240, documents: 24 },
    { name: 'Feb', value: 300, queries: 138, documents: 22 },
    { name: 'Mar', value: 200, queries: 980, documents: 19 },
    { name: 'Apr', value: 278, queries: 390, documents: 30 },
    { name: 'May', value: 189, queries: 480, documents: 35 },
    { name: 'Jun', value: 239, queries: 380, documents: 42 },
    { name: 'Jul', value: 349, queries: 430, documents: 38 }
  ]

  const domainDistribution = [
    { name: 'AI Research', value: 35, color: '#2563eb' },
    { name: 'Product Docs', value: 28, color: '#3b82f6' },
    { name: 'Legal', value: 20, color: '#60a5fa' },
    { name: 'Marketing', value: 17, color: '#93c5fd' }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'document_upload',
      message: 'New research paper uploaded to AI Research domain',
      timestamp: '2 minutes ago',
      status: 'success' as const,
      user: 'Dr. Sarah Chen'
    },
    {
      id: '2',
      type: 'query_processed',
      message: 'Complex query processed successfully in 0.7s',
      timestamp: '5 minutes ago',
      status: 'info' as const,
      user: 'System'
    },
    {
      id: '3',
      type: 'model_update',
      message: 'Vector embeddings updated for Product Docs domain',
      timestamp: '12 minutes ago',
      status: 'warning' as const,
      user: 'Background Process'
    },
    {
      id: '4',
      type: 'user_action',
      message: 'New chat session started in Legal domain',
      timestamp: '18 minutes ago',
      status: 'info' as const,
      user: 'Mike Johnson'
    }
  ]

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      showNotification.success('Dashboard loaded successfully', 'All systems are operational')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleNotificationAction = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="showcase-header rounded-2xl text-center animate-pulse">
          <div className="h-8 bg-blue-400 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-blue-300 rounded w-3/4 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-modern animate-pulse p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {/* Notification System */}
      <NotificationToaster />
      
      {/* Header with Notifications */}
      <motion.div 
        className="showcase-header rounded-2xl text-center relative"
        variants={itemVariants}
      >
        <div className="absolute top-4 right-4">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleNotificationAction}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDismiss={handleDismissNotification}
          />
        </div>
        
        <motion.h1 
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          RAG Explorer Analytics
        </motion.h1>
        
        <motion.p 
          className="text-blue-100 text-lg max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Enterprise-grade AI knowledge management with real-time insights and professional analytics
        </motion.p>
        
        {/* System Status Indicators */}
        <motion.div 
          className="flex justify-center space-x-8 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center space-x-2">
            <StatusIndicator status="online" />
            <span>Database</span>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIndicator status="processing" />
            <span>AI Models</span>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIndicator status="online" />
            <span>Vector Store</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          variants={itemVariants}
        >
          <AnalyticsChart
            data={analyticsData}
            type="area"
            height={400}
            gradientFill={true}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DonutChart
            data={domainDistribution}
            title="Domain Distribution"
            centerText="100"
            centerSubtext="Total Domains"
          />
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Performance</h3>
          <div className="space-y-4">
            <ProgressBar progress={92} label="Average Response Time" />
            <ProgressBar progress={98} label="Success Rate" />
            <ProgressBar progress={85} label="Cache Hit Rate" />
          </div>
        </div>
        
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <ProgressBar progress={45} showLabel={false} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium">67%</span>
            </div>
            <ProgressBar progress={67} showLabel={false} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium">34%</span>
            </div>
            <ProgressBar progress={34} showLabel={false} />
          </div>
        </div>
        
        <ActivityFeed activities={recentActivities} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="card-modern p-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Create Domain', icon: Globe, href: routes.domains, color: 'bg-blue-500' },
            { name: 'Upload Documents', icon: FileText, href: routes.documents, color: 'bg-green-500' },
            { name: 'Start Chat', icon: MessageSquare, href: routes.chats, color: 'bg-purple-500' },
            { name: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'bg-orange-500' }
          ].map((action) => (
            <motion.div
              key={action.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={action.href}
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`${action.color} p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
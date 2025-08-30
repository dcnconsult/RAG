import React from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Globe, 
  FileText, 
  MessageSquare, 
  Brain, 
  Plus,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '@/lib/routes'

export const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Domains',
      value: '12',
      change: '+2',
      changeType: 'increase' as const,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Documents',
      value: '1,234',
      change: '+156',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Active Chats',
      value: '89',
      change: '+12',
      changeType: 'increase' as const,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'RAG Queries',
      value: '2,456',
      change: '+89',
      changeType: 'increase' as const,
      icon: Brain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'document_upload',
      message: 'New document uploaded to "AI Research" domain',
      time: '2 minutes ago',
      status: 'completed',
    },
    {
      id: 2,
      type: 'rag_query',
      message: 'RAG query processed successfully',
      time: '5 minutes ago',
      status: 'completed',
    },
    {
      id: 3,
      type: 'domain_created',
      message: 'New domain "Machine Learning" created',
      time: '1 hour ago',
      status: 'completed',
    },
    {
      id: 4,
      type: 'chat_started',
      message: 'New chat session started',
      time: '2 hours ago',
      status: 'active',
    },
  ]

  const quickActions = [
    {
      name: 'Create Domain',
      description: 'Set up a new knowledge domain',
      icon: Globe,
      href: routes.domains,
      color: 'bg-blue-500',
    },
    {
      name: 'Upload Document',
      description: 'Add new content to your domains',
      icon: FileText,
      href: routes.documents,
      color: 'bg-green-500',
    },
    {
      name: 'Start Chat',
      description: 'Begin a new conversation',
      icon: MessageSquare,
      href: routes.chats,
      color: 'bg-purple-500',
    },
    {
      name: 'RAG Query',
      description: 'Ask questions with context',
      icon: Brain,
      href: routes.rag,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back! Here's what's happening with your RAG system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-medium transition-shadow duration-200">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <Badge 
                      variant={stat.changeType === 'increase' ? 'success' : 'error'}
                      size="sm"
                      className="ml-2"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Get started with common tasks</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className={`flex-shrink-0 ${action.color} p-2 rounded-lg`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest updates from your system</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <Badge 
                  variant={activity.status === 'completed' ? 'success' : 'primary'}
                  size="sm"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardBody>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View all activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          <p className="text-sm text-gray-500">Current status of your RAG infrastructure</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Database</span>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Vector Store</span>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">External APIs</span>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

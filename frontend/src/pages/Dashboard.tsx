import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/lib/routes'

// Redirect to enhanced dashboard for showcase
export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate(routes.enhancedDashboard, { replace: true })
  }, [navigate])
  
  return null
}

// Keep the original dashboard as a backup
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Globe, 
  FileText, 
  MessageSquare, 
  Brain, 
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const OriginalDashboard: React.FC = () => {
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
      {/* Welcome Section */}
      <div className="showcase-header rounded-2xl text-center animate-fade-in">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
          Welcome to RAG Explorer
        </h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
          Professional AI-powered knowledge management and retrieval system designed for modern enterprises
        </p>
      </div>
      
      <div className="text-center -mt-8">  
        
        {/* Main Card */}
        <Card className="card-modern max-w-2xl mx-auto">
          <CardBody className="p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              RAG Explorer
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Manage your knowledge domains, upload documents, and interact with intelligent retrieval and chat interfaces.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-primary px-8 py-3 rounded-xl"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-8 py-3 rounded-xl"
              >
                Learn More
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="card-modern">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1 font-medium">{stat.name}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <Badge 
                      variant={stat.changeType === 'increase' ? 'success' : 'error'}
                      size="sm"
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="card-modern">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            <p className="text-sm text-slate-500">Get started with common tasks</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 hover:bg-blue-50"
              >
                <div className={`flex-shrink-0 ${action.color} p-3 rounded-lg`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-900">{action.name}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card className="card-modern">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-500">Latest updates from your system</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
                <Badge 
                  variant={activity.status === 'completed' ? 'success' : 'primary'}
                  size="sm"
                  className="text-xs"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardBody>
          <CardFooter className="pt-3">
            <Button variant="ghost" size="sm" className="w-full text-sm hover:bg-slate-100">
              View all activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* System Health */}
      <Card className="card-modern">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
          <p className="text-sm text-slate-500">Current status of your RAG infrastructure</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-700 font-medium">Database</span>
              <Badge variant="success" size="sm" className="text-xs">Healthy</Badge>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-700 font-medium">Vector Store</span>
              <Badge variant="success" size="sm" className="text-xs">Healthy</Badge>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-700 font-medium">External APIs</span>
              <Badge variant="success" size="sm" className="text-xs">Healthy</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

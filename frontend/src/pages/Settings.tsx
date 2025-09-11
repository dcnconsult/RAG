import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
// import { Switch } from '@/components/ui/Switch'
import { 
  ArrowLeft,
  Key,
  ChevronRight
} from 'lucide-react'

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      {/* LLM Integration Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">LLM Integration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">OpenAI API Key</label>
            <Input
              placeholder="Enter your OpenAI API Key"
              type="password"
              leftIcon={<Key className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Anthropic API Key</label>
            <Input
              placeholder="Enter your Anthropic API Key"
              type="password"
              leftIcon={<Key className="h-4 w-4" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Application Preferences Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Application Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Dark Mode Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Dark Mode</label>
              <p className="text-xs text-gray-500">Enable or disable dark mode.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">System</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Language Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <p className="text-xs text-gray-500">Choose the application language.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">English</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

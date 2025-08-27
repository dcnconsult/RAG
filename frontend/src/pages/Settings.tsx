import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your RAG system preferences and settings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">Settings page content will be implemented here.</p>
        </CardBody>
      </Card>
    </div>
  )
}

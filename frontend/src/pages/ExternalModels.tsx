import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export const ExternalModels: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">External Models</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage external LLM providers and configurations.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Model Management</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">External models page content will be implemented here.</p>
        </CardBody>
      </Card>
    </div>
  )
}

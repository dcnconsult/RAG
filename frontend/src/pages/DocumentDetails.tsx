import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export const DocumentDetails: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
        <p className="mt-2 text-sm text-gray-700">
          View and manage document information.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Document Information</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">Document details content will be implemented here.</p>
        </CardBody>
      </Card>
    </div>
  )
}

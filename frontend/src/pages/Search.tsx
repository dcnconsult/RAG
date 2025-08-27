import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export const Search: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-2 text-sm text-gray-700">
          Search across your domains and documents.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Search Interface</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">Search page content will be implemented here.</p>
        </CardBody>
      </Card>
    </div>
  )
}

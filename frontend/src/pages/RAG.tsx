import React from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export const RAG: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RAG System</h1>
        <p className="mt-2 text-sm text-gray-700">
          Interact with your RAG system and generate responses.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">RAG Interface</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">RAG page content will be implemented here.</p>
        </CardBody>
      </Card>
    </div>
  )
}

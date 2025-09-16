import React from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Type, 
  Layout, 
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Check
} from 'lucide-react'
import { MetricCard } from '@/components/ui/DataVisualization'
import { LoadingSpinner, ProgressBar } from '@/components/ui/LoadingStates'
import { showNotification } from '@/components/ui/NotificationSystem'

export const StyleGuide: React.FC = () => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null)

  // Professional color palette
  const colors = {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }

  const typography = [
    { name: 'Display Large', class: 'text-6xl font-bold', description: 'Hero headings, major announcements' },
    { name: 'Display Medium', class: 'text-5xl font-bold', description: 'Page titles, section headers' },
    { name: 'Display Small', class: 'text-4xl font-bold', description: 'Card titles, feature headers' },
    { name: 'Heading 1', class: 'text-3xl font-semibold', description: 'Main content headings' },
    { name: 'Heading 2', class: 'text-2xl font-semibold', description: 'Section headings' },
    { name: 'Heading 3', class: 'text-xl font-semibold', description: 'Subsection headings' },
    { name: 'Heading 4', class: 'text-lg font-medium', description: 'Component headings' },
    { name: 'Body Large', class: 'text-lg font-normal', description: 'Lead paragraphs, important body text' },
    { name: 'Body Medium', class: 'text-base font-normal', description: 'Default body text, descriptions' },
    { name: 'Body Small', class: 'text-sm font-normal', description: 'Secondary text, captions' },
    { name: 'Caption', class: 'text-xs font-medium', description: 'Labels, metadata, small UI text' }
  ]

  const components = [
    { name: 'Primary Button', element: <button className="btn-primary px-6 py-3 rounded-lg">Primary Action</button> },
    { name: 'Secondary Button', element: <button className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Secondary Action</button> },
    { name: 'Card', element: <div className="card-modern p-6 w-64"><h3 className="font-semibold mb-2">Card Title</h3><p className="text-gray-600">Card content with description</p></div> },
    { name: 'Loading Spinner', element: <LoadingSpinner size="md" /> },
    { name: 'Progress Bar', element: <div className="w-64"><ProgressBar progress={75} label="Progress Example" /></div> }
  ]

  const spacing = [
    { name: 'xs', value: '0.25rem', class: 'p-1' },
    { name: 'sm', value: '0.5rem', class: 'p-2' },
    { name: 'md', value: '1rem', class: 'p-4' },
    { name: 'lg', value: '1.5rem', class: 'p-6' },
    { name: 'xl', value: '2rem', class: 'p-8' },
    { name: '2xl', value: '3rem', class: 'p-12' }
  ]

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(text)
    showNotification.success(`${type} copied!`, `${text} copied to clipboard`)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="showcase-header rounded-2xl text-center">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">RAG Explorer Style Guide</h1>
        <p className="text-blue-100 text-lg max-w-3xl mx-auto">
          Comprehensive design system and component library for professional showcase applications
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <Palette className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Color Palette</h2>
        </div>
        
        <div className="space-y-8">
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {Object.entries(colors.primary).map(([shade, color]) => (
                <motion.div
                  key={shade}
                  className="space-y-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => copyToClipboard(color, `Primary ${shade}`)}
                >
                  <div 
                    className="w-full h-16 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {copiedColor === color && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900">{shade}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gray Scale */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gray Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {Object.entries(colors.gray).map(([shade, color]) => (
                <motion.div
                  key={shade}
                  className="space-y-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => copyToClipboard(color, `Gray ${shade}`)}
                >
                  <div 
                    className="w-full h-16 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {copiedColor === color && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900">{shade}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(colors.semantic).map(([name, color]) => (
                <motion.div
                  key={name}
                  className="space-y-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => copyToClipboard(color, name)}
                >
                  <div 
                    className="w-full h-16 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {copiedColor === color && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 capitalize">{name}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <Type className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
        </div>
        
        <div className="card-modern p-8 space-y-6">
          <p className="text-gray-600 mb-6">
            Our typography system uses Inter font family for optimal readability across all devices and sizes.
          </p>
          
          {typography.map((type) => (
            <div key={type.name} className="flex items-baseline space-x-6 py-3 border-b border-gray-100 last:border-b-0">
              <div className="w-32 flex-shrink-0">
                <div className="text-sm font-medium text-gray-900">{type.name}</div>
                <div className="text-xs text-gray-500">{type.class}</div>
              </div>
              <div className={`flex-1 ${type.class} text-gray-900`}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-xs text-gray-500 w-48">
                {type.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <Layout className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Components</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component) => (
            <div key={component.name} className="card-modern p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                {component.element}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <MousePointer className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Spacing System</h2>
        </div>
        
        <div className="card-modern p-8 space-y-4">
          <p className="text-gray-600 mb-6">
            Consistent spacing creates visual rhythm and improves the overall user experience.
          </p>
          
          {spacing.map((space) => (
            <div key={space.name} className="flex items-center space-x-6 py-2">
              <div className="w-16 text-sm font-medium text-gray-900">{space.name}</div>
              <div className="w-16 text-xs text-gray-500">{space.value}</div>
              <div className="flex items-center">
                <div 
                  className="bg-blue-100 border border-blue-300"
                  style={{ 
                    padding: space.value,
                    minWidth: '1rem',
                    minHeight: '1rem'
                  }}
                />
              </div>
              <div className="text-xs text-gray-500">{space.class}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive Design */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <Monitor className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Responsive Design</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-modern p-6 text-center space-y-4">
            <Smartphone className="h-12 w-12 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Mobile</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>&lt; 640px</div>
              <div>Touch-optimized</div>
              <div>44px minimum touch targets</div>
            </div>
          </div>
          
          <div className="card-modern p-6 text-center space-y-4">
            <Tablet className="h-12 w-12 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Tablet</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>640px - 1024px</div>
              <div>Adaptive layout</div>
              <div>Hybrid interactions</div>
            </div>
          </div>
          
          <div className="card-modern p-6 text-center space-y-4">
            <Monitor className="h-12 w-12 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Desktop</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>&gt; 1024px</div>
              <div>Full feature set</div>
              <div>Keyboard navigation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Visualization Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Visualization Examples</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricCard
            title="Example Metric"
            value="1,247"
            change={15}
            changeType="positive"
            trend={[{ value: 100 }, { value: 120 }, { value: 140 }, { value: 160 }, { value: 180 }]}
          />
          
          <div className="card-modern p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Progress</h3>
            <div className="space-y-4">
              <ProgressBar progress={85} label="Response Time" />
              <ProgressBar progress={92} label="Success Rate" />
              <ProgressBar progress={78} label="User Satisfaction" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
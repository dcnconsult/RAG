import React from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.initializeObservers()
  }

  // Initialize performance observers
  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('navigation', entry.duration)
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', navigationObserver)

        // Observe paint timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint') {
              this.recordMetric('firstPaint', entry.startTime)
            } else if (entry.name === 'first-contentful-paint') {
              this.recordMetric('firstContentfulPaint', entry.startTime)
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.set('paint', paintObserver)

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('largestContentfulPaint', entry.startTime)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const firstInputEntry = entry as PerformanceEventTiming
              this.recordMetric('firstInputDelay', firstInputEntry.processingStart - firstInputEntry.startTime)
            }
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  // Get performance metrics
  getMetrics(name?: string) {
    if (name) {
      return this.metrics.get(name) || []
    }
    return Object.fromEntries(this.metrics)
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric(`function_${name}`, duration)
    }
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric(`async_function_${name}`, duration)
    }
  }

  // Measure page load performance
  measurePageLoad() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
        this.recordMetric('loadComplete', navigation.loadEventEnd - navigation.loadEventStart)
        this.recordMetric('timeToFirstByte', navigation.responseStart - navigation.requestStart)
      }
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    return {
      FCP: this.getAverageMetric('firstContentfulPaint'),
      LCP: this.getAverageMetric('largestContentfulPaint'),
      FID: this.getAverageMetric('firstInputDelay'),
      CLS: this.getAverageMetric('cumulativeLayoutShift') || 0,
      TTFB: this.getAverageMetric('timeToFirstByte'),
    }
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const coreVitals = this.getCoreWebVitals()
    const functionMetrics = Object.fromEntries(
      Array.from(this.metrics.entries())
        .filter(([key]) => key.startsWith('function_'))
        .map(([key]) => [key.replace('function_', ''), this.getAverageMetric(key)])
    )

    return {
      timestamp: new Date().toISOString(),
      coreWebVitals: coreVitals,
      functionPerformance: functionMetrics,
      navigationMetrics: {
        domContentLoaded: this.getAverageMetric('domContentLoaded'),
        loadComplete: this.getAverageMetric('loadComplete'),
        timeToFirstByte: this.getAverageMetric('timeToFirstByte'),
      },
      summary: {
        totalMetrics: this.metrics.size,
        averageFCP: coreVitals.FCP,
        averageLCP: coreVitals.LCP,
        averageFID: coreVitals.FID,
      }
    }
  }

  // Cleanup observers
  destroy() {
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()
    this.metrics.clear()
  }
}

// Performance report interface
export interface PerformanceReport {
  timestamp: string
  coreWebVitals: {
    FCP: number
    LCP: number
    FID: number
    CLS: number
    TTFB: number
  }
  functionPerformance: Record<string, number>
  navigationMetrics: {
    domContentLoaded: number
    loadComplete: number
    timeToFirstByte: number
  }
  summary: {
    totalMetrics: number
    averageFCP: number
    averageLCP: number
    averageFID: number
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Performance measurement decorator
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const metricName = name || `${target.constructor.name}_${propertyKey}`

    descriptor.value = function (...args: any[]) {
      const start = performance.now()
      try {
        return method.apply(this, args)
      } finally {
        const duration = performance.now() - start
        performanceMonitor.recordMetric(metricName, duration)
      }
    }

    return descriptor
  }
}

// Performance measurement hook for React components
export function usePerformanceMeasurement(componentName: string) {
  const startTime = React.useRef(performance.now())

  React.useEffect(() => {
    const duration = performance.now() - startTime.current
    performanceMonitor.recordMetric(`component_${componentName}`, duration)
  }, [componentName])

  return {
    measureFunction: <T>(name: string, fn: () => T) => 
      performanceMonitor.measureFunction(`${componentName}_${name}`, fn),
    measureAsyncFunction: <T>(name: string, fn: () => Promise<T>) => 
      performanceMonitor.measureAsyncFunction(`${componentName}_${name}`, fn),
  }
}

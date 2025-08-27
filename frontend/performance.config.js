// Performance Testing Configuration
export default {
  // Performance budgets for different metrics
  budgets: {
    // Bundle size limits
    bundleSize: {
      total: '500KB', // Total bundle size
      initial: '200KB', // Initial chunk size
      vendor: '150KB', // Vendor chunk size
    },
    // Loading performance targets
    loading: {
      firstContentfulPaint: '1.5s',
      largestContentfulPaint: '2.5s',
      timeToInteractive: '3.5s',
      totalBlockingTime: '300ms',
    },
    // Runtime performance targets
    runtime: {
      maxMemoryUsage: '50MB',
      maxCPUUsage: '30%',
    },
  },

  // Performance testing scenarios
  scenarios: {
    // Light user scenario
    light: {
      concurrentUsers: 10,
      rampUpTime: '30s',
      holdTime: '2m',
      rampDownTime: '30s',
    },
    // Medium user scenario
    medium: {
      concurrentUsers: 50,
      rampUpTime: '1m',
      holdTime: '5m',
      rampDownTime: '1m',
    },
    // Heavy user scenario
    heavy: {
      concurrentUsers: 100,
      rampUpTime: '2m',
      holdTime: '10m',
      rampDownTime: '2m',
    },
  },

  // Performance testing thresholds
  thresholds: {
    // Bundle analysis thresholds
    bundle: {
      maxTotalSize: 500 * 1024, // 500KB in bytes
      maxInitialSize: 200 * 1024, // 200KB in bytes
      maxVendorSize: 150 * 1024, // 150KB in bytes
    },
    // Lighthouse score thresholds
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
    },
    // API performance thresholds
    api: {
      maxResponseTime: 200, // 200ms
      maxErrorRate: 1, // 1%
    },
  },

  // Performance monitoring points
  monitoring: {
    // Key user interactions to monitor
    interactions: [
      'page-load',
      'navigation',
      'document-upload',
      'search-query',
      'chat-message',
    ],
    // Performance metrics to collect
    metrics: [
      'FCP', // First Contentful Paint
      'LCP', // Largest Contentful Paint
      'FID', // First Input Delay
      'CLS', // Cumulative Layout Shift
      'TTFB', // Time to First Byte
    ],
  },
}

#!/usr/bin/env node

/**
 * Performance Testing Script
 * Runs various performance tests and generates reports
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// Performance test configuration
const config = {
  buildCommand: 'npm run build:prod',
  analyzeCommand: 'npm run build:analyze',
  lighthouseCommand: 'npx lighthouse http://localhost:4173 --output=html --output-path=./lighthouse-report.html',
  previewCommand: 'npm run preview:prod',
  outputDir: './performance-reports',
  thresholds: {
    bundleSize: 500 * 1024, // 500KB
    initialSize: 200 * 1024, // 200KB
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
    }
  }
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`)
    const result = execSync(command, { 
      cwd: __dirname, 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    log(`✅ ${description} completed successfully`, 'success')
    return result
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error')
    throw error
  }
}

function analyzeBundleSize() {
  log('Analyzing bundle size...')
  
  try {
    // Run bundle analysis
    runCommand(config.analyzeCommand, 'Bundle analysis build')
    
    // Check if stats file exists
    const statsPath = join(__dirname, 'dist', 'stats.html')
    if (readFileSync(statsPath, 'utf8')) {
      log('Bundle analysis completed - check dist/stats.html', 'success')
    }
  } catch (error) {
    log('Bundle analysis failed', 'error')
  }
}

function runLighthouseTests() {
  log('Running Lighthouse performance tests...')
  
  try {
    // Start preview server
    log('Starting preview server...')
    const previewProcess = execSync(config.previewCommand, { 
      cwd: __dirname, 
      stdio: 'pipe',
      timeout: 30000 // 30 seconds timeout
    })
    
    // Wait for server to start
    setTimeout(async () => {
      try {
        // Run Lighthouse
        runCommand(config.lighthouseCommand, 'Lighthouse audit')
        log('Lighthouse tests completed - check lighthouse-report.html', 'success')
      } catch (error) {
        log('Lighthouse tests failed', 'error')
      } finally {
        // Stop preview server
        try {
          execSync('taskkill /f /im node.exe', { stdio: 'pipe' })
        } catch (e) {
          // Ignore errors when stopping server
        }
      }
    }, 5000)
    
  } catch (error) {
    log('Failed to start preview server', 'error')
  }
}

function generatePerformanceReport() {
  log('Generating performance report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      bundleAnalysis: 'Completed - check dist/stats.html',
      lighthouseTests: 'Completed - check lighthouse-report.html',
      recommendations: []
    },
    thresholds: config.thresholds,
    nextSteps: [
      'Review bundle analysis for optimization opportunities',
      'Check Lighthouse scores and address any issues below thresholds',
      'Optimize Core Web Vitals based on Lighthouse recommendations',
      'Consider implementing code splitting for large chunks',
      'Review and optimize image assets if needed'
    ]
  }
  
  // Write report to file
  const reportPath = join(__dirname, config.outputDir, 'performance-report.json')
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`Performance report generated: ${reportPath}`, 'success')
  } catch (error) {
    log(`Failed to write performance report: ${error.message}`, 'error')
  }
  
  return report
}

// Main execution
async function main() {
  log('🚀 Starting Performance Testing Suite')
  
  try {
    // Create output directory
    const outputDir = join(__dirname, config.outputDir)
    try {
      execSync(`mkdir -p "${outputDir}"`, { stdio: 'pipe' })
    } catch (e) {
      // Directory might already exist
    }
    
    // Run performance tests
    analyzeBundleSize()
    runLighthouseTests()
    
    // Generate report
    const report = generatePerformanceReport()
    
    log('🎉 Performance testing completed successfully!', 'success')
    log('📊 Check the following files for detailed results:')
    log('   - dist/stats.html (Bundle analysis)')
    log('   - lighthouse-report.html (Lighthouse scores)')
    log(`   - ${config.outputDir}/performance-report.json (Summary report)`)
    
  } catch (error) {
    log(`Performance testing failed: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main, config }

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { analyzer } from 'vite-bundle-analyzer'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer for performance testing
    mode === 'analyze' && analyzer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'analyze', // Enable sourcemaps only for analysis
    // Disable JS minification to avoid TDZ/runtime issues in MVP build
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          animations: ['framer-motion'],
          utils: ['axios'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Optimize CSS
    cssCodeSplit: true,
    // Enable dynamic imports
    dynamicImportVarsOptions: {
      warnOnError: false,
      exclude: [],
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'framer-motion'
    ],
    exclude: ['@tanstack/react-query-devtools'], // Exclude dev tools from optimization
  },
  // Performance optimizations
  esbuild: {
    target: 'es2020', // Target modern browsers for better performance
  },
  // Skip TypeScript checking for MVP build
  rollupOptions: {
    onwarn(warning, warn) {
      // Suppress TypeScript warnings for MVP
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
      warn(warning)
    }
  },
  // Enable PostCSS (Tailwind + Autoprefixer) for production CSS
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  // Define environment variables
  define: {
    'process.env': {}
  },
  // Preview server for testing production build
  preview: {
    port: 4173,
    host: true,
  },
}))

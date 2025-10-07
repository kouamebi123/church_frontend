import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.test.js',
        '**/*.test.jsx',
        'build/',
        'coverage/',
        'public/',
        'scripts/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Configuration des tests
    testTimeout: 10000,
    hookTimeout: 10000,
    // Pattern des fichiers de test
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // Exclusions
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ]
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@pages': new URL('./src/pages', import.meta.url).pathname,
      '@hooks': new URL('./src/hooks', import.meta.url).pathname,
      '@services': new URL('./src/services', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@features': new URL('./src/features', import.meta.url).pathname,
      '@constants': new URL('./src/constants', import.meta.url).pathname
    }
  }
})

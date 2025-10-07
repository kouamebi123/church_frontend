import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Configuration du build
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparation des chunks pour optimiser le chargement
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns']
        }
      }
    }
  },
  
  // Résolution des modules
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@features': resolve(__dirname, 'src/features'),
      '@constants': resolve(__dirname, 'src/constants')
    }
  },
  
  // Variables d'environnement
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || 'development',
      VITE_API_URL: process.env.VITE_API_URL || "https://churchbackend-production.up.railway.app" || 'http://localhost:5001',
      VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || "https://churchbackend-production.up.railway.app" || 'http://localhost:5001',
      VITE_HIDE_CONSOLE: process.env.VITE_HIDE_CONSOLE || 'false',
      VITE_PERFORMANCE_TRACKING: process.env.VITE_PERFORMANCE_TRACKING || 'false'
    })
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@reduxjs/toolkit',
      'react-redux',
      'react-router-dom',
      'axios',
      'date-fns',
      'socket.io-client',
      'recharts'
    ]
  },
  
  // Configuration pour les tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js'
  }
})

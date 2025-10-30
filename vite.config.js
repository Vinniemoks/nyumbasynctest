import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  server: {
    port: 5000,
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ]
    }
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': ['lucide-react'],
          // Feature-based chunks
          'tenant-dashboard': [
            './src/pages/TenantDashboard/index.jsx',
            './src/pages/TenantDashboard/Overview.jsx',
            './src/pages/TenantDashboard/PropertyDetails.jsx'
          ],
          'rent-management': [
            './src/pages/TenantDashboard/RentManagement/RentDashboard.jsx',
            './src/pages/TenantDashboard/RentManagement/PaymentForm.jsx',
            './src/pages/TenantDashboard/RentManagement/PaymentHistory.jsx'
          ],
          'maintenance': [
            './src/pages/TenantDashboard/Maintenance/MaintenanceList.jsx',
            './src/pages/TenantDashboard/Maintenance/CreateRequest.jsx',
            './src/pages/TenantDashboard/Maintenance/RequestDetails.jsx'
          ]
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  }
});
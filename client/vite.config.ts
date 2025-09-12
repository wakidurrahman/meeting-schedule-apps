import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'esm',
        // Cache-busting: Including content hashes in filenames so updates invalidate old cache
        // to ensure users get the latest assets without manual refresh
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // ================================================================
        // MANUAL CHUNK SPLITTING FOR OPTIMAL LAZY LOADING
        // ================================================================
        manualChunks: {
          // Core React libraries (most stable, cache longest)
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // GraphQL and networking (medium stability)
          apollo: ['@apollo/client', 'graphql'],

          // Form handling libraries (high usage across app)
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

          // UI framework and styling (large, shared across app)
          ui: ['bootstrap'],

          // Date manipulation libraries (used by calendar)
          dates: ['date-fns', 'date-fns-tz'],

          // Utility libraries (stable, shared)
          utils: ['lodash'],

          // Icons and styling components
          icons: ['react-select', 'react-loading-skeleton'],

          // Authentication and routing logic
          routing: ['@/context/AuthContext', '@/context/ToastContext'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'mixed-decls',
          'color-functions',
          'global-builtin',
          'legacy-js-api',
        ],
      },
    },
  },
  define: {
    'process.env': process.env,
  },
  json: {
    stringify: true,
  },

  // ================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ================================================================
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    // Pre-bundle frequently used dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@apollo/client',
      'react-hook-form',
      'date-fns',
      'bootstrap',
    ],
    // Exclude large or problematic dependencies from pre-bundling
    exclude: ['@apollo/client/core'],
  },

  // ================================================================
  // BUNDLE ANALYSIS (Enable with --bundleAnalyzer flag)
  // ================================================================
  server: {
    // this is the server configuration for the client proxy.
    port: 5173,
    open: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});

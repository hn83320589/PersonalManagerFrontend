import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Enable production source maps for better debugging
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunk for Vue and related libraries
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // UI library chunk
          'vendor-ui': ['@headlessui/vue', '@heroicons/vue'],
          // HTTP client chunk
          'vendor-http': ['axios'],
        },
        // Generate consistent chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Source map for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // CSS preprocessing optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Tailwind CSS optimization will be handled by PostCSS
    },
  },
  // Development server optimization
  server: {
    hmr: {
      overlay: true,
    },
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'pinia-plugin-persistedstate',
      'axios',
      '@headlessui/vue',
      '@heroicons/vue/24/outline',
      '@heroicons/vue/24/solid',
    ],
    // Force re-optimization on dependency changes
    force: false,
  },
})

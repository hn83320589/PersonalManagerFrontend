import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

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
    // PWA 支援
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Personal Manager',
        short_name: 'PersonalMgr',
        description: '現代化個人管理系統',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : 'esbuild',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log'] : []
      }
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunk for Vue and related libraries
          'vendor-vue': ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
          // UI library chunk
          'vendor-ui': ['@headlessui/vue', '@heroicons/vue'],
          // HTTP client chunk
          'vendor-http': ['axios'],
          // 工具庫
          'vendor-utils': ['@vueuse/core'],
          // 編輯器相關 (如果有使用)
          'vendor-editor': ['marked'],
          // 檔案上傳相關
          'vendor-upload': ['cropperjs']
        },
        // Generate consistent chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Source map for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // 檔案大小警告閾值
    chunkSizeWarningLimit: 1000,
    // 預載入模組最佳化
    modulePreload: {
      polyfill: true
    }
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
      '@vueuse/core',
      'marked'
    ],
    // Force re-optimization on dependency changes
    force: false,
    // 排除不需要優化的依賴
    exclude: ['cropperjs']
  },
  // 實驗性功能
  experimental: {
    // 啟用建置時間優化
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})

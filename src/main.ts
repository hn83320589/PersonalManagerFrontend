import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { PerformanceMonitor, preloadCriticalResources } from '@/utils/performance'

// Performance monitoring setup
const perfMonitor = PerformanceMonitor.getInstance()
perfMonitor.mark('app-init')

// Preload critical resources
preloadCriticalResources()

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// Initialize auth state on app start
const authStore = useAuthStore()
authStore.initializeAuth()

// Mount app and measure performance
app.mount('#app')
perfMonitor.measure('app-init')

// Start monitoring Core Web Vitals in production
if (import.meta.env.PROD) {
  perfMonitor.reportWebVitals()
}

// Development-only performance analysis
if (import.meta.env.DEV) {
  // Log bundle analysis after a short delay
  setTimeout(() => {
    import('@/utils/performance').then(({ analyzeBundleSize, monitorMemoryUsage }) => {
      analyzeBundleSize()
      monitorMemoryUsage()
    })
  }, 1000)

  // Monitor memory usage periodically in development
  setInterval(() => {
    import('@/utils/performance').then(({ monitorMemoryUsage }) => {
      monitorMemoryUsage()
    })
  }, 30000) // Every 30 seconds
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark the start of a performance measurement
  mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`)
      this.metrics.set(`${name}-start`, Date.now())
    }
  }

  // Mark the end and calculate duration
  measure(name: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.metrics.get(`${name}-start`)
      if (startTime) {
        const endTime = Date.now()
        const duration = endTime - startTime
        window.performance.mark(`${name}-end`)
        
        try {
          window.performance.measure(name, `${name}-start`, `${name}-end`)
        } catch (error) {
          console.warn(`Performance measurement failed for ${name}:`, error)
        }
        
        this.metrics.set(name, duration)
        return duration
      }
    }
    return 0
  }

  // Get performance metric
  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  // Get all metrics
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear()
    if (typeof window !== 'undefined' && window.performance?.clearMarks) {
      window.performance.clearMarks()
      window.performance.clearMeasures()
    }
  }

  // Report Core Web Vitals
  reportWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint
      this.observeLCP()
      
      // First Input Delay
      this.observeFID()
      
      // Cumulative Layout Shift
      this.observeCLS()
      
      // First Contentful Paint
      this.observeFCP()
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.set('LCP', lastEntry.startTime)
        console.log('LCP:', lastEntry.startTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime
          this.metrics.set('FID', fid)
          console.log('FID:', fid)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.set('CLS', clsValue)
        console.log('CLS:', clsValue)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.set('FCP', entry.startTime)
            console.log('FCP:', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('FCP observation not supported:', error)
    }
  }
}

// Image lazy loading utility
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              this.loadImage(img)
              this.observer?.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      )
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.classList.remove('lazy')
      img.classList.add('lazy-loaded')
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Bundle size analyzer utility
export function analyzeBundleSize(): void {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    // Only in development mode
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[]
    
    console.group('📦 Bundle Analysis')
    console.log('🟢 JavaScript files:', scripts.length)
    console.log('🎨 CSS files:', styles.length)
    
    scripts.forEach((script, index) => {
      console.log(`JS ${index + 1}:`, script.src)
    })
    
    styles.forEach((style, index) => {
      console.log(`CSS ${index + 1}:`, style.href)
    })
    console.groupEnd()
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory
    
    console.group('🧠 Memory Usage')
    console.log('Used:', `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`)
    console.log('Total:', `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`)
    console.log('Limit:', `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`)
    console.groupEnd()
  }
}

// Resource loading optimization
export function preloadCriticalResources(): void {
  if (typeof window !== 'undefined') {
    // Preload critical CSS
    const criticalCSS = [
      '/assets/main.css'
    ]
    
    criticalCSS.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      document.head.appendChild(link)
    })
    
    // Preconnect to external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.github.com'
    ]
    
    externalDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }
}
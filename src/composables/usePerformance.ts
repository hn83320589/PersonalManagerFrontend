import { ref, onMounted, onUnmounted } from 'vue'
import { PerformanceMonitor } from '@/utils/performance'
import { ImageOptimizer } from '@/utils/imageOptimization'

/**
 * 性能優化 Composable
 * 提供前端性能監控和優化功能
 */
export function usePerformance() {
  const performanceData = ref({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  })

  const isLoading = ref(true)
  const monitor = PerformanceMonitor.getInstance()

  onMounted(() => {
    // 初始化性能監控
    monitor.reportWebVitals()
    
    // 監控頁面載入性能
    measurePageLoad()
    
    // 設置性能數據更新
    updatePerformanceData()
  })

  /**
   * 測量頁面載入性能
   */
  function measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        // Time to First Byte
        performanceData.value.ttfb = navigation.responseStart - navigation.requestStart
        
        // 標記頁面載入完成
        monitor.mark('page-load')
        
        // DOM Content Loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            monitor.measure('page-load')
            isLoading.value = false
          })
        } else {
          monitor.measure('page-load')
          isLoading.value = false
        }
      }
    }
  }

  /**
   * 更新性能數據
   */
  function updatePerformanceData() {
    const updateData = () => {
      performanceData.value = {
        fcp: monitor.getMetric('FCP') || 0,
        lcp: monitor.getMetric('LCP') || 0,
        fid: monitor.getMetric('FID') || 0,
        cls: monitor.getMetric('CLS') || 0,
        ttfb: performanceData.value.ttfb
      }
    }

    // 定期更新數據
    const interval = setInterval(updateData, 1000)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  }

  /**
   * 測量組件渲染性能
   */
  function measureComponent(name: string) {
    monitor.mark(`${name}-render`)
    
    return {
      finish: () => monitor.measure(`${name}-render`)
    }
  }

  /**
   * 測量 API 請求性能
   */
  function measureApiCall(name: string) {
    monitor.mark(`api-${name}`)
    
    return {
      finish: () => monitor.measure(`api-${name}`)
    }
  }

  return {
    performanceData,
    isLoading,
    measureComponent,
    measureApiCall,
    monitor
  }
}

/**
 * 圖片優化 Composable
 */
export function useImageOptimization() {
  const isWebPSupported = ref(false)
  const optimizer = new ImageOptimizer()

  onMounted(async () => {
    isWebPSupported.value = optimizer.supportsWebP()
  })

  /**
   * 壓縮圖片檔案
   */
  async function compressImage(file: File, options?: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
    format?: 'webp' | 'jpeg' | 'png'
  }) {
    return optimizer.optimizeImage(file, options)
  }

  /**
   * 生成多種尺寸的圖片
   */
  async function generateResponsiveImages(file: File, sizes?: number[]) {
    return optimizer.generateMultipleSizes(file, sizes)
  }

  /**
   * 生成縮圖
   */
  async function generateThumbnail(file: File, size = 150) {
    return optimizer.generateThumbnail(file, size)
  }

  return {
    isWebPSupported,
    compressImage,
    generateResponsiveImages,
    generateThumbnail
  }
}

/**
 * 懶載入 Composable
 */
export function useLazyLoading() {
  const observer = ref<IntersectionObserver | null>(null)
  const loadedElements = ref(new Set<Element>())

  onMounted(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !loadedElements.value.has(entry.target)) {
              loadElement(entry.target)
              loadedElements.value.add(entry.target)
              observer.value?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      )
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  /**
   * 載入元素內容
   */
  function loadElement(element: Element) {
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.src
      if (src) {
        element.src = src
        element.classList.remove('lazy')
        element.classList.add('lazy-loaded')
      }
    } else if (element instanceof HTMLElement) {
      // 處理其他類型的懶載入元素
      const content = element.dataset.content
      if (content) {
        element.innerHTML = content
        element.classList.remove('lazy')
        element.classList.add('lazy-loaded')
      }
    }
  }

  /**
   * 觀察元素
   */
  function observe(element: Element) {
    if (observer.value) {
      observer.value.observe(element)
    } else {
      // 回退機制：立即載入
      loadElement(element)
    }
  }

  /**
   * 觀察多個元素
   */
  function observeElements(selector: string) {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => observe(element))
  }

  return {
    observe,
    observeElements,
    loadedElements
  }
}

/**
 * 預載入 Composable
 */
export function usePreloading() {
  const preloadedResources = ref(new Set<string>())

  /**
   * 預載入圖片
   */
  async function preloadImage(src: string): Promise<void> {
    if (preloadedResources.value.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedResources.value.add(src)
        resolve()
      }
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
      img.src = src
    })
  }

  /**
   * 預載入多張圖片
   */
  async function preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => preloadImage(src)))
  }

  /**
   * 預載入關鍵 CSS
   */
  function preloadCSS(href: string) {
    if (preloadedResources.value.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = () => {
      preloadedResources.value.add(href)
      // 轉換為實際的樣式表
      link.rel = 'stylesheet'
    }
    document.head.appendChild(link)
  }

  /**
   * 預載入 JavaScript 模組
   */
  function preloadScript(src: string) {
    if (preloadedResources.value.has(src)) return

    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = src
    link.onload = () => preloadedResources.value.add(src)
    document.head.appendChild(link)
  }

  /**
   * 預連接到外部域名
   */
  function preconnect(href: string) {
    if (preloadedResources.value.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.crossOrigin = 'anonymous'
    link.onload = () => preloadedResources.value.add(href)
    document.head.appendChild(link)
  }

  return {
    preloadImage,
    preloadImages,
    preloadCSS,
    preloadScript,
    preconnect,
    preloadedResources
  }
}

/**
 * 快取 Composable
 */
export function useCache() {
  const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * 設定快取
   */
  function set(key: string, data: any, ttlMs = 5 * 60 * 1000) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  /**
   * 獲取快取
   */
  function get(key: string) {
    const item = cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * 清除過期快取
   */
  function cleanup() {
    const now = Date.now()
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        cache.delete(key)
      }
    }
  }

  /**
   * 清除所有快取
   */
  function clear() {
    cache.clear()
  }

  // 定期清理過期快取
  onMounted(() => {
    const interval = setInterval(cleanup, 60000) // 每分鐘清理一次
    onUnmounted(() => clearInterval(interval))
  })

  return {
    set,
    get,
    cleanup,
    clear,
    size: () => cache.size
  }
}
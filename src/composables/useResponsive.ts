import { ref, computed, onMounted, onUnmounted } from 'vue'

// 斷點定義 (遵循 Tailwind CSS 標準)
export const breakpoints = {
  xs: 0,      // 超小屏幕 (手機直向)
  sm: 640,    // 小屏幕 (手機橫向)
  md: 768,    // 中屏幕 (平板直向)
  lg: 1024,   // 大屏幕 (平板橫向、小筆電)
  xl: 1280,   // 超大屏幕 (桌面)
  '2xl': 1536 // 2K 屏幕 (大桌面)
} as const

export type Breakpoint = keyof typeof breakpoints
export type BreakpointValue = typeof breakpoints[Breakpoint]

/**
 * 響應式設計 Composable
 * 提供螢幕尺寸檢測和響應式狀態管理
 */
export function useResponsive() {
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  // 更新視窗尺寸
  const updateSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  // 防抖處理
  let resizeTimer: number | null = null
  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = window.setTimeout(updateSize, 150)
  }

  // 當前斷點
  const currentBreakpoint = computed((): Breakpoint => {
    const width = windowWidth.value
    
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  // 斷點檢測函數
  const isBreakpoint = (bp: Breakpoint): boolean => {
    return windowWidth.value >= breakpoints[bp]
  }

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    const width = windowWidth.value
    return width >= breakpoints[min] && width < breakpoints[max]
  }

  const isOnly = (bp: Breakpoint): boolean => {
    const bpKeys = Object.keys(breakpoints) as Breakpoint[]
    const currentIndex = bpKeys.indexOf(bp)
    const nextBp = bpKeys[currentIndex + 1]
    
    if (!nextBp) {
      return windowWidth.value >= breakpoints[bp]
    }
    
    return isBetween(bp, nextBp)
  }

  // 常用斷點狀態
  const isXs = computed(() => isOnly('xs'))
  const isSm = computed(() => isBreakpoint('sm') && !isBreakpoint('md'))
  const isMd = computed(() => isBreakpoint('md') && !isBreakpoint('lg'))
  const isLg = computed(() => isBreakpoint('lg') && !isBreakpoint('xl'))
  const isXl = computed(() => isBreakpoint('xl') && !isBreakpoint('2xl'))
  const is2xl = computed(() => isBreakpoint('2xl'))

  // 設備類型檢測
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => isBetween('md', 'lg'))
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
  const isLargeDesktop = computed(() => windowWidth.value >= breakpoints.xl)

  // 螢幕方向
  const orientation = computed(() => {
    return windowHeight.value > windowWidth.value ? 'portrait' : 'landscape'
  })

  const isPortrait = computed(() => orientation.value === 'portrait')
  const isLandscape = computed(() => orientation.value === 'landscape')

  // 螢幕密度檢測
  const pixelRatio = computed(() => {
    return window.devicePixelRatio || 1
  })

  const isHighDPI = computed(() => pixelRatio.value > 1)
  const isRetina = computed(() => pixelRatio.value >= 2)

  // 視窗尺寸相關
  const windowSize = computed(() => ({
    width: windowWidth.value,
    height: windowHeight.value,
    aspectRatio: windowWidth.value / windowHeight.value
  }))

  // 可視區域尺寸 (排除滾動條)
  const viewportSize = computed(() => ({
    width: document.documentElement.clientWidth || windowWidth.value,
    height: document.documentElement.clientHeight || windowHeight.value
  }))

  // 網格系統計算
  const getGridCols = (
    config: Partial<Record<Breakpoint, number>> = {}
  ): number => {
    const bp = currentBreakpoint.value
    const bpKeys = Object.keys(breakpoints) as Breakpoint[]
    
    // 從當前斷點向下找到最近的配置
    for (let i = bpKeys.indexOf(bp); i >= 0; i--) {
      const key = bpKeys[i]
      if (config[key] !== undefined) {
        return config[key]!
      }
    }
    
    return config.xs || 1
  }

  // 響應式值計算
  const getResponsiveValue = <T>(
    config: Partial<Record<Breakpoint, T>>,
    defaultValue: T
  ): T => {
    const bp = currentBreakpoint.value
    const bpKeys = Object.keys(breakpoints) as Breakpoint[]
    
    // 從當前斷點向下找到最近的配置
    for (let i = bpKeys.indexOf(bp); i >= 0; i--) {
      const key = bpKeys[i]
      if (config[key] !== undefined) {
        return config[key]!
      }
    }
    
    return defaultValue
  }

  // CSS 媒體查詢檢測
  const matchMedia = (query: string): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }
    return window.matchMedia(query).matches
  }

  // 常用媒體查詢
  const prefersDarkMode = computed(() => 
    matchMedia('(prefers-color-scheme: dark)')
  )
  
  const prefersReducedMotion = computed(() => 
    matchMedia('(prefers-reduced-motion: reduce)')
  )
  
  const supportsHover = computed(() => 
    matchMedia('(hover: hover)')
  )

  // 觸控設備檢測
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // iOS/Android 檢測
  const isIOS = computed(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  })

  const isAndroid = computed(() => {
    return /Android/.test(navigator.userAgent)
  })

  const isMobileOS = computed(() => {
    return isIOS.value || isAndroid.value
  })

  // 生命週期
  onMounted(() => {
    updateSize()
    window.addEventListener('resize', handleResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  })

  return {
    // 尺寸相關
    windowWidth,
    windowHeight,
    windowSize,
    viewportSize,
    
    // 斷點檢測
    currentBreakpoint,
    isBreakpoint,
    isBetween,
    isOnly,
    
    // 常用斷點狀態
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    
    // 設備類型
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // 螢幕方向
    orientation,
    isPortrait,
    isLandscape,
    
    // 螢幕特性
    pixelRatio,
    isHighDPI,
    isRetina,
    isTouchDevice,
    
    // 平台檢測
    isIOS,
    isAndroid,
    isMobileOS,
    
    // 用戶偏好
    prefersDarkMode,
    prefersReducedMotion,
    supportsHover,
    
    // 工具函數
    getGridCols,
    getResponsiveValue,
    matchMedia
  }
}

/**
 * 響應式組件包裝 Composable
 * 用於根據螢幕尺寸條件性渲染組件
 */
export function useResponsiveComponent() {
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive()

  const shouldRender = (condition: {
    breakpoint?: Breakpoint | Breakpoint[]
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
    minWidth?: number
    maxWidth?: number
  }): boolean => {
    const {
      breakpoint,
      mobile,
      tablet,
      desktop,
      minWidth,
      maxWidth
    } = condition

    // 設備類型檢查
    if (mobile !== undefined && isMobile.value !== mobile) return false
    if (tablet !== undefined && isTablet.value !== tablet) return false
    if (desktop !== undefined && isDesktop.value !== desktop) return false

    // 斷點檢查
    if (breakpoint) {
      const breakpoints = Array.isArray(breakpoint) ? breakpoint : [breakpoint]
      if (!breakpoints.includes(currentBreakpoint.value)) return false
    }

    // 寬度範圍檢查
    if (minWidth !== undefined && window.innerWidth < minWidth) return false
    if (maxWidth !== undefined && window.innerWidth > maxWidth) return false

    return true
  }

  return {
    shouldRender
  }
}

/**
 * 響應式樣式 Composable
 * 用於動態計算響應式樣式
 */
export function useResponsiveStyle() {
  const { getResponsiveValue } = useResponsive()

  const getSpacing = (config: Partial<Record<Breakpoint, string | number>>) => {
    return getResponsiveValue(config, '1rem')
  }

  const getFontSize = (config: Partial<Record<Breakpoint, string>>) => {
    return getResponsiveValue(config, '1rem')
  }

  const getLayout = (config: Partial<Record<Breakpoint, 'block' | 'flex' | 'grid' | 'none'>>) => {
    return getResponsiveValue(config, 'block')
  }

  return {
    getSpacing,
    getFontSize,
    getLayout,
    getResponsiveValue
  }
}

/**
 * 響應式媒體查詢 Hook
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList

  const updateMatches = (e: MediaQueryListEvent) => {
    matches.value = e.matches
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches
      
      // 使用 addEventListener (現代瀏覽器)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateMatches)
      } else {
        // 舊版瀏覽器兼容
        mediaQuery.addListener(updateMatches)
      }
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches)
      } else {
        mediaQuery.removeListener(updateMatches)
      }
    }
  })

  return matches
}
/**
 * 行動端優化 Composable
 * 提供行動裝置專用的功能和優化
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export interface MobileConfig {
  // 手勢設定
  gestures: {
    swipeEnabled: boolean
    pinchZoomEnabled: boolean
    longPressEnabled: boolean
    doubleTapEnabled: boolean
    swipeThreshold: number
    longPressDelay: number
  }
  
  // 觸控設定
  touch: {
    hapticFeedback: boolean
    touchTargetSize: number
    scrollBehavior: 'auto' | 'smooth'
    pullToRefreshEnabled: boolean
  }
  
  // 介面設定
  ui: {
    statusBarStyle: 'default' | 'light' | 'dark'
    fullScreen: boolean
    hideNavigationBar: boolean
    orientation: 'auto' | 'portrait' | 'landscape'
    safeAreaHandling: boolean
  }
  
  // 效能設定
  performance: {
    lazyLoadImages: boolean
    virtualScrolling: boolean
    reducedAnimations: boolean
    lowPowerMode: boolean
  }
}

export interface TouchEvent {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch'
  startX: number
  startY: number
  endX: number
  endY: number
  deltaX: number
  deltaY: number
  distance: number
  duration: number
  scale?: number
  velocity: number
  direction?: 'up' | 'down' | 'left' | 'right'
  target: HTMLElement
}

export interface GestureRecognizer {
  element: HTMLElement
  options: GestureOptions
  isListening: boolean
  handlers: Map<string, (event: TouchEvent) => void>
}

export interface GestureOptions {
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  preventContextMenu?: boolean
  preventZoom?: boolean
}

export interface DeviceInfo {
  type: 'phone' | 'tablet' | 'desktop'
  os: 'ios' | 'android' | 'unknown'
  browser: string
  version: string
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  hasTouch: boolean
  supportsPWA: boolean
  isStandalone: boolean
  safeArea: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface NetworkInfo {
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
  online: boolean
}

/**
 * 行動端優化 Composable
 */
export function useMobile() {
  // 響應式狀態
  const config = reactive<MobileConfig>({
    gestures: {
      swipeEnabled: true,
      pinchZoomEnabled: true,
      longPressEnabled: true,
      doubleTapEnabled: true,
      swipeThreshold: 50,
      longPressDelay: 500
    },
    touch: {
      hapticFeedback: true,
      touchTargetSize: 44,
      scrollBehavior: 'smooth',
      pullToRefreshEnabled: true
    },
    ui: {
      statusBarStyle: 'default',
      fullScreen: false,
      hideNavigationBar: false,
      orientation: 'auto',
      safeAreaHandling: true
    },
    performance: {
      lazyLoadImages: true,
      virtualScrolling: true,
      reducedAnimations: false,
      lowPowerMode: false
    }
  })

  const deviceInfo = ref<DeviceInfo>({
    type: 'desktop',
    os: 'unknown',
    browser: '',
    version: '',
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    pixelRatio: 1,
    hasTouch: false,
    supportsPWA: false,
    isStandalone: false,
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  const networkInfo = ref<NetworkInfo>({
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    online: true
  })

  const gestureRecognizers = ref<GestureRecognizer[]>([])
  const isKeyboardVisible = ref(false)
  const viewportHeight = ref(window.innerHeight)

  // 計算屬性
  const isMobile = computed(() => deviceInfo.value.type === 'phone')
  const isTablet = computed(() => deviceInfo.value.type === 'tablet')
  const isTouchDevice = computed(() => deviceInfo.value.hasTouch)
  const isLandscape = computed(() => deviceInfo.value.orientation === 'landscape')
  const isPortrait = computed(() => deviceInfo.value.orientation === 'portrait')
  const isLowBandwidth = computed(() => 
    networkInfo.value.saveData || 
    ['2g', '3g'].includes(networkInfo.value.effectiveType)
  )

  // 偵測裝置資訊
  const detectDeviceInfo = (): void => {
    const ua = navigator.userAgent
    const screen = window.screen
    
    // 偵測裝置類型
    if (/iPhone|iPod/.test(ua)) {
      deviceInfo.value.type = 'phone'
      deviceInfo.value.os = 'ios'
    } else if (/iPad/.test(ua)) {
      deviceInfo.value.type = 'tablet'
      deviceInfo.value.os = 'ios'
    } else if (/Android/.test(ua)) {
      if (/Mobile/.test(ua)) {
        deviceInfo.value.type = 'phone'
      } else {
        deviceInfo.value.type = 'tablet'
      }
      deviceInfo.value.os = 'android'
    } else {
      deviceInfo.value.type = screen.width < 768 ? 'phone' : 'tablet'
    }

    // 偵測瀏覽器
    if (/Chrome/.test(ua)) {
      deviceInfo.value.browser = 'chrome'
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      deviceInfo.value.browser = 'safari'
    } else if (/Firefox/.test(ua)) {
      deviceInfo.value.browser = 'firefox'
    }

    // 螢幕資訊
    deviceInfo.value.screenWidth = screen.width
    deviceInfo.value.screenHeight = screen.height
    deviceInfo.value.orientation = screen.width > screen.height ? 'landscape' : 'portrait'
    deviceInfo.value.pixelRatio = window.devicePixelRatio || 1

    // 觸控支援
    deviceInfo.value.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // PWA 支援
    deviceInfo.value.supportsPWA = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window
    deviceInfo.value.isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Safe Area
    if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
      deviceInfo.value.safeArea = {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0,
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)')) || 0,
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)')) || 0
      }
    }
  }

  // 偵測網路資訊
  const detectNetworkInfo = (): void => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      networkInfo.value = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
        online: navigator.onLine
      }
    } else {
      networkInfo.value.online = navigator.onLine
    }
  }

  // 手勢識別器
  const createGestureRecognizer = (
    element: HTMLElement,
    options: GestureOptions = {}
  ): GestureRecognizer => {
    const recognizer: GestureRecognizer = {
      element,
      options: {
        swipeThreshold: options.swipeThreshold || config.gestures.swipeThreshold,
        longPressDelay: options.longPressDelay || config.gestures.longPressDelay,
        doubleTapDelay: options.doubleTapDelay || 300,
        preventContextMenu: options.preventContextMenu ?? true,
        preventZoom: options.preventZoom ?? false,
        ...options
      },
      isListening: false,
      handlers: new Map()
    }

    let touchStartTime = 0
    let touchStartPos = { x: 0, y: 0 }
    let touchEndPos = { x: 0, y: 0 }
    let lastTapTime = 0
    let longPressTimer: NodeJS.Timeout | null = null
    let touchScale = 1

    const handleTouchStart = (event: Event) => {
      const touch = (event as TouchEvent).touches[0]
      touchStartTime = Date.now()
      touchStartPos = { x: touch.clientX, y: touch.clientY }
      
      if (recognizer.options.preventZoom && (event as TouchEvent).touches.length > 1) {
        event.preventDefault()
      }

      // 長按檢測
      if (config.gestures.longPressEnabled) {
        longPressTimer = setTimeout(() => {
          triggerGestureEvent('long-press', {
            startX: touchStartPos.x,
            startY: touchStartPos.y,
            endX: touchStartPos.x,
            endY: touchStartPos.y
          })
          vibrate(50)
        }, recognizer.options.longPressDelay)
      }
    }

    const handleTouchMove = (event: Event) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }

      const touch = (event as TouchEvent).touches[0]
      touchEndPos = { x: touch.clientX, y: touch.clientY }

      // 捏合手勢檢測
      if ((event as TouchEvent).touches.length === 2 && config.gestures.pinchZoomEnabled) {
        const touch1 = (event as TouchEvent).touches[0]
        const touch2 = (event as TouchEvent).touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
        // 計算縮放比例並觸發事件
      }
    }

    const handleTouchEnd = (event: Event) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }

      const touchEndTime = Date.now()
      const duration = touchEndTime - touchStartTime
      const deltaX = touchEndPos.x - touchStartPos.x
      const deltaY = touchEndPos.y - touchStartPos.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = distance / duration

      // 點擊檢測
      if (distance < 10 && duration < 300) {
        const currentTime = Date.now()
        
        // 雙擊檢測
        if (config.gestures.doubleTapEnabled && 
            currentTime - lastTapTime < recognizer.options.doubleTapDelay!) {
          triggerGestureEvent('double-tap', {
            startX: touchStartPos.x,
            startY: touchStartPos.y,
            endX: touchEndPos.x,
            endY: touchEndPos.y
          })
          vibrate(25)
        } else {
          triggerGestureEvent('tap', {
            startX: touchStartPos.x,
            startY: touchStartPos.y,
            endX: touchEndPos.x,
            endY: touchEndPos.y
          })
        }
        
        lastTapTime = currentTime
      }
      // 滑動檢測
      else if (config.gestures.swipeEnabled && distance > recognizer.options.swipeThreshold!) {
        let direction: 'up' | 'down' | 'left' | 'right'
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }

        triggerGestureEvent('swipe', {
          startX: touchStartPos.x,
          startY: touchStartPos.y,
          endX: touchEndPos.x,
          endY: touchEndPos.y,
          direction,
          velocity
        })

        vibrate(30)
      }
    }

    const triggerGestureEvent = (type: string, data: Partial<TouchEvent>) => {
      const handler = recognizer.handlers.get(type)
      if (handler) {
        const touchEvent: TouchEvent = {
          type: type as any,
          startX: data.startX || 0,
          startY: data.startY || 0,
          endX: data.endX || 0,
          endY: data.endY || 0,
          deltaX: (data.endX || 0) - (data.startX || 0),
          deltaY: (data.endY || 0) - (data.startY || 0),
          distance: Math.sqrt(
            Math.pow((data.endX || 0) - (data.startX || 0), 2) + 
            Math.pow((data.endY || 0) - (data.startY || 0), 2)
          ),
          duration: Date.now() - touchStartTime,
          velocity: data.velocity || 0,
          direction: data.direction,
          target: recognizer.element
        }
        
        handler(touchEvent)
      }
    }

    // 綁定事件
    const startListening = () => {
      if (recognizer.isListening) return

      element.addEventListener('touchstart', handleTouchStart, { passive: false })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: false })

      if (recognizer.options.preventContextMenu) {
        element.addEventListener('contextmenu', (e) => e.preventDefault())
      }

      recognizer.isListening = true
    }

    const stopListening = () => {
      if (!recognizer.isListening) return

      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      recognizer.isListening = false
    }

    // 添加手勢處理器
    const on = (gesture: string, handler: (event: TouchEvent) => void) => {
      recognizer.handlers.set(gesture, handler)
      if (!recognizer.isListening) {
        startListening()
      }
    }

    const off = (gesture: string) => {
      recognizer.handlers.delete(gesture)
      if (recognizer.handlers.size === 0) {
        stopListening()
      }
    }

    return {
      ...recognizer,
      startListening,
      stopListening,
      on,
      off
    } as any
  }

  // 震動回饋
  const vibrate = (pattern: number | number[]) => {
    if (config.touch.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // 虛擬鍵盤檢測
  const detectVirtualKeyboard = () => {
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDiff = viewportHeight.value - currentHeight
      
      // 如果高度變化超過 150px，認為是虛擬鍵盤顯示/隱藏
      if (Math.abs(heightDiff) > 150) {
        isKeyboardVisible.value = heightDiff > 0
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }

  // 方向變化檢測
  const detectOrientationChange = () => {
    const handleOrientationChange = () => {
      setTimeout(() => {
        deviceInfo.value.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        deviceInfo.value.screenWidth = window.screen.width
        deviceInfo.value.screenHeight = window.screen.height
      }, 100) // 延遲以確保尺寸已更新
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }

  // 網路狀態檢測
  const detectNetworkChange = () => {
    const handleOnline = () => {
      networkInfo.value.online = true
    }

    const handleOffline = () => {
      networkInfo.value.online = false
    }

    const handleConnectionChange = () => {
      detectNetworkInfo()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }

  // PWA 安裝
  const installPWA = async (): Promise<boolean> => {
    if (!deviceInfo.value.supportsPWA) {
      return false
    }

    try {
      const deferredPrompt = (window as any).deferredPrompt
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const result = await deferredPrompt.userChoice
        return result.outcome === 'accepted'
      }
    } catch (error) {
      console.warn('PWA installation failed:', error)
    }

    return false
  }

  // 狀態列樣式設定
  const setStatusBarStyle = (style: 'default' | 'light' | 'dark') => {
    config.ui.statusBarStyle = style
    
    // 設定 meta tag
    let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'theme-color'
      document.head.appendChild(metaTag)
    }
    
    const color = style === 'dark' ? '#000000' : '#ffffff'
    metaTag.content = color
  }

  // 全螢幕模式
  const toggleFullscreen = async (enable?: boolean) => {
    const shouldEnable = enable ?? !config.ui.fullScreen
    
    try {
      if (shouldEnable) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
      config.ui.fullScreen = shouldEnable
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error)
    }
  }

  // 螢幕方向鎖定
  const lockOrientation = async (orientation: 'portrait' | 'landscape') => {
    try {
      if ('orientation' in screen && 'lock' in screen.orientation) {
        await screen.orientation.lock(orientation)
        config.ui.orientation = orientation
      }
    } catch (error) {
      console.warn('Orientation lock failed:', error)
    }
  }

  // 效能模式切換
  const setPerformanceMode = (lowPower: boolean) => {
    config.performance.lowPowerMode = lowPower
    config.performance.reducedAnimations = lowPower
    config.performance.lazyLoadImages = lowPower
    
    // 應用到 DOM
    document.documentElement.classList.toggle('low-power-mode', lowPower)
  }

  // 清理函數
  const cleanup = () => {
    gestureRecognizers.value.forEach(recognizer => {
      if (recognizer.stopListening) {
        (recognizer as any).stopListening()
      }
    })
  }

  // 生命週期
  onMounted(() => {
    detectDeviceInfo()
    detectNetworkInfo()
    
    const cleanupFunctions = [
      detectVirtualKeyboard(),
      detectOrientationChange(),
      detectNetworkChange()
    ]

    onUnmounted(() => {
      cleanupFunctions.forEach(fn => fn())
      cleanup()
    })
  })

  return {
    // 狀態
    config,
    deviceInfo: deviceInfo,
    networkInfo: networkInfo,
    isKeyboardVisible: isKeyboardVisible,
    
    // 計算屬性
    isMobile,
    isTablet,
    isTouchDevice,
    isLandscape,
    isPortrait,
    isLowBandwidth,
    
    // 方法
    createGestureRecognizer,
    vibrate,
    installPWA,
    setStatusBarStyle,
    toggleFullscreen,
    lockOrientation,
    setPerformanceMode,
    cleanup
  }
}

// 便利函數
export function detectMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function detectTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function getScreenSize(): { width: number; height: number; type: string } {
  const width = window.screen.width
  const height = window.screen.height
  
  let type = 'desktop'
  if (width < 768) {
    type = 'mobile'
  } else if (width < 1024) {
    type = 'tablet'
  }
  
  return { width, height, type }
}
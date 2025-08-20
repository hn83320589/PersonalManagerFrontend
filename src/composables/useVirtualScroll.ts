import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  buffer?: number
  threshold?: number
}

interface VirtualScrollItem {
  index: number
  top: number
  bottom: number
}

/**
 * 虛擬滾動 Composable
 * 用於處理大量數據列表的性能優化
 */
export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight,
    buffer = 5,
    threshold = 100
  } = options

  // DOM 引用
  const containerRef = ref<HTMLElement>()
  const contentRef = ref<HTMLElement>()
  
  // 滾動狀態
  const scrollTop = ref(0)
  const isScrolling = ref(false)
  
  // 計算屬性
  const totalHeight = computed(() => items.length * itemHeight)
  const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight))
  const startIndex = computed(() => {
    return Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
  })
  const endIndex = computed(() => {
    return Math.min(
      items.length - 1,
      startIndex.value + visibleCount.value + buffer * 2
    )
  })
  
  // 可見項目
  const visibleItems = computed(() => {
    const result: Array<{
      item: T
      index: number
      style: {
        height: string
        transform: string
      }
    }> = []
    
    for (let i = startIndex.value; i <= endIndex.value; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          style: {
            height: `${itemHeight}px`,
            transform: `translateY(${i * itemHeight}px)`
          }
        })
      }
    }
    
    return result
  })

  // 滾動處理器
  let scrollTimer: ReturnType<typeof setTimeout>
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    isScrolling.value = true
    
    // 防抖處理
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  // 滾動到指定項目
  const scrollToItem = async (index: number, position: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.value) return
    
    let targetScrollTop = index * itemHeight
    
    switch (position) {
      case 'center':
        targetScrollTop -= (containerHeight - itemHeight) / 2
        break
      case 'end':
        targetScrollTop -= containerHeight - itemHeight
        break
    }
    
    // 確保在有效範圍內
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight.value - containerHeight))
    
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }

  // 滾動到頂部
  const scrollToTop = () => {
    if (containerRef.value) {
      containerRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 滾動到底部
  const scrollToBottom = () => {
    if (containerRef.value) {
      containerRef.value.scrollTo({ 
        top: totalHeight.value - containerHeight, 
        behavior: 'smooth' 
      })
    }
  }

  // 獲取項目位置信息
  const getItemPosition = (index: number): VirtualScrollItem => {
    const top = index * itemHeight
    return {
      index,
      top,
      bottom: top + itemHeight
    }
  }

  // 檢查項目是否可見
  const isItemVisible = (index: number): boolean => {
    const { top, bottom } = getItemPosition(index)
    const viewportTop = scrollTop.value
    const viewportBottom = scrollTop.value + containerHeight
    
    return bottom > viewportTop && top < viewportBottom
  }

  // 獲取當前可見項目範圍
  const getVisibleRange = () => {
    return {
      start: startIndex.value,
      end: endIndex.value,
      count: endIndex.value - startIndex.value + 1
    }
  }

  // 生命週期管理
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
    clearTimeout(scrollTimer)
  })

  return {
    // DOM 引用
    containerRef,
    contentRef,
    
    // 狀態
    scrollTop,
    isScrolling,
    
    // 計算屬性
    totalHeight,
    visibleCount,
    startIndex,
    endIndex,
    visibleItems,
    
    // 方法
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    getItemPosition,
    isItemVisible,
    getVisibleRange
  }
}

/**
 * 無限滾動 Composable
 * 用於實現分頁數據的無限載入
 */
export function useInfiniteScroll<T>(
  loadMore: () => Promise<T[]>,
  options: {
    threshold?: number
    rootMargin?: string
    enabled?: boolean
  } = {}
) {
  const {
    threshold = 100,
    rootMargin = '100px 0px',
    enabled = true
  } = options

  const loading = ref(false)
  const finished = ref(false)
  const error = ref<string | null>(null)
  const triggerRef = ref<HTMLElement>()

  let observer: IntersectionObserver | null = null

  const load = async () => {
    if (loading.value || finished.value || !enabled) return

    try {
      loading.value = true
      error.value = null
      
      const newItems = await loadMore()
      
      if (newItems.length === 0) {
        finished.value = true
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入失敗'
    } finally {
      loading.value = false
    }
  }

  const setupObserver = () => {
    if (!triggerRef.value || !('IntersectionObserver' in window)) return

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          load()
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    )

    observer.observe(triggerRef.value)
  }

  const reset = () => {
    loading.value = false
    finished.value = false
    error.value = null
    
    if (observer) {
      observer.disconnect()
    }
    
    nextTick(() => {
      setupObserver()
    })
  }

  const checkIfNearBottom = (element: HTMLElement) => {
    const { scrollTop, scrollHeight, clientHeight } = element
    return scrollHeight - scrollTop - clientHeight < threshold
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    triggerRef,
    loading,
    finished,
    error,
    load,
    reset,
    checkIfNearBottom
  }
}

/**
 * 平滑滾動 Composable
 */
export function useSmoothScroll() {
  const scrollToElement = (
    element: HTMLElement | string,
    options: {
      behavior?: ScrollBehavior
      block?: ScrollLogicalPosition
      inline?: ScrollLogicalPosition
      offset?: number
    } = {}
  ) => {
    const {
      behavior = 'smooth',
      block = 'start',
      inline = 'nearest',
      offset = 0
    } = options

    const target = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element

    if (!target) return

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset

    window.scrollTo({
      top: targetPosition,
      behavior
    })
  }

  const scrollToPosition = (
    position: number,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    window.scrollTo({
      top: position,
      behavior
    })
  }

  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    scrollToPosition(0, behavior)
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    scrollToPosition(document.documentElement.scrollHeight, behavior)
  }

  return {
    scrollToElement,
    scrollToPosition,
    scrollToTop,
    scrollToBottom
  }
}

/**
 * 滾動監聽 Composable
 */
export function useScrollListener() {
  const scrollY = ref(0)
  const scrollX = ref(0)
  const isScrollingUp = ref(false)
  const isScrollingDown = ref(false)
  const isAtTop = ref(true)
  const isAtBottom = ref(false)

  let lastScrollY = 0
  let ticking = false

  const updateScrollState = () => {
    scrollY.value = window.pageYOffset || document.documentElement.scrollTop
    scrollX.value = window.pageXOffset || document.documentElement.scrollLeft

    isScrollingUp.value = scrollY.value < lastScrollY
    isScrollingDown.value = scrollY.value > lastScrollY
    isAtTop.value = scrollY.value <= 0
    isAtBottom.value = 
      window.innerHeight + scrollY.value >= document.documentElement.scrollHeight - 10

    lastScrollY = scrollY.value
    ticking = false
  }

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollState)
      ticking = true
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollState() // 初始化狀態
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    scrollY,
    scrollX,
    isScrollingUp,
    isScrollingDown,
    isAtTop,
    isAtBottom
  }
}
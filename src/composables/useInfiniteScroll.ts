import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  enabled?: Ref<boolean>
  immediate?: boolean
}

export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: InfiniteScrollOptions = {}
) {
  const {
    threshold = 100,
    rootMargin = '0px',
    enabled = ref(true),
    immediate = false,
  } = options

  const triggerRef: Ref<HTMLElement | null> = ref(null)
  const isLoading = ref(false)
  const hasMore = ref(true)
  const observer: Ref<IntersectionObserver | null> = ref(null)

  const handleIntersect = async (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    
    if (
      entry.isIntersecting &&
      enabled.value &&
      !isLoading.value &&
      hasMore.value
    ) {
      isLoading.value = true
      
      try {
        await callback()
      } catch (error) {
        console.error('Infinite scroll callback error:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  const setupObserver = () => {
    if (!triggerRef.value) return

    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(handleIntersect, {
        rootMargin,
        threshold: 0.01,
      })
      
      observer.value.observe(triggerRef.value)
    }
  }

  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }

  const stop = () => {
    hasMore.value = false
  }

  const resume = () => {
    hasMore.value = true
  }

  onMounted(() => {
    if (immediate) {
      setupObserver()
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    triggerRef,
    isLoading,
    hasMore,
    setupObserver,
    reset,
    stop,
    resume,
  }
}

// Alternative scroll-based infinite scroll for better browser support
export function useScrollBasedInfiniteScroll(
  callback: () => void | Promise<void>,
  options: {
    threshold?: number
    enabled?: Ref<boolean>
    container?: Ref<HTMLElement | null>
  } = {}
) {
  const {
    threshold = 100,
    enabled = ref(true),
    container = ref(null),
  } = options

  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = async () => {
    if (!enabled.value || isLoading.value || !hasMore.value) return

    const element = container.value || window
    const scrollContainer = container.value || document.documentElement

    let scrollTop: number
    let scrollHeight: number
    let clientHeight: number

    if (container.value) {
      scrollTop = container.value.scrollTop
      scrollHeight = container.value.scrollHeight
      clientHeight = container.value.clientHeight
    } else {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    }

    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold

    if (isNearBottom) {
      isLoading.value = true
      
      try {
        await callback()
      } catch (error) {
        console.error('Infinite scroll callback error:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  const throttledHandleScroll = (() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    
    return () => {
      if (timeoutId) return
      
      timeoutId = setTimeout(() => {
        handleScroll()
        timeoutId = null
      }, 100)
    }
  })()

  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }

  const stop = () => {
    hasMore.value = false
  }

  const resume = () => {
    hasMore.value = true
  }

  onMounted(() => {
    const element = container.value || window
    element.addEventListener('scroll', throttledHandleScroll, { passive: true })
  })

  onUnmounted(() => {
    const element = container.value || window
    element.removeEventListener('scroll', throttledHandleScroll)
  })

  return {
    isLoading,
    hasMore,
    reset,
    stop,
    resume,
  }
}
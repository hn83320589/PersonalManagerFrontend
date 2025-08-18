import { ref, onMounted, onUnmounted, type Ref } from 'vue'

// Composable for lazy loading images
export function useLazyImage() {
  const imageRef: Ref<HTMLImageElement | null> = ref(null)
  const isLoaded = ref(false)
  const isError = ref(false)
  const observer: Ref<IntersectionObserver | null> = ref(null)

  const loadImage = (src: string) => {
    if (!imageRef.value) return

    const img = imageRef.value
    img.src = src
    
    img.onload = () => {
      isLoaded.value = true
      img.classList.add('lazy-loaded')
    }
    
    img.onerror = () => {
      isError.value = true
      img.classList.add('lazy-error')
    }
  }

  const observe = (src: string) => {
    if (!imageRef.value) return

    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage(src)
              observer.value?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      )
      
      observer.value.observe(imageRef.value)
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage(src)
    }
  }

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    imageRef,
    isLoaded,
    isError,
    observe,
  }
}

// Composable for lazy loading components/content
export function useLazyContent() {
  const elementRef: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)
  const observer: Ref<IntersectionObserver | null> = ref(null)

  onMounted(() => {
    if (!elementRef.value) return

    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible.value = true
              observer.value?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '100px 0px',
          threshold: 0.01,
        }
      )
      
      observer.value.observe(elementRef.value)
    } else {
      // Fallback: immediately set as visible
      isVisible.value = true
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    elementRef,
    isVisible,
  }
}

// Composable for infinite scrolling
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: {
    threshold?: number
    rootMargin?: string
    enabled?: Ref<boolean>
  } = {}
) {
  const {
    threshold = 200,
    rootMargin = '0px',
    enabled = ref(true),
  } = options

  const triggerRef: Ref<HTMLElement | null> = ref(null)
  const isLoading = ref(false)
  const observer: Ref<IntersectionObserver | null> = ref(null)

  const handleIntersect = async (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    
    if (entry.isIntersecting && enabled.value && !isLoading.value) {
      isLoading.value = true
      try {
        await callback()
      } finally {
        isLoading.value = false
      }
    }
  }

  onMounted(() => {
    if (!triggerRef.value) return

    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(handleIntersect, {
        rootMargin,
        threshold: 0.01,
      })
      
      observer.value.observe(triggerRef.value)
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
  }
}

// Composable for virtual scrolling (for large lists)
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: {
    itemHeight: number
    containerHeight: number
    overscan?: number
  }
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
  } = options

  const scrollTop = ref(0)
  const containerRef: Ref<HTMLElement | null> = ref(null)

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = ref(0)

  const startIndex = ref(0)
  const endIndex = ref(visibleItemsCount)
  const visibleItems = ref<T[]>([])

  const updateVisibleItems = () => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(
      start + visibleItemsCount + overscan,
      items.value.length
    )

    startIndex.value = Math.max(0, start - overscan)
    endIndex.value = end
    
    visibleItems.value = items.value.slice(startIndex.value, endIndex.value)
    totalHeight.value = items.value.length * itemHeight
  }

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    updateVisibleItems()
  }

  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      const scrollPosition = index * itemHeight
      containerRef.value.scrollTop = scrollPosition
      scrollTop.value = scrollPosition
      updateVisibleItems()
    }
  }

  // Watch items changes
  const stopWatcher = ref(() => {})
  
  onMounted(() => {
    updateVisibleItems()
    
    // Watch for items changes
    import('vue').then(({ watch }) => {
      stopWatcher.value = watch(
        items,
        () => updateVisibleItems(),
        { deep: true }
      )
    })
  })

  onUnmounted(() => {
    stopWatcher.value()
  })

  return {
    containerRef,
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
    scrollToIndex,
  }
}
<template>
  <div 
    ref="imageContainer" 
    class="lazy-image-container"
    :class="containerClass"
  >
    <!-- 載入狀態 -->
    <div
      v-if="!loaded && !error"
      class="lazy-image-placeholder"
      :class="placeholderClass"
      :style="placeholderStyle"
    >
      <div v-if="showPlaceholder" class="lazy-image-placeholder-content">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span v-if="placeholderText" class="text-sm text-gray-500 mt-2">{{ placeholderText }}</span>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div
      v-else-if="error && !hideOnError"
      class="lazy-image-error"
      :class="errorClass"
      :style="errorStyle"
      @click="retry"
    >
      <div class="lazy-image-error-content">
        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm text-gray-500">{{ errorText }}</span>
        <button 
          v-if="showRetry" 
          class="text-xs text-blue-500 hover:text-blue-700 mt-1"
          @click.stop="retry"
        >
          重試
        </button>
      </div>
    </div>

    <!-- 實際圖片 -->
    <img
      v-show="loaded && !error"
      ref="imageElement"
      :src="currentSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 漸進式載入疊加層 -->
    <div
      v-if="useProgressiveLoading && blurDataUrl && !loaded"
      class="lazy-image-blur absolute inset-0 bg-cover bg-center transition-opacity duration-300"
      :style="{ backgroundImage: `url(${blurDataUrl})`, opacity: loaded ? 0 : 1 }"
    ></div>

    <!-- 覆蓋層插槽 -->
    <div v-if="$slots.overlay" class="lazy-image-overlay">
      <slot name="overlay"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
  src: string
  alt?: string
  srcset?: string
  sizes?: string
  
  // 佔位符配置
  placeholderText?: string
  showPlaceholder?: boolean
  placeholderClass?: string
  blurDataUrl?: string
  
  // 錯誤處理
  errorText?: string
  showRetry?: boolean
  hideOnError?: boolean
  errorClass?: string
  fallbackSrc?: string
  
  // 懶載入配置
  lazy?: boolean
  rootMargin?: string
  threshold?: number
  
  // 樣式配置
  width?: string | number
  height?: string | number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  containerClass?: string
  imageClass?: string
  
  // 進階功能
  useProgressiveLoading?: boolean
  retryCount?: number
  retryDelay?: number
  
  // 預載入
  preload?: boolean
  priority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholderText: '載入中...',
  showPlaceholder: true,
  errorText: '載入失敗',
  showRetry: true,
  hideOnError: false,
  lazy: true,
  rootMargin: '50px',
  threshold: 0.1,
  objectFit: 'cover',
  useProgressiveLoading: false,
  retryCount: 2,
  retryDelay: 1000,
  preload: false,
  priority: false
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  intersect: [entry: IntersectionObserverEntry]
}>()

// 狀態管理
const loaded = ref(false)
const error = ref(false)
const currentRetryCount = ref(0)
const imageContainer = ref<HTMLElement>()
const imageElement = ref<HTMLImageElement>()

// 當前圖片源
const currentSrc = ref('')

// 樣式計算
const placeholderStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const errorStyle = computed(() => placeholderStyle.value)

const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: props.objectFit,
}))

// Intersection Observer
let observer: IntersectionObserver | null = null

const setupLazyLoading = () => {
  if (!props.lazy || !imageContainer.value || typeof IntersectionObserver === 'undefined') {
    loadImage()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      emit('intersect', entry)
      
      if (entry.isIntersecting) {
        loadImage()
        if (observer && imageContainer.value) {
          observer.unobserve(imageContainer.value)
        }
      }
    },
    {
      rootMargin: props.rootMargin,
      threshold: props.threshold
    }
  )

  observer.observe(imageContainer.value)
}

const loadImage = () => {
  if (currentSrc.value || loaded.value) return

  // 設置圖片源
  currentSrc.value = props.src

  // 預載入處理
  if (props.preload && typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = props.src
    if (props.srcset) {
      link.setAttribute('imagesrcset', props.srcset)
    }
    if (props.sizes) {
      link.setAttribute('imagesizes', props.sizes)
    }
    document.head.appendChild(link)
  }
}

const handleLoad = (event: Event) => {
  loaded.value = true
  error.value = false
  currentRetryCount.value = 0
  emit('load', event)
}

const handleError = async (event: Event) => {
  error.value = true

  // 嘗試使用備用圖片
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc
    return
  }

  // 重試機制
  if (currentRetryCount.value < props.retryCount) {
    currentRetryCount.value++
    
    await new Promise(resolve => setTimeout(resolve, props.retryDelay))
    
    // 重新載入
    if (imageElement.value) {
      imageElement.value.src = ''
      await nextTick()
      imageElement.value.src = currentSrc.value
    }
    return
  }

  emit('error', event)
}

const retry = () => {
  error.value = false
  loaded.value = false
  currentRetryCount.value = 0
  loadImage()
}

// 監聽 src 變化
watch(() => props.src, (newSrc) => {
  if (newSrc !== currentSrc.value) {
    loaded.value = false
    error.value = false
    currentRetryCount.value = 0
    currentSrc.value = ''
    
    if (props.lazy) {
      setupLazyLoading()
    } else {
      loadImage()
    }
  }
})

// 生命週期
onMounted(() => {
  setupLazyLoading()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.lazy-image-container {
  @apply relative inline-block;
}

.lazy-image-placeholder {
  @apply flex items-center justify-center bg-gray-100 text-gray-400;
}

.lazy-image-placeholder-content {
  @apply flex flex-col items-center justify-center text-center;
}

.lazy-image-error {
  @apply flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 cursor-pointer transition-colors hover:bg-gray-100;
}

.lazy-image-error-content {
  @apply flex flex-col items-center justify-center text-center p-4;
}

.lazy-image-blur {
  filter: blur(10px);
  transform: scale(1.1);
}

.lazy-image-overlay {
  @apply absolute inset-0 flex items-center justify-center;
}

/* 響應式圖片 */
img {
  max-width: 100%;
  height: auto;
}

/* 載入動畫 */
.lazy-image-container.loading {
  @apply animate-pulse;
}

/* 深色主題 */
@media (prefers-color-scheme: dark) {
  .lazy-image-placeholder {
    @apply bg-gray-800 text-gray-500;
  }
  
  .lazy-image-error {
    @apply bg-gray-800 border-gray-600 hover:bg-gray-700;
  }
}
</style>
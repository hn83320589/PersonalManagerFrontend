<template>
  <div class="responsive-image-container" :class="containerClass" :style="containerStyle">
    <!-- 圖片元素 -->
    <img
      ref="imageRef"
      v-bind="imageAttributes"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />
    
    <!-- 載入狀態 -->
    <div v-if="showPlaceholder && (!loaded || loading)" class="image-placeholder" :class="placeholderClass">
      <slot name="placeholder">
        <div class="placeholder-content">
          <div v-if="loading" class="loading-spinner">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <div v-else class="placeholder-icon">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p v-if="placeholderText" class="text-sm text-gray-500 mt-2">
            {{ placeholderText }}
          </p>
        </div>
      </slot>
    </div>

    <!-- 錯誤狀態 -->
    <div v-if="error && !hideOnError" class="image-error" :class="errorClass" @click="retry">
      <slot name="error" :retry="retry">
        <div class="error-content">
          <svg class="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-sm text-red-500 mb-2">{{ errorText }}</p>
          <button class="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-700 transition-colors">
            重試
          </button>
        </div>
      </slot>
    </div>

    <!-- 覆蓋層 -->
    <div v-if="$slots.overlay" class="image-overlay" :class="overlayClass">
      <slot name="overlay" v-bind="{ loaded, loading, error, currentSrc }"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useResponsive, type Breakpoint } from '@/composables/useResponsive'

interface ResponsiveImageSource {
  breakpoint: Breakpoint
  src: string
  width?: number
  height?: number
  type?: string
}

interface Props {
  // 基本圖片屬性
  src: string | Partial<Record<Breakpoint, string>>
  alt: string
  
  // 響應式圖片源
  sources?: ResponsiveImageSource[]
  
  // 響應式尺寸
  width?: string | number | Partial<Record<Breakpoint, string | number>>
  height?: string | number | Partial<Record<Breakpoint, string | number>>
  
  // 圖片適應方式
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | Partial<Record<Breakpoint, 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'>>
  objectPosition?: string | Partial<Record<Breakpoint, string>>
  
  // 圓角和邊框
  rounded?: string | Partial<Record<Breakpoint, string>>
  border?: string | Partial<Record<Breakpoint, string>>
  
  // 載入相關
  lazy?: boolean
  placeholderText?: string
  showPlaceholder?: boolean
  
  // 錯誤處理
  errorText?: string
  hideOnError?: boolean
  fallbackSrc?: string
  
  // 樣式相關
  containerClass?: string
  imageClass?: string
  placeholderClass?: string
  errorClass?: string
  overlayClass?: string
  
  // 互動
  clickable?: boolean
  
  // WebP 支援
  webpSrc?: string | Partial<Record<Breakpoint, string>>
  avifSrc?: string | Partial<Record<Breakpoint, string>>
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  lazy: true,
  placeholderText: '載入中...',
  showPlaceholder: true,
  errorText: '載入失敗',
  hideOnError: false,
  clickable: false,
  objectFit: 'cover'
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  click: [event: Event]
}>()

const { 
  currentBreakpoint, 
  getResponsiveValue, 
  isMobile,
  isRetina 
} = useResponsive()

// 狀態管理
const loaded = ref(false)
const loading = ref(false)
const error = ref(false)
const imageRef = ref<HTMLImageElement>()

// 當前圖片源
const currentSrc = computed(() => {
  // 優先使用響應式源
  if (props.sources?.length) {
    // 從當前斷點向下查找合適的圖片源
    const breakpoints = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[]
    const currentIndex = breakpoints.indexOf(currentBreakpoint.value)
    
    for (let i = currentIndex; i < breakpoints.length; i++) {
      const bp = breakpoints[i]
      const source = props.sources.find(s => s.breakpoint === bp)
      if (source) {
        return source.src
      }
    }
  }
  
  // 響應式 src 配置
  if (typeof props.src === 'object') {
    return getResponsiveValue(props.src, '')
  }
  
  return props.src as string
})

// WebP/AVIF 支援檢測
const supportsWebP = ref(false)
const supportsAVIF = ref(false)

const checkFormatSupport = async () => {
  // 檢測 WebP 支援
  const webpCanvas = document.createElement('canvas')
  webpCanvas.width = 1
  webpCanvas.height = 1
  supportsWebP.value = webpCanvas.toDataURL('image/webp').indexOf('webp') > -1
  
  // 檢測 AVIF 支援 (較新的格式)
  try {
    const avifTest = new Image()
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    await new Promise((resolve, reject) => {
      avifTest.onload = () => {
        supportsAVIF.value = true
        resolve(true)
      }
      avifTest.onerror = () => {
        supportsAVIF.value = false
        reject(false)
      }
    })
  } catch {
    supportsAVIF.value = false
  }
}

// 獲取最佳圖片源
const getBestImageSrc = () => {
  // AVIF 優先（最小檔案大小）
  if (supportsAVIF.value && props.avifSrc) {
    const avifSrc = typeof props.avifSrc === 'object' 
      ? getResponsiveValue(props.avifSrc, '')
      : props.avifSrc
    if (avifSrc) return avifSrc
  }
  
  // WebP 次之（良好的壓縮比）
  if (supportsWebP.value && props.webpSrc) {
    const webpSrc = typeof props.webpSrc === 'object'
      ? getResponsiveValue(props.webpSrc, '')
      : props.webpSrc
    if (webpSrc) return webpSrc
  }
  
  // 降級到當前源
  return currentSrc.value
}

// 圖片屬性
const imageAttributes = computed(() => {
  const attrs: Record<string, any> = {
    src: getBestImageSrc(),
    alt: props.alt,
    loading: props.lazy ? 'lazy' : 'eager'
  }
  
  // 響應式寬高
  const currentWidth = typeof props.width === 'object' 
    ? getResponsiveValue(props.width, 'auto')
    : props.width
    
  const currentHeight = typeof props.height === 'object'
    ? getResponsiveValue(props.height, 'auto')
    : props.height
  
  if (currentWidth && currentWidth !== 'auto') {
    attrs.width = typeof currentWidth === 'number' ? currentWidth : parseInt(currentWidth as string)
  }
  
  if (currentHeight && currentHeight !== 'auto') {
    attrs.height = typeof currentHeight === 'number' ? currentHeight : parseInt(currentHeight as string)
  }
  
  return attrs
})

// 容器樣式
const containerStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  const currentWidth = typeof props.width === 'object' 
    ? getResponsiveValue(props.width, 'auto')
    : props.width
    
  const currentHeight = typeof props.height === 'object'
    ? getResponsiveValue(props.height, 'auto')
    : props.height
  
  if (currentWidth) {
    styles.width = typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth as string
  }
  
  if (currentHeight) {
    styles.height = typeof currentHeight === 'number' ? `${currentHeight}px` : currentHeight as string
  }
  
  return styles
})

// 圖片樣式
const imageStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  // 物件適應
  const objectFit = typeof props.objectFit === 'object'
    ? getResponsiveValue(props.objectFit, 'cover')
    : props.objectFit
  styles.objectFit = objectFit
  
  // 物件位置
  if (props.objectPosition) {
    const objectPosition = typeof props.objectPosition === 'object'
      ? getResponsiveValue(props.objectPosition, 'center')
      : props.objectPosition
    styles.objectPosition = objectPosition
  }
  
  // 圓角
  if (props.rounded) {
    const rounded = typeof props.rounded === 'object'
      ? getResponsiveValue(props.rounded, '0')
      : props.rounded
    styles.borderRadius = rounded
  }
  
  // 邊框
  if (props.border) {
    const border = typeof props.border === 'object'
      ? getResponsiveValue(props.border, 'none')
      : props.border
    styles.border = border
  }
  
  return styles
})

// 樣式類名
const containerClass = computed(() => {
  const classes = ['responsive-image-container']
  
  classes.push(`breakpoint-${currentBreakpoint.value}`)
  
  if (isMobile.value) classes.push('mobile')
  if (loaded.value) classes.push('loaded')
  if (loading.value) classes.push('loading')
  if (error.value) classes.push('error')
  if (props.clickable) classes.push('clickable')
  
  if (props.containerClass) classes.push(props.containerClass)
  
  return classes
})

const imageClass = computed(() => {
  const classes = ['responsive-image']
  
  if (loaded.value) classes.push('image-loaded')
  if (props.imageClass) classes.push(props.imageClass)
  
  return classes
})

// 事件處理
const handleLoad = (event: Event) => {
  loaded.value = true
  loading.value = false
  error.value = false
  emit('load', event)
}

const handleError = (event: Event) => {
  loading.value = false
  
  // 嘗試備用圖片
  if (props.fallbackSrc && imageRef.value && imageRef.value.src !== props.fallbackSrc) {
    imageRef.value.src = props.fallbackSrc
    return
  }
  
  error.value = true
  emit('error', event)
}

const handleClick = (event: Event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const retry = () => {
  error.value = false
  loading.value = true
  
  if (imageRef.value) {
    imageRef.value.src = getBestImageSrc()
  }
}

// 監聽響應式變化
watch([currentBreakpoint, () => props.src], () => {
  if (!error.value) {
    loading.value = true
  }
})

// 初始化
onMounted(async () => {
  await checkFormatSupport()
  
  if (imageRef.value && !imageRef.value.complete) {
    loading.value = true
  }
})
</script>

<style scoped>
.responsive-image-container {
  position: relative;
  overflow: hidden;
}

.responsive-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}

.responsive-image-container.loading .responsive-image {
  opacity: 0;
}

.responsive-image-container.loaded .responsive-image {
  opacity: 1;
}

.image-placeholder,
.image-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
}

.image-error {
  background-color: #fef2f2;
  border-color: #fca5a5;
  cursor: pointer;
}

.image-error:hover {
  background-color: #fef2f2;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clickable {
  cursor: pointer;
}

.placeholder-content,
.error-content {
  text-align: center;
  padding: 1rem;
}

/* 載入動畫 */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .responsive-image-container {
    border-radius: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .responsive-image-container {
    border-radius: 0.75rem;
  }
}

/* 深色主題 */
@media (prefers-color-scheme: dark) {
  .image-placeholder {
    background-color: #1f2937;
    border-color: #4b5563;
  }
  
  .image-error {
    background-color: #991b1b;
    border-color: #dc2626;
  }
}
</style>
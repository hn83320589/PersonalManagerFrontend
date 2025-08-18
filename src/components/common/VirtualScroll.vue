<template>
  <div
    ref="containerRef"
    :class="['virtual-scroll-container', containerClass]"
    :style="{ height: `${containerHeight}px`, overflow: 'auto' }"
    @scroll="handleScroll"
  >
    <!-- Spacer for items before visible range -->
    <div :style="{ height: `${startOffset}px` }"></div>
    
    <!-- Visible items -->
    <div
      v-for="(item, index) in visibleItems"
      :key="getItemKey(item, startIndex + index)"
      :style="{ height: `${itemHeight}px` }"
      :class="itemClass"
    >
      <slot
        :item="item"
        :index="startIndex + index"
        :isVisible="true"
      ></slot>
    </div>
    
    <!-- Spacer for items after visible range -->
    <div :style="{ height: `${endOffset}px` }"></div>
    
    <!-- Loading indicator -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-4"
    >
      <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="ml-2 text-gray-600">載入中...</span>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { throttle } from '@/utils/performance'

interface Props {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
  containerClass?: string
  itemClass?: string
  loading?: boolean
  keyField?: keyof T
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5,
  containerClass: '',
  itemClass: '',
  loading: false,
  keyField: undefined,
})

const emit = defineEmits<{
  scrollToBottom: []
  scrollToTop: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const isScrolling = ref(false)

// Calculate visible range
const visibleItemsCount = computed(() =>
  Math.ceil(props.containerHeight / props.itemHeight)
)

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
)

const endIndex = computed(() =>
  Math.min(
    props.items.length,
    startIndex.value + visibleItemsCount.value + props.overscan * 2
  )
)

const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value)
)

const startOffset = computed(() => startIndex.value * props.itemHeight)

const endOffset = computed(() =>
  (props.items.length - endIndex.value) * props.itemHeight
)

// Throttled scroll handler for better performance
const handleScroll = throttle((event: Event) => {
  const target = event.target as HTMLElement
  const newScrollTop = target.scrollTop
  
  scrollTop.value = newScrollTop
  isScrolling.value = true
  
  // Check if near bottom (for infinite scroll)
  const threshold = 100
  const isNearBottom =
    target.scrollHeight - target.scrollTop - target.clientHeight < threshold
  
  if (isNearBottom) {
    emit('scrollToBottom')
  }
  
  // Check if at top
  if (newScrollTop === 0) {
    emit('scrollToTop')
  }
  
  // Reset scrolling state after a delay
  setTimeout(() => {
    isScrolling.value = false
  }, 150)
}, 16) // ~60fps

// Get unique key for each item
const getItemKey = (item: T, index: number): string | number => {
  if (props.keyField && typeof props.keyField === 'string') {
    const key = item[props.keyField]
    return typeof key === 'string' || typeof key === 'number' ? key : index
  }
  return index
}

// Public methods
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
  if (containerRef.value) {
    const scrollPosition = index * props.itemHeight
    containerRef.value.scrollTo({
      top: scrollPosition,
      behavior,
    })
  }
}

const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollToIndex(0, behavior)
}

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  scrollToIndex(props.items.length - 1, behavior)
}

// Watch for items length changes and adjust scroll if needed
watch(
  () => props.items.length,
  (newLength, oldLength) => {
    if (newLength < oldLength && containerRef.value) {
      // Items were removed, check if we need to adjust scroll
      const maxScrollTop = Math.max(0, newLength * props.itemHeight - props.containerHeight)
      if (scrollTop.value > maxScrollTop) {
        containerRef.value.scrollTop = maxScrollTop
      }
    }
  }
)

// Expose public methods
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getCurrentScrollPosition: () => scrollTop.value,
  isScrolling: () => isScrolling.value,
})
</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
}

.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
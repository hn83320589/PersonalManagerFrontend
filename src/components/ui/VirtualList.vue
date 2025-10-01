<template>
  <div 
    ref="containerRef"
    class="virtual-list-container"
    :style="containerStyle as any"
    @scroll="handleScroll"
  >
    <!-- 上方填充區域 -->
    <div 
      v-if="visibleRange.offsetBefore > 0"
      :style="{ height: `${visibleRange.offsetBefore}px` }"
      class="virtual-list-spacer"
    ></div>

    <!-- 可見項目 -->
    <div
      v-for="{ item, index, style } in visibleItems"
      :key="getItemKey ? getItemKey(item as T, index) : index"
      :style="style"
      class="virtual-list-item"
      :data-index="index"
    >
      <slot 
        name="item" 
        :item="item" 
        :index="index" 
        :active="index === activeIndex"
      >
        <!-- 預設渲染 -->
        <div class="p-4 border-b border-gray-200">
          {{ item }}
        </div>
      </slot>
    </div>

    <!-- 下方填充區域 -->
    <div 
      v-if="visibleRange.offsetAfter > 0"
      :style="{ height: `${visibleRange.offsetAfter}px` }"
      class="virtual-list-spacer"
    ></div>

    <!-- 載入更多觸發器 -->
    <div
      v-if="hasMore && !finished"
      ref="triggerRef"
      class="virtual-list-trigger p-4 flex justify-center"
    >
      <div v-if="loading" class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        <span class="text-sm text-gray-500">載入中...</span>
      </div>
      <div v-else-if="error" class="flex items-center space-x-2 text-red-500">
        <span class="text-sm">載入失敗</span>
        <button 
          @click="$emit('retry')"
          class="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
        >
          重試
        </button>
      </div>
      <div v-else class="text-sm text-gray-500">
        滾動載入更多...
      </div>
    </div>

    <!-- 結束提示 -->
    <div 
      v-if="finished && items.length > 0" 
      class="virtual-list-end p-4 text-center text-sm text-gray-500"
    >
      <slot name="end">
        沒有更多內容了
      </slot>
    </div>

    <!-- 空狀態 -->
    <div 
      v-if="items.length === 0 && !loading" 
      class="virtual-list-empty p-8 text-center"
    >
      <slot name="empty">
        <div class="text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6.5a2.5 2.5 0 00-2.5 2.5v0a2.5 2.5 0 00-2.5-2.5H4"></path>
          </svg>
          <p class="text-lg font-medium mb-2">暫無數據</p>
          <p class="text-sm">目前沒有任何內容可顯示</p>
        </div>
      </slot>
    </div>

    <!-- 滾動指示器 -->
    <div 
      v-if="showScrollIndicator && items.length > visibleCount"
      class="virtual-list-scroll-indicator"
      :class="scrollIndicatorClass"
    >
      <div 
        class="virtual-list-scroll-thumb"
        :style="scrollThumbStyle"
      ></div>
    </div>

    <!-- 回到頂部按鈕 -->
    <transition name="fade">
      <button
        v-if="showBackToTop && scrollY > 200"
        @click="scrollToTop"
        class="virtual-list-back-to-top fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors z-50"
        title="回到頂部"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
        </svg>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'
import { useVirtualScroll, useInfiniteScroll } from '@/composables/useVirtualScroll'

interface Props {
  items: T[]
  itemHeight?: number
  containerHeight?: number
  buffer?: number
  threshold?: number
  
  // 無限滾動
  hasMore?: boolean
  loading?: boolean
  finished?: boolean
  error?: boolean
  
  // 樣式配置
  showScrollIndicator?: boolean
  showBackToTop?: boolean
  scrollIndicatorClass?: string
  
  // 功能配置
  getItemKey?: (item: T, index: number) => string | number
  activeIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 60,
  containerHeight: 400,
  buffer: 5,
  threshold: 100,
  hasMore: false,
  loading: false,
  finished: false,
  error: false,
  showScrollIndicator: true,
  showBackToTop: true,
  scrollIndicatorClass: '',
  activeIndex: -1
})

const emit = defineEmits<{
  loadMore: []
  retry: []
  scroll: [{ scrollTop: number; scrollLeft: number }]
  itemClick: [{ item: T; index: number }]
}>()

// 使用虛擬滾動
const itemsRef = computed(() => props.items)

const virtualScrollResult = useVirtualScroll(itemsRef.value, {
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  buffer: props.buffer,
  threshold: props.threshold
})

// 解構使用的屬性和方法
const {
  containerRef,
  visibleItems,
  totalHeight,
  visibleCount,
  scrollTop,
  isScrolling,
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  getVisibleRange
} = virtualScrollResult

// 創建計算屬性來提供 visibleRange
const visibleRange = computed(() => {
  const range = getVisibleRange()
  return {
    offsetBefore: range.start * props.itemHeight,
    offsetAfter: Math.max(0, (props.items.length - range.end - 1) * props.itemHeight)
  }
})

// 使用無限滾動
const {
  triggerRef,
  loading: infiniteLoading,
  reset
} = useInfiniteScroll(
  async () => {
    emit('loadMore')
    return []
  },
  {
    threshold: props.threshold,
    enabled: props.hasMore && !props.finished,
    rootMargin: '100px 0px'
  }
)

// 容器樣式
const containerStyle = computed(() => ({
  height: `${props.containerHeight}px`,
  overflow: 'auto',
  position: 'relative'
}))

// 滾動指示器樣式
const scrollY = computed(() => scrollTop.value)

const scrollThumbStyle = computed(() => {
  const containerHeight = props.containerHeight
  const scrollHeight = totalHeight.value
  const scrollTop = scrollY.value

  if (scrollHeight <= containerHeight) {
    return { display: 'none' }
  }

  const thumbHeight = Math.max(20, (containerHeight / scrollHeight) * containerHeight)
  const thumbTop = (scrollTop / (scrollHeight - containerHeight)) * (containerHeight - thumbHeight)

  return {
    height: `${thumbHeight}px`,
    transform: `translateY(${thumbTop}px)`,
    backgroundColor: '#94a3b8',
    borderRadius: '4px',
    width: '4px'
  }
})

// 滾動處理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  emit('scroll', {
    scrollTop: target.scrollTop,
    scrollLeft: target.scrollLeft
  })
}

// 導出方法
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  reset,
  containerRef,
  visibleRange,
  visibleItems
})
</script>

<style scoped>
.virtual-list-container {
  position: relative;
}

.virtual-list-item {
  position: absolute;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-list-spacer {
  flex-shrink: 0;
}

.virtual-list-scroll-indicator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  pointer-events: none;
}

.virtual-list-scroll-thumb {
  position: absolute;
  right: 2px;
  transition: opacity 0.2s;
}

.virtual-list-container:hover .virtual-list-scroll-thumb {
  opacity: 0.8;
}

.virtual-list-container:not(:hover) .virtual-list-scroll-thumb {
  opacity: 0.4;
}

.virtual-list-back-to-top {
  transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滾動條樣式 */
.virtual-list-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 載入狀態 */
.virtual-list-container.loading {
  cursor: wait;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .virtual-list-back-to-top {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem;
  }
  
  .virtual-list-scroll-indicator {
    width: 6px;
  }
}
</style>
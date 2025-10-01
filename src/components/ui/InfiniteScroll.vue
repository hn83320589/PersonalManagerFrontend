<template>
  <div class="infinite-scroll-container" :class="containerClass">
    <!-- 內容插槽 -->
    <slot :loading="loading" :error="error" :finished="finished"></slot>

    <!-- 載入更多觸發區域 -->
    <div
      v-if="hasMore && !finished"
      ref="triggerRef"
      class="infinite-scroll-trigger"
      :class="triggerClass"
    >
      <!-- 載入狀態 -->
      <div v-if="loading" class="infinite-scroll-loading" :class="loadingClass">
        <slot name="loading">
          <div class="flex items-center justify-center space-x-3 py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span class="text-gray-600">{{ loadingText }}</span>
          </div>
        </slot>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="infinite-scroll-error" :class="errorClass">
        <slot name="error" :retry="retry" :error="error">
          <div class="flex flex-col items-center justify-center py-8 text-red-500">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="mb-3">{{ errorText }}</span>
            <button
              @click="retry"
              class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
            >
              重試
            </button>
          </div>
        </slot>
      </div>

      <!-- 預載入狀態（當即將觸發載入時） -->
      <div v-else-if="preloading" class="infinite-scroll-preloading" :class="preloadingClass">
        <slot name="preloading">
          <div class="flex items-center justify-center py-4 text-gray-400">
            <div class="animate-pulse flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </slot>
      </div>

      <!-- 準備載入狀態 -->
      <div v-else class="infinite-scroll-ready" :class="readyClass">
        <slot name="ready">
          <div class="flex items-center justify-center py-6 text-gray-500">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            <span class="text-sm">{{ readyText }}</span>
          </div>
        </slot>
      </div>
    </div>

    <!-- 完成狀態 -->
    <div v-if="finished && showFinishedMessage" class="infinite-scroll-finished" :class="finishedClass">
      <slot name="finished">
        <div class="flex items-center justify-center py-6 text-gray-400">
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-sm">{{ finishedText }}</span>
          </div>
        </div>
      </slot>
    </div>

    <!-- 空狀態 -->
    <div v-if="isEmpty && !loading && !error" class="infinite-scroll-empty" :class="emptyClass">
      <slot name="empty">
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6.5a2.5 2.5 0 00-2.5 2.5v0a2.5 2.5 0 00-2.5-2.5H4"></path>
          </svg>
          <h3 class="text-lg font-medium mb-1">{{ emptyTitle }}</h3>
          <p class="text-sm">{{ emptyText }}</p>
        </div>
      </slot>
    </div>

    <!-- 手動載入更多按鈕 -->
    <div 
      v-if="manualMode && hasMore && !finished && !loading && !error"
      class="infinite-scroll-manual"
      :class="manualClass"
    >
      <slot name="manual" :loadMore="handleLoadMore">
        <div class="flex justify-center py-6">
          <button
            @click="handleLoadMore"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {{ manualText }}
          </button>
        </div>
      </slot>
    </div>

    <!-- 載入進度指示器 -->
    <div 
      v-if="showProgress && loading && progress > 0"
      class="infinite-scroll-progress fixed bottom-4 right-4 z-50"
    >
      <div class="bg-white rounded-full shadow-lg p-3">
        <svg class="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16" cy="16" r="14" fill="none"
            stroke="#e5e7eb" stroke-width="4"
          />
          <circle
            cx="16" cy="16" r="14" fill="none"
            stroke="#3b82f6" stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="`${progress * 0.88} 88`"
            class="transition-all duration-300"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-blue-600">
          {{ Math.round(progress) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInfiniteScroll } from '@/composables/useVirtualScroll'

interface Props {
  // 核心功能
  hasMore?: boolean
  loading?: boolean
  finished?: boolean
  error?: boolean | string
  isEmpty?: boolean
  
  // 載入配置
  threshold?: number
  rootMargin?: string
  enabled?: boolean
  
  // 手動模式
  manualMode?: boolean
  
  // 進度顯示
  showProgress?: boolean
  progress?: number
  
  // 文案配置
  loadingText?: string
  errorText?: string
  readyText?: string
  finishedText?: string
  manualText?: string
  emptyTitle?: string
  emptyText?: string
  
  // 樣式配置
  containerClass?: string
  triggerClass?: string
  loadingClass?: string
  errorClass?: string
  preloadingClass?: string
  readyClass?: string
  finishedClass?: string
  emptyClass?: string
  manualClass?: string
  
  // 顯示控制
  showFinishedMessage?: boolean
  
  // 預載入
  preloadDistance?: number
}

const props = withDefaults(defineProps<Props>(), {
  hasMore: true,
  loading: false,
  finished: false,
  error: false,
  isEmpty: false,
  threshold: 100,
  rootMargin: '100px 0px',
  enabled: true,
  manualMode: false,
  showProgress: false,
  progress: 0,
  loadingText: '載入中...',
  errorText: '載入失敗',
  readyText: '下拉載入更多',
  finishedText: '沒有更多內容了',
  manualText: '載入更多',
  emptyTitle: '暫無內容',
  emptyText: '目前沒有任何數據',
  showFinishedMessage: true,
  preloadDistance: 200
})

const emit = defineEmits<{
  loadMore: []
  retry: []
  intersect: [entry: IntersectionObserverEntry]
}>()

// 預載入狀態
const preloading = ref(false)

// 使用無限滾動 composable
const {
  triggerRef,
  loading: infiniteLoading,
  finished,
  error,
  load,
  reset,
  checkIfNearBottom
} = useInfiniteScroll(
  async () => {
    if (!props.manualMode) {
      emit('loadMore')
    }
    return [] // 返回空數組，因為實際數據由父組件管理
  },
  {
    threshold: props.threshold,
    enabled: props.enabled && !props.manualMode
  }
)

// 手動載入更多
const handleLoadMore = () => {
  if (!props.loading && !props.finished && props.hasMore) {
    emit('loadMore')
  }
}

// 重試
const retry = () => {
  emit('retry')
  reset()
}

// 監聽 enabled 變化
watch(() => props.enabled, (enabled) => {
  if (enabled) {
    load()
  } else {
    // 清理邏輯由 composable 內部處理
  }
})

// 監聽是否接近觸發區域（用於預載入提示）
watch(() => props.threshold, () => {
  // 當距離觸發區域較近時顯示預載入狀態
  // 這裡可以結合滾動位置來實現更精確的預載入提示
})

// 導出方法
defineExpose({
  retry,
  reset,
  load,
  triggerRef
})
</script>

<style scoped>
.infinite-scroll-container {
  position: relative;
}

.infinite-scroll-trigger {
  min-height: 1px;
}

.infinite-scroll-progress {
  position: relative;
}

.infinite-scroll-progress svg {
  width: 32px;
  height: 32px;
}

/* 動畫效果 */
.infinite-scroll-loading,
.infinite-scroll-error,
.infinite-scroll-preloading,
.infinite-scroll-ready,
.infinite-scroll-finished {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .infinite-scroll-progress {
    bottom: 1rem;
    right: 1rem;
  }
}

/* 深色主題支援 */
@media (prefers-color-scheme: dark) {
  .infinite-scroll-empty svg,
  .infinite-scroll-finished svg {
    color: #4b5563;
  }
  
  .infinite-scroll-progress .bg-white {
    background-color: #1f2937;
  }
}
</style>
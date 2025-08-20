<template>
  <div class="skeleton-container">
    <!-- 文章列表骨架 -->
    <div v-if="type === 'article'" class="space-y-6">
      <div
        v-for="i in count"
        :key="`article-${i}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        :class="animationClass"
      >
        <div class="flex items-start space-x-4">
          <!-- 圖片骨架 -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gray-200 rounded-lg skeleton-shimmer"></div>
          </div>
          
          <!-- 內容骨架 -->
          <div class="flex-1 space-y-3">
            <!-- 標題 -->
            <div class="space-y-2">
              <div class="h-5 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${75 + Math.random() * 20}%` }"></div>
              <div class="h-5 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${45 + Math.random() * 25}%` }"></div>
            </div>
            
            <!-- 摘要 -->
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${95 + Math.random() * 5}%` }"></div>
              <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${85 + Math.random() * 10}%` }"></div>
              <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${65 + Math.random() * 15}%` }"></div>
            </div>
            
            <!-- 元資訊 -->
            <div class="flex items-center space-x-4 pt-2">
              <div class="h-3 bg-gray-200 rounded skeleton-shimmer w-20"></div>
              <div class="h-3 bg-gray-200 rounded skeleton-shimmer w-16"></div>
              <div class="h-3 bg-gray-200 rounded skeleton-shimmer w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片網格骨架 -->
    <div v-else-if="type === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in count"
        :key="`card-${i}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        :class="animationClass"
      >
        <!-- 圖片骨架 -->
        <div class="w-full h-48 bg-gray-200 skeleton-shimmer"></div>
        
        <!-- 內容骨架 -->
        <div class="p-4 space-y-3">
          <!-- 標題 -->
          <div class="space-y-2">
            <div class="h-5 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${70 + Math.random() * 25}%` }"></div>
            <div class="h-5 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${50 + Math.random() * 20}%` }"></div>
          </div>
          
          <!-- 描述 -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-full"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${80 + Math.random() * 15}%` }"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${60 + Math.random() * 20}%` }"></div>
          </div>
          
          <!-- 標籤 -->
          <div class="flex space-x-2 pt-2">
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-16"></div>
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-20"></div>
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-14"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格骨架 -->
    <div v-else-if="type === 'table'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" :class="animationClass">
      <!-- 表頭骨架 -->
      <div class="border-b border-gray-200 bg-gray-50 p-4">
        <div class="grid grid-cols-5 gap-4">
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-20"></div>
        </div>
      </div>
      
      <!-- 表格內容骨架 -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="i in count"
          :key="`table-row-${i}`"
          class="p-4"
        >
          <div class="grid grid-cols-5 gap-4 items-center">
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${60 + Math.random() * 30}%` }"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${70 + Math.random() * 20}%` }"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-16"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-20"></div>
            <div class="flex space-x-2">
              <div class="h-8 bg-gray-200 rounded skeleton-shimmer w-8"></div>
              <div class="h-8 bg-gray-200 rounded skeleton-shimmer w-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表骨架 -->
    <div v-else-if="type === 'list'" class="space-y-4" :class="animationClass">
      <div
        v-for="i in count"
        :key="`list-${i}`"
        class="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200"
      >
        <!-- 頭像/圖示骨架 -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-gray-200 rounded-full skeleton-shimmer"></div>
        </div>
        
        <!-- 內容骨架 -->
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${60 + Math.random() * 30}%` }"></div>
          <div class="h-3 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${40 + Math.random() * 20}%` }"></div>
        </div>
        
        <!-- 操作按鈕骨架 -->
        <div class="flex-shrink-0">
          <div class="h-8 bg-gray-200 rounded skeleton-shimmer w-20"></div>
        </div>
      </div>
    </div>

    <!-- 個人資料骨架 -->
    <div v-else-if="type === 'profile'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" :class="animationClass">
      <div class="flex items-start space-x-6">
        <!-- 頭像骨架 -->
        <div class="flex-shrink-0">
          <div class="w-24 h-24 bg-gray-200 rounded-full skeleton-shimmer"></div>
        </div>
        
        <!-- 資訊骨架 -->
        <div class="flex-1 space-y-4">
          <!-- 名稱和職稱 -->
          <div class="space-y-2">
            <div class="h-6 bg-gray-200 rounded skeleton-shimmer w-48"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-32"></div>
          </div>
          
          <!-- 聯絡資訊 -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-64"></div>
            <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-52"></div>
          </div>
          
          <!-- 技能標籤 -->
          <div class="flex flex-wrap gap-2 pt-2">
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-16"></div>
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-20"></div>
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-18"></div>
            <div class="h-6 bg-gray-200 rounded-full skeleton-shimmer w-14"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文本段落骨架 -->
    <div v-else-if="type === 'text'" class="space-y-4" :class="animationClass">
      <div
        v-for="i in count"
        :key="`text-${i}`"
        class="space-y-2"
      >
        <div class="h-4 bg-gray-200 rounded skeleton-shimmer w-full"></div>
        <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${80 + Math.random() * 15}%` }"></div>
        <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${70 + Math.random() * 20}%` }"></div>
        <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${85 + Math.random() * 10}%` }"></div>
      </div>
    </div>

    <!-- 統計卡片骨架 -->
    <div v-else-if="type === 'stats'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" :class="animationClass">
      <div
        v-for="i in count"
        :key="`stat-${i}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="space-y-3">
          <!-- 數值 -->
          <div class="h-8 bg-gray-200 rounded skeleton-shimmer w-20"></div>
          
          <!-- 標籤 -->
          <div class="h-4 bg-gray-200 rounded skeleton-shimmer" :style="{ width: `${60 + Math.random() * 25}%` }"></div>
          
          <!-- 變化指示 -->
          <div class="h-3 bg-gray-200 rounded skeleton-shimmer w-16"></div>
        </div>
      </div>
    </div>

    <!-- 自定義骨架 -->
    <div v-else class="space-y-4" :class="animationClass">
      <div
        v-for="i in count"
        :key="`custom-${i}`"
        :class="customClass"
        class="skeleton-shimmer"
        :style="{ height: `${height}px` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'article' | 'card' | 'table' | 'list' | 'profile' | 'text' | 'stats' | 'custom'
  count?: number
  height?: number
  animated?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  count: 3,
  height: 20,
  animated: true,
  customClass: 'bg-gray-200 rounded'
})

const animationClass = computed(() => {
  return props.animated ? 'animate-pulse' : ''
})
</script>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(90deg, 
    #f0f0f0 25%, 
    #e0e0e0 50%, 
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 提供額外的閃爍動畫選項 */
.animate-pulse .skeleton-shimmer {
  animation: shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .8;
  }
}

/* 深色主題支援 */
@media (prefers-color-scheme: dark) {
  .skeleton-shimmer {
    background: linear-gradient(90deg, 
      #374151 25%, 
      #4b5563 50%, 
      #374151 75%
    );
  }
}
</style>
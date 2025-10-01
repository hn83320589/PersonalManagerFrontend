<template>
  <div class="global-search relative" v-click-outside="hideSuggestions">
    <!-- 搜尋輸入框 -->
    <div class="relative">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          :class="[
            'w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            'text-sm placeholder-gray-500',
            showSuggestions && 'rounded-b-none border-b-0'
          ]"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @input="handleInput"
        />
        
        <!-- 載入指示器 -->
        <div v-if="isSearching || isLoadingSuggestions" class="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        
        <!-- 清除按鈕 -->
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="清除搜尋"
        >
          <XMarkIcon class="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <!-- 建議列表 -->
      <div
        v-if="showSuggestions"
        class="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <!-- 搜尋建議 -->
        <div v-if="suggestions.length > 0" class="py-2">
          <div class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
            建議
          </div>
          <button
            v-for="(suggestion, index) in suggestions"
            :key="`suggestion-${index}`"
            @click="selectSuggestion(suggestion)"
            :class="[
              'w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center',
              selectedSuggestionIndex === index && 'bg-blue-50 text-blue-700'
            ]"
          >
            <MagnifyingGlassIcon class="w-4 h-4 mr-2 text-gray-400" />
            <span class="flex-1" v-html="highlightMatch(suggestion, searchQuery)"></span>
          </button>
        </div>
        
        <!-- 搜尋歷史 -->
        <div v-if="showHistory && searchHistory.length > 0" class="py-2">
          <div class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 flex items-center justify-between">
            <span>最近搜尋</span>
            <button
              @click="clearSearchHistory"
              class="text-blue-600 hover:text-blue-700 text-xs normal-case"
            >
              清除
            </button>
          </div>
          <button
            v-for="(historyItem, index) in displayedHistory"
            :key="`history-${index}`"
            @click="selectSuggestion(historyItem)"
            :class="[
              'w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center group',
              selectedSuggestionIndex === (suggestions.length + index) && 'bg-blue-50 text-blue-700'
            ]"
          >
            <ClockIcon class="w-4 h-4 mr-2 text-gray-400" />
            <span class="flex-1">{{ historyItem }}</span>
            <button
              @click.stop="removeFromHistory(historyItem)"
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              title="移除"
            >
              <XMarkIcon class="w-3 h-3 text-gray-400" />
            </button>
          </button>
        </div>
        
        <!-- 無結果 -->
        <div v-if="suggestions.length === 0 && displayedHistory.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
          開始輸入以搜尋內容
        </div>
      </div>
    </div>
    
    <!-- 搜尋結果模態 -->
    <BaseModal
      :show="showResults"
      @close="hideResults"
      title="搜尋結果"
      max-width="4xl"
    >
      <div class="space-y-6">
        <!-- 搜尋統計 -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            找到 <span class="font-medium">{{ searchStats.total }}</span> 個結果
            <span v-if="searchStats.searchTime > 0" class="ml-2">
              (耗時 {{ Math.round(searchStats.searchTime) }}ms)
            </span>
          </div>
          
          <!-- 篩選按鈕 -->
          <button
            @click="showFilters = !showFilters"
            class="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon class="w-4 h-4 mr-1" />
            篩選
          </button>
        </div>
        
        <!-- 過濾器 -->
        <div v-if="showFilters" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 類型篩選 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">類型</label>
              <div class="space-y-1">
                <label v-for="type in searchFacets.types" :key="type.name" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="type.name"
                    v-model="selectedTypes"
                    @change="updateFilters"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {{ getTypeDisplayName(type.name) }} ({{ type.count }})
                  </span>
                </label>
              </div>
            </div>
            
            <!-- 分類篩選 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分類</label>
              <div class="space-y-1">
                <label v-for="category in searchFacets.categories" :key="category.name" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="category.name"
                    v-model="selectedCategories"
                    @change="updateFilters"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {{ category.name }} ({{ category.count }})
                  </span>
                </label>
              </div>
            </div>
            
            <!-- 標籤篩選 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">標籤</label>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <label v-for="tag in searchFacets.tags.slice(0, 10)" :key="tag.name" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="tag.name"
                    v-model="selectedTags"
                    @change="updateFilters"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {{ tag.name }} ({{ tag.count }})
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- 重置篩選器 -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
              @click="resetFilters"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              重置所有篩選
            </button>
          </div>
        </div>
        
        <!-- 搜尋結果列表 -->
        <div v-if="searchResults.length > 0" class="space-y-4">
          <div
            v-for="result in searchResults"
            :key="`${result.type}-${result.id}`"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="openResult(result)"
          >
            <div class="flex items-start space-x-4">
              <!-- 圖片 -->
              <div v-if="result.imageUrl" class="flex-shrink-0">
                <img
                  :src="result.imageUrl"
                  :alt="result.title"
                  class="w-16 h-16 rounded-lg object-cover"
                />
              </div>
              
              <!-- 內容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getTypeStyles(result.type)
                  ]">
                    {{ getTypeDisplayName(result.type) }}
                  </span>
                  <span v-if="result.category" class="text-xs text-gray-500">
                    {{ result.category }}
                  </span>
                </div>
                
                <h3
                  class="text-lg font-medium text-gray-900 mb-2 line-clamp-1"
                  v-html="result.highlightedTitle || result.title"
                ></h3>
                
                <p
                  class="text-sm text-gray-600 line-clamp-2"
                  v-html="result.highlightedExcerpt || result.excerpt"
                ></p>
                
                <!-- 標籤 -->
                <div v-if="result.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="tag in result.tags.slice(0, 3)"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="result.tags.length > 3" class="text-xs text-gray-500">
                    +{{ result.tags.length - 3 }} 更多
                  </span>
                </div>
                
                <!-- 時間 -->
                <div class="mt-2 text-xs text-gray-500">
                  {{ formatDate(result.updatedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 無搜尋結果 -->
        <div v-else-if="searchStats.total === 0 && !isSearching" class="text-center py-12">
          <MagnifyingGlassIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">沒有找到相關結果</h3>
          <p class="text-sm text-gray-500 mb-4">嘗試調整搜尋關鍵字或使用不同的篩選條件</p>
          <button
            @click="resetFilters"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            清除所有篩選
          </button>
        </div>
        
        <!-- 載入狀態 -->
        <div v-if="isSearching" class="text-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-sm text-gray-500">搜尋中...</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useSearch, useSearchHighlight } from '@/composables/useSearch'
import type { SearchResult } from '@/services/searchService'

// Props
interface Props {
  placeholder?: string
  autoFocus?: boolean
  showHistory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜尋內容...',
  autoFocus: false,
  showHistory: true
})

// Emits
const emit = defineEmits<{
  select: [result: SearchResult]
  search: [query: string]
}>()

// Search functionality
const {
  isSearching,
  searchQuery,
  searchResults,
  searchStats,
  searchFacets,
  suggestions,
  showSuggestions,
  selectedSuggestionIndex,
  isLoadingSuggestions,
  searchHistory,
  performSearch,
  showSuggestionsList,
  hideSuggestions,
  selectSuggestion,
  handleKeydown,
  clearSearch,
  setFilter,
  clearFilters,
  removeFromHistory,
  clearSearchHistory
} = useSearch({ autoSuggest: true })

const { highlightText } = useSearchHighlight()

// UI State
const searchInputRef = ref<HTMLInputElement>()
const showResults = ref(false)
const showFilters = ref(false)
const selectedTypes = ref<string[]>([])
const selectedCategories = ref<string[]>([])
const selectedTags = ref<string[]>([])

// Computed
const displayedHistory = computed(() => {
  if (searchQuery.value.trim()) return []
  return searchHistory.value.slice(0, 5)
})

// Methods
const handleFocus = () => {
  if (suggestions.value.length > 0 || displayedHistory.value.length > 0) {
    showSuggestionsList()
  }
}

const handleInput = () => {
  emit('search', searchQuery.value)
}

const highlightMatch = (text: string, query: string): string => {
  return highlightText(text, query)
}

const hideResults = () => {
  showResults.value = false
}

const openResult = (result: SearchResult) => {
  emit('select', result)
  hideResults()
  
  // 導航到結果頁面
  if (result.url) {
    window.open(result.url, '_blank')
  }
}

const updateFilters = () => {
  setFilter('type', selectedTypes.value.length > 0 ? selectedTypes.value : undefined)
  setFilter('category', selectedCategories.value.length > 0 ? selectedCategories.value : undefined)
  setFilter('tags', selectedTags.value.length > 0 ? selectedTags.value : undefined)
}

const resetFilters = () => {
  selectedTypes.value = []
  selectedCategories.value = []
  selectedTags.value = []
  clearFilters()
}

const getTypeDisplayName = (type: string): string => {
  const typeNames: Record<string, string> = {
    portfolio: '作品集',
    blog: '部落格',
    skill: '技能',
    experience: '經歷',
    calendar: '行事曆',
    task: '任務'
  }
  return typeNames[type] || type
}

const getTypeStyles = (type: string): string => {
  const styles: Record<string, string> = {
    portfolio: 'bg-blue-100 text-blue-800',
    blog: 'bg-green-100 text-green-800',
    skill: 'bg-purple-100 text-purple-800',
    experience: 'bg-yellow-100 text-yellow-800',
    calendar: 'bg-red-100 text-red-800',
    task: 'bg-orange-100 text-orange-800'
  }
  return styles[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 監聽搜尋結果變化，自動顯示結果模態
watch(
  () => searchResults.value.length,
  (newLength) => {
    if (newLength > 0 && searchQuery.value.trim()) {
      showResults.value = true
    }
  }
)

// 監聽搜尋查詢變化，執行搜尋
watch(
  searchQuery,
  async (newQuery) => {
    if (newQuery.trim() && newQuery.length >= 2) {
      await nextTick()
      await performSearch()
    }
  }
)

// Extended HTMLElement for click outside
interface ExtendedHTMLElement extends HTMLElement {
  _clickOutside?: (event: Event) => void
}

// Click outside directive
const vClickOutside = {
  mounted(el: ExtendedHTMLElement, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: ExtendedHTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside)
    }
  }
}

// Lifecycle
onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.search-highlight) {
  @apply bg-yellow-200 font-medium;
}
</style>
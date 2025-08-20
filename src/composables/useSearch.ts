import { ref, computed, watch, nextTick } from 'vue'
import { debounce } from '@/utils/performance'
import { searchService, type SearchQuery, type SearchResult, type SearchResponse } from '@/services/searchService'

/**
 * 搜尋功能 Composable
 */
export function useSearch(options: {
  immediate?: boolean
  debounceMs?: number
  minLength?: number
  autoSuggest?: boolean
} = {}) {
  const {
    immediate = false,
    debounceMs = 300,
    minLength = 2,
    autoSuggest = true
  } = options

  // 搜尋狀態
  const isSearching = ref(false)
  const searchQuery = ref('')
  const searchFilters = ref<SearchQuery['filters']>({})
  const searchResults = ref<SearchResult[]>([])
  const searchResponse = ref<SearchResponse | null>(null)
  const searchError = ref<string | null>(null)
  
  // 建議相關
  const suggestions = ref<string[]>([])
  const showSuggestions = ref(false)
  const selectedSuggestionIndex = ref(-1)
  const isLoadingSuggestions = ref(false)

  // 歷史記錄
  const searchHistory = computed(() => searchService.getSearchHistory())

  // 搜尋結果統計
  const searchStats = computed(() => {
    if (!searchResponse.value) {
      return {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        searchTime: 0,
        hasResults: false
      }
    }

    return {
      total: searchResponse.value.total,
      totalPages: searchResponse.value.totalPages,
      currentPage: searchResponse.value.currentPage,
      searchTime: searchResponse.value.searchTime,
      hasResults: searchResponse.value.results.length > 0
    }
  })

  // 分面搜尋（Faceted Search）統計
  const searchFacets = computed(() => searchResponse.value?.facets || {
    types: [],
    categories: [],
    tags: []
  })

  /**
   * 執行搜尋
   */
  const performSearch = async (query?: Partial<SearchQuery>) => {
    const searchParams: SearchQuery = {
      keyword: searchQuery.value,
      filters: searchFilters.value,
      ...query
    }

    if (!searchParams.keyword.trim() || searchParams.keyword.length < minLength) {
      searchResults.value = []
      searchResponse.value = null
      return
    }

    isSearching.value = true
    searchError.value = null

    try {
      const response = await searchService.search(searchParams)
      
      if (response.success && response.data) {
        searchResults.value = response.data.results
        searchResponse.value = response.data
      } else {
        searchError.value = response.message || '搜尋失敗'
        searchResults.value = []
        searchResponse.value = null
      }
    } catch (error) {
      searchError.value = error instanceof Error ? error.message : '搜尋發生錯誤'
      searchResults.value = []
      searchResponse.value = null
    } finally {
      isSearching.value = false
      hideSuggestions()
    }
  }

  /**
   * 防抖搜尋
   */
  const debouncedSearch = debounce(performSearch, debounceMs)

  /**
   * 獲取搜尋建議
   */
  const loadSuggestions = async (keyword: string) => {
    if (!autoSuggest || !keyword || keyword.length < minLength) {
      suggestions.value = []
      return
    }

    isLoadingSuggestions.value = true
    
    try {
      const suggestionResults = await searchService.getSuggestions(keyword)
      suggestions.value = suggestionResults.map(s => s.text)
    } catch (error) {
      console.warn('Failed to load suggestions:', error)
      suggestions.value = []
    } finally {
      isLoadingSuggestions.value = false
    }
  }

  /**
   * 防抖建議載入
   */
  const debouncedLoadSuggestions = debounce(loadSuggestions, 200)

  /**
   * 顯示建議
   */
  const showSuggestionsList = () => {
    if (suggestions.value.length > 0 || searchHistory.value.length > 0) {
      showSuggestions.value = true
      selectedSuggestionIndex.value = -1
    }
  }

  /**
   * 隱藏建議
   */
  const hideSuggestions = () => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }

  /**
   * 選擇建議
   */
  const selectSuggestion = (suggestion: string) => {
    searchQuery.value = suggestion
    hideSuggestions()
    performSearch()
  }

  /**
   * 鍵盤導航
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!showSuggestions.value) return

    const suggestionsList = [
      ...suggestions.value,
      ...(searchQuery.value ? [] : searchHistory.value.slice(0, 5))
    ]

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          suggestionsList.length - 1
        )
        break
      
      case 'ArrowUp':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.max(
          selectedSuggestionIndex.value - 1,
          -1
        )
        break
      
      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex.value >= 0) {
          selectSuggestion(suggestionsList[selectedSuggestionIndex.value])
        } else {
          performSearch()
        }
        break
      
      case 'Escape':
        hideSuggestions()
        break
    }
  }

  /**
   * 清除搜尋
   */
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    searchResponse.value = null
    searchError.value = null
    hideSuggestions()
  }

  /**
   * 設定過濾器
   */
  const setFilter = (key: keyof SearchQuery['filters'], value: any) => {
    if (!searchFilters.value) {
      searchFilters.value = {}
    }
    
    searchFilters.value = {
      ...searchFilters.value,
      [key]: value
    }
    
    // 如果有搜尋關鍵字，重新搜尋
    if (searchQuery.value.trim() && searchQuery.value.length >= minLength) {
      performSearch()
    }
  }

  /**
   * 清除過濾器
   */
  const clearFilters = () => {
    searchFilters.value = {}
    if (searchQuery.value.trim() && searchQuery.value.length >= minLength) {
      performSearch()
    }
  }

  /**
   * 從歷史移除項目
   */
  const removeFromHistory = (keyword: string) => {
    searchService.removeFromHistory(keyword)
  }

  /**
   * 清除搜尋歷史
   */
  const clearSearchHistory = () => {
    searchService.clearHistory()
  }

  // 監聽搜尋查詢變化
  watch(
    searchQuery,
    (newQuery) => {
      // 載入建議
      if (autoSuggest && newQuery.length >= 1) {
        debouncedLoadSuggestions(newQuery)
      }

      // 自動搜尋
      if (newQuery.length >= minLength) {
        debouncedSearch()
      } else {
        searchResults.value = []
        searchResponse.value = null
      }
    },
    { immediate }
  )

  // 監聽建議變化，自動顯示
  watch(
    suggestions,
    (newSuggestions) => {
      if (newSuggestions.length > 0 && searchQuery.value.length >= 1) {
        showSuggestionsList()
      }
    }
  )

  return {
    // 狀態
    isSearching,
    searchQuery,
    searchFilters,
    searchResults,
    searchResponse,
    searchError,
    searchStats,
    searchFacets,
    
    // 建議
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    isLoadingSuggestions,
    searchHistory,
    
    // 方法
    performSearch,
    loadSuggestions,
    showSuggestionsList,
    hideSuggestions,
    selectSuggestion,
    handleKeydown,
    clearSearch,
    setFilter,
    clearFilters,
    removeFromHistory,
    clearSearchHistory
  }
}

/**
 * 本地搜尋 Composable（前端搜尋）
 */
export function useLocalSearch<T extends Record<string, any>>(
  items: T[],
  searchKeys: string | string[],
  options: {
    threshold?: number
    caseSensitive?: boolean
    includeScore?: boolean
  } = {}
) {
  const {
    threshold = 0.3,
    caseSensitive = false,
    includeScore = false
  } = options

  const searchQuery = ref('')
  const searchResults = ref<T[]>([])
  const isSearching = ref(false)

  const performSearch = () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = items
      return
    }

    isSearching.value = true

    try {
      searchResults.value = searchService.fuzzySearch(items, searchKeys, {
        threshold,
        includeScore
      })
    } finally {
      isSearching.value = false
    }
  }

  // 防抖搜尋
  const debouncedSearch = debounce(performSearch, 200)

  // 監聽搜尋查詢變化
  watch(
    searchQuery,
    () => {
      debouncedSearch()
    },
    { immediate: true }
  )

  // 監聽項目變化
  watch(
    () => items,
    () => {
      performSearch()
    },
    { deep: true }
  )

  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  }
}

/**
 * 高亮搜尋結果 Composable
 */
export function useSearchHighlight() {
  const highlightText = (text: string, keyword: string): string => {
    return searchService.highlightMatches(text, keyword)
  }

  const highlightComponent = (text: string, keyword: string) => {
    if (!keyword.trim()) return text

    const highlighted = highlightText(text, keyword)
    return highlighted
  }

  return {
    highlightText,
    highlightComponent
  }
}
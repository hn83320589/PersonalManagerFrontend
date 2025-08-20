import { httpService } from './http'
import type { ApiResponse } from '@/types/api'

// 搜尋相關型別定義
export interface SearchQuery {
  keyword: string
  filters?: {
    type?: string[]  // 搜尋類型過濾 ['portfolio', 'blog', 'skills', etc.]
    category?: string[]
    tags?: string[]
    dateRange?: {
      start: string
      end: string
    }
    status?: string[]
  }
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    pageSize: number
  }
}

export interface SearchResult {
  id: number | string
  type: 'portfolio' | 'blog' | 'skill' | 'experience' | 'calendar' | 'task'
  title: string
  excerpt: string
  url: string
  imageUrl?: string
  category?: string
  tags: string[]
  score: number
  highlightedTitle?: string
  highlightedExcerpt?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  totalPages: number
  currentPage: number
  suggestions?: string[]
  facets?: {
    types: Array<{ name: string; count: number }>
    categories: Array<{ name: string; count: number }>
    tags: Array<{ name: string; count: number }>
  }
  searchTime: number
}

export interface SearchSuggestion {
  text: string
  type: 'history' | 'completion' | 'correction'
  score: number
}

class SearchService {
  private readonly baseUrl = '/search'
  private searchHistory: string[] = []
  private maxHistorySize = 50

  constructor() {
    this.loadSearchHistory()
  }

  /**
   * 全站搜尋
   */
  async search(query: SearchQuery): Promise<ApiResponse<SearchResponse>> {
    const startTime = performance.now()
    
    try {
      const response = await httpService.post<SearchResponse>(`${this.baseUrl}`, {
        ...query,
        searchTime: startTime
      })

      // 記錄搜尋歷史
      if (query.keyword.trim()) {
        this.addToHistory(query.keyword.trim())
      }

      // 添加搜尋時間
      if (response.success && response.data) {
        response.data.searchTime = performance.now() - startTime
      }

      return response
    } catch (error) {
      return {
        success: false,
        message: '搜尋失敗',
        data: {
          results: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
          searchTime: performance.now() - startTime
        },
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }

  /**
   * 搜尋建議
   */
  async getSuggestions(keyword: string): Promise<SearchSuggestion[]> {
    if (!keyword || keyword.length < 2) {
      return this.getHistorySuggestions(keyword)
    }

    try {
      const response = await httpService.get<string[]>(`${this.baseUrl}/suggestions`, {
        params: { q: keyword, limit: 10 }
      })

      const suggestions: SearchSuggestion[] = []

      // 添加 API 建議
      if (response.success && response.data) {
        suggestions.push(
          ...response.data.map(text => ({
            text,
            type: 'completion' as const,
            score: 1.0
          }))
        )
      }

      // 添加歷史搜尋建議
      const historySuggestions = this.getHistorySuggestions(keyword)
      suggestions.push(...historySuggestions)

      // 排序並去重
      return this.deduplicateAndSortSuggestions(suggestions)
    } catch (error) {
      // 發生錯誤時返回歷史建議
      return this.getHistorySuggestions(keyword)
    }
  }

  /**
   * 模糊搜尋（前端實現）
   */
  fuzzySearch<T extends Record<string, any>>(
    items: T[],
    searchKey: string | string[],
    options: {
      threshold?: number
      includeScore?: boolean
      includeMatches?: boolean
    } = {}
  ): T[] {
    const {
      threshold = 0.6,
      includeScore = false,
      includeMatches = false
    } = options

    const searchKeys = Array.isArray(searchKey) ? searchKey : [searchKey]
    
    return items
      .map(item => {
        let bestScore = 0
        let bestMatches: Array<{ key: string; value: string; indices: number[][] }> = []

        searchKeys.forEach(key => {
          const value = this.getNestedValue(item, key)
          if (typeof value === 'string') {
            const { score, indices } = this.calculateFuzzyScore(searchKey as string, value)
            if (score > bestScore) {
              bestScore = score
              bestMatches = [{ key, value, indices }]
            }
          }
        })

        const result = { ...item } as any
        if (includeScore) result._score = bestScore
        if (includeMatches) result._matches = bestMatches

        return { item: result, score: bestScore }
      })
      .filter(({ score }) => score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
  }

  /**
   * 高亮搜尋結果
   */
  highlightMatches(text: string, keyword: string): string {
    if (!keyword.trim()) return text

    const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  /**
   * 搜尋歷史管理
   */
  getSearchHistory(): string[] {
    return [...this.searchHistory]
  }

  addToHistory(keyword: string): void {
    // 移除重複項目
    this.searchHistory = this.searchHistory.filter(item => item !== keyword)
    
    // 添加到開頭
    this.searchHistory.unshift(keyword)
    
    // 限制大小
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize)
    }
    
    this.saveSearchHistory()
  }

  clearHistory(): void {
    this.searchHistory = []
    this.saveSearchHistory()
  }

  removeFromHistory(keyword: string): void {
    this.searchHistory = this.searchHistory.filter(item => item !== keyword)
    this.saveSearchHistory()
  }

  /**
   * 搜尋過濾器
   */
  createSearchFilter<T>(
    items: T[],
    filters: {
      search?: string
      type?: string[]
      category?: string[]
      tags?: string[]
      dateRange?: { start: string; end: string }
    }
  ): T[] {
    let filteredItems = [...items]

    // 文字搜尋
    if (filters.search) {
      filteredItems = this.fuzzySearch(filteredItems, ['title', 'content', 'description'], {
        threshold: 0.3
      })
    }

    // 類型過濾
    if (filters.type && filters.type.length > 0) {
      filteredItems = filteredItems.filter(item => 
        filters.type!.includes(this.getNestedValue(item, 'type'))
      )
    }

    // 分類過濾
    if (filters.category && filters.category.length > 0) {
      filteredItems = filteredItems.filter(item => 
        filters.category!.includes(this.getNestedValue(item, 'category'))
      )
    }

    // 標籤過濾
    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const itemTags = this.getNestedValue(item, 'tags') || []
        return filters.tags!.some(tag => itemTags.includes(tag))
      })
    }

    // 日期範圍過濾
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filteredItems = filteredItems.filter(item => {
        const itemDate = this.getNestedValue(item, 'createdAt') || this.getNestedValue(item, 'date')
        if (!itemDate) return true
        
        const date = new Date(itemDate)
        const startDate = new Date(start)
        const endDate = new Date(end)
        
        return date >= startDate && date <= endDate
      })
    }

    return filteredItems
  }

  /**
   * 私有方法
   */
  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('search-history')
      if (history) {
        this.searchHistory = JSON.parse(history)
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
      this.searchHistory = []
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('search-history', JSON.stringify(this.searchHistory))
    } catch (error) {
      console.warn('Failed to save search history:', error)
    }
  }

  private getHistorySuggestions(keyword: string): SearchSuggestion[] {
    if (!keyword) {
      return this.searchHistory.slice(0, 5).map(text => ({
        text,
        type: 'history' as const,
        score: 0.8
      }))
    }

    return this.searchHistory
      .filter(item => item.toLowerCase().includes(keyword.toLowerCase()))
      .slice(0, 3)
      .map(text => ({
        text,
        type: 'history' as const,
        score: 0.9
      }))
  }

  private deduplicateAndSortSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>()
    const unique = suggestions.filter(suggestion => {
      if (seen.has(suggestion.text.toLowerCase())) {
        return false
      }
      seen.add(suggestion.text.toLowerCase())
      return true
    })

    return unique
      .sort((a, b) => {
        // 按類型排序：history > completion > correction
        const typeOrder = { history: 3, completion: 2, correction: 1 }
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[b.type] - typeOrder[a.type]
        }
        return b.score - a.score
      })
      .slice(0, 10)
  }

  private calculateFuzzyScore(pattern: string, text: string): { score: number; indices: number[][] } {
    pattern = pattern.toLowerCase()
    text = text.toLowerCase()

    if (pattern === text) return { score: 1, indices: [[0, text.length - 1]] }
    if (text.includes(pattern)) {
      const startIndex = text.indexOf(pattern)
      return { 
        score: 0.8, 
        indices: [[startIndex, startIndex + pattern.length - 1]] 
      }
    }

    // 簡化的模糊匹配算法
    let score = 0
    let patternIndex = 0
    const indices: number[][] = []

    for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
      if (text[i] === pattern[patternIndex]) {
        if (indices.length === 0 || indices[indices.length - 1][1] !== i - 1) {
          indices.push([i, i])
        } else {
          indices[indices.length - 1][1] = i
        }
        score += 1
        patternIndex++
      }
    }

    return {
      score: patternIndex === pattern.length ? score / pattern.length * 0.6 : 0,
      indices
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

export const searchService = new SearchService()
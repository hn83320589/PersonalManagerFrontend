import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePortfolioStore } from '../portfolio'
import type { Portfolio } from '@/types/api'

// Mock portfolioService
vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getFeatured: vi.fn(),
    getByCategory: vi.fn(),
    search: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}))

describe('PortfolioStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const store = usePortfolioStore()
      
      expect(store.portfolios).toEqual([])
      expect(store.currentPortfolio).toBeNull()
      expect(store.featuredPortfolios).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.searchQuery).toBe('')
      expect(store.selectedCategory).toBe('all')
      expect(store.currentPage).toBe(1)
      expect(store.itemsPerPage).toBe(9)
    })
  })

  describe('getters', () => {
    it('filteredPortfolios 應該根據分類和搜尋過濾', () => {
      const store = usePortfolioStore()
      
      const mockPortfolios: Portfolio[] = [
        {
          id: 1,
          title: 'Web App',
          description: 'A web application',
          category: 'web',
          technologies: ['Vue', 'TypeScript'],
          imageUrl: 'image1.jpg',
          projectUrl: 'https://example.com',
          githubUrl: 'https://github.com/test',
          featured: true,
          completedAt: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: 2,
          title: 'Mobile App',
          description: 'A mobile application',
          category: 'mobile',
          technologies: ['React Native'],
          imageUrl: 'image2.jpg',
          projectUrl: null,
          githubUrl: 'https://github.com/test2',
          featured: false,
          completedAt: '2024-01-02',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02'
        }
      ]
      
      store.portfolios = mockPortfolios
      
      // 測試所有分類
      expect(store.filteredPortfolios).toHaveLength(2)
      
      // 測試特定分類
      store.selectedCategory = 'web'
      expect(store.filteredPortfolios).toHaveLength(1)
      expect(store.filteredPortfolios[0].category).toBe('web')
      
      // 測試搜尋
      store.selectedCategory = 'all'
      store.searchQuery = 'mobile'
      expect(store.filteredPortfolios).toHaveLength(1)
      expect(store.filteredPortfolios[0].title).toBe('Mobile App')
    })

    it('paginatedPortfolios 應該正確分頁', () => {
      const store = usePortfolioStore()
      
      // 建立 15 個作品項目
      store.portfolios = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Project ${i + 1}`,
        description: `Description ${i + 1}`,
        category: 'web',
        technologies: ['Vue'],
        imageUrl: `image${i + 1}.jpg`,
        projectUrl: null,
        githubUrl: null,
        featured: false,
        completedAt: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }))
      
      // 第一頁應該有 9 個項目
      expect(store.paginatedPortfolios).toHaveLength(9)
      
      // 第二頁應該有 6 個項目
      store.currentPage = 2
      expect(store.paginatedPortfolios).toHaveLength(6)
    })

    it('categories 應該返回所有分類', () => {
      const store = usePortfolioStore()
      
      store.portfolios = [
        { category: 'web' },
        { category: 'mobile' },
        { category: 'web' },
        { category: 'desktop' }
      ] as Portfolio[]
      
      const categories = store.categories
      expect(categories).toEqual(['web', 'mobile', 'desktop'])
    })

    it('totalPages 應該計算正確的總頁數', () => {
      const store = usePortfolioStore()
      
      // 15 個項目，每頁 9 個 = 2 頁
      store.portfolios = Array(15).fill({}).map((_, i) => ({ id: i + 1 })) as Portfolio[]
      expect(store.totalPages).toBe(2)
      
      // 18 個項目，每頁 9 個 = 2 頁
      store.portfolios = Array(18).fill({}).map((_, i) => ({ id: i + 1 })) as Portfolio[]
      expect(store.totalPages).toBe(2)
      
      // 19 個項目，每頁 9 個 = 3 頁
      store.portfolios = Array(19).fill({}).map((_, i) => ({ id: i + 1 })) as Portfolio[]
      expect(store.totalPages).toBe(3)
    })
  })

  describe('actions', () => {
    it('setSearchQuery 應該設定搜尋關鍵字並重置頁面', () => {
      const store = usePortfolioStore()
      
      store.currentPage = 3
      store.setSearchQuery('test query')
      
      expect(store.searchQuery).toBe('test query')
      expect(store.currentPage).toBe(1)
    })

    it('setSelectedCategory 應該設定分類並重置頁面', () => {
      const store = usePortfolioStore()
      
      store.currentPage = 2
      store.setSelectedCategory('mobile')
      
      expect(store.selectedCategory).toBe('mobile')
      expect(store.currentPage).toBe(1)
    })

    it('setCurrentPage 應該設定當前頁面', () => {
      const store = usePortfolioStore()
      
      store.setCurrentPage(3)
      expect(store.currentPage).toBe(3)
    })

    it('resetFilters 應該重置所有篩選條件', () => {
      const store = usePortfolioStore()
      
      store.searchQuery = 'test'
      store.selectedCategory = 'mobile'
      store.currentPage = 3
      
      store.resetFilters()
      
      expect(store.searchQuery).toBe('')
      expect(store.selectedCategory).toBe('all')
      expect(store.currentPage).toBe(1)
    })
  })
})
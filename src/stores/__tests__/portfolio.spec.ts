import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePortfolioStore } from '../portfolio'
import type { Portfolio } from '@/types/api'

// Mock portfolioService
vi.mock('@/services/portfolioService', () => ({
  default: {
    getPortfolios: vi.fn(),
    getFeaturedPortfolios: vi.fn(),
    getPortfolioById: vi.fn(),
    createPortfolio: vi.fn(),
    updatePortfolio: vi.fn(),
    deletePortfolio: vi.fn(),
  }
}))

const mockPortfolio: Portfolio = {
  id: 1,
  userId: 1,
  title: 'Test Portfolio',
  description: 'Test Description',
  imageUrl: '/test.jpg',
  projectUrl: 'https://test.com',
  repositoryUrl: 'https://github.com/test',
  technologies: 'Vue.js, TypeScript',
  isPublic: true,
  isFeatured: false,
  sortOrder: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

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
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchPortfolios', () => {
    it('應該成功獲取作品集列表', async () => {
      const store = usePortfolioStore()
      const mockResponse = {
        success: true,
        data: [mockPortfolio],
        message: 'Success',
        errors: []
      }

      const portfolioService = await import('@/services/portfolioService')
      vi.mocked(portfolioService.default.getPortfolios).mockResolvedValue(mockResponse)

      await store.fetchPortfolios()

      expect(store.portfolios).toEqual([mockPortfolio])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('應該處理獲取失敗的情況', async () => {
      const store = usePortfolioStore()
      const mockResponse = {
        success: false,
        data: [],
        message: 'Failed to fetch',
        errors: ['Network error']
      }

      const portfolioService = await import('@/services/portfolioService')
      vi.mocked(portfolioService.default.getPortfolios).mockResolvedValue(mockResponse)

      await store.fetchPortfolios()

      expect(store.portfolios).toEqual([])
      expect(store.error).toBe('Failed to fetch')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('fetchFeaturedPortfolios', () => {
    it('應該成功獲取精選作品集', async () => {
      const store = usePortfolioStore()
      const featuredPortfolio = { ...mockPortfolio, isFeatured: true }
      const mockResponse = {
        success: true,
        data: [featuredPortfolio],
        message: 'Success',
        errors: []
      }

      const portfolioService = await import('@/services/portfolioService')
      vi.mocked(portfolioService.default.getFeaturedPortfolios).mockResolvedValue(mockResponse)

      await store.fetchFeaturedPortfolios()

      expect(store.featuredPortfolios).toEqual([featuredPortfolio])
    })
  })

  describe('fetchPortfolioById', () => {
    it('應該成功獲取單一作品集', async () => {
      const store = usePortfolioStore()
      const mockResponse = {
        success: true,
        data: mockPortfolio,
        message: 'Success',
        errors: []
      }

      const portfolioService = await import('@/services/portfolioService')
      vi.mocked(portfolioService.default.getPortfolioById).mockResolvedValue(mockResponse)

      await store.fetchPortfolioById(1)

      expect(store.currentPortfolio).toEqual(mockPortfolio)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('clearCurrentPortfolio', () => {
    it('應該清除當前作品集', () => {
      const store = usePortfolioStore()
      
      // 設定當前作品集
      store.currentPortfolio = mockPortfolio
      
      // 清除當前作品集
      store.clearCurrentPortfolio()
      
      expect(store.currentPortfolio).toBeNull()
    })
  })

  describe('clearError', () => {
    it('應該清除錯誤訊息', () => {
      const store = usePortfolioStore()
      
      // 設定錯誤
      store.error = 'Some error'
      
      // 清除錯誤
      store.clearError()
      
      expect(store.error).toBeNull()
    })
  })
})
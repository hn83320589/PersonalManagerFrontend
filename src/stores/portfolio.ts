import { defineStore } from 'pinia'
import { ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Portfolio } from '@/types/api'

export const usePortfolioStore = defineStore('portfolio', () => {
  // State
  const portfolios = ref<Portfolio[]>([])
  const currentPortfolio = ref<Portfolio | null>(null)
  const featuredPortfolios = ref<Portfolio[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchPortfolios() {
    isLoading.value = true
    error.value = null

    try {
      const response = await portfolioService.getPortfolios()
      if (response.success) {
        portfolios.value = response.data || []
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = 'Failed to fetch portfolios'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchFeaturedPortfolios() {
    try {
      const response = await portfolioService.getFeaturedPortfolios()
      if (response.success) {
        featuredPortfolios.value = response.data || []
      }
    } catch (err) {
      console.error('Failed to fetch featured portfolios:', err)
    }
  }

  async function fetchPortfolioById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await portfolioService.getPortfolioById(id)
      if (response.success && response.data) {
        currentPortfolio.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = 'Failed to fetch portfolio'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function searchPortfolios(keyword: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await portfolioService.searchPortfolios(keyword)
      if (response.success) {
        portfolios.value = response.data || []
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = 'Search failed'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentPortfolio() {
    currentPortfolio.value = null
  }

  return {
    // State
    portfolios,
    currentPortfolio,
    featuredPortfolios,
    isLoading,
    error,
    // Actions
    fetchPortfolios,
    fetchFeaturedPortfolios,
    fetchPortfolioById,
    searchPortfolios,
    clearError,
    clearCurrentPortfolio,
  }
})
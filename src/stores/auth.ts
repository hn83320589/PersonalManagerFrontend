import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type LoginCredentials } from '@/services/authService'
import type { User } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.username || 'Guest')

  // Actions
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        user.value = response.data.user
        return true
      } else {
        error.value = response.message || 'Login failed'
        return false
      }
    } catch (err) {
      error.value = 'Network error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    
    try {
      await authService.logout()
    } finally {
      user.value = null
      error.value = null
      isLoading.value = false
    }
  }

  function initializeAuth() {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    if (currentUser && authService.isAuthenticated()) {
      user.value = currentUser
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userDisplayName,
    // Actions
    login,
    logout,
    initializeAuth,
    clearError,
  }
})
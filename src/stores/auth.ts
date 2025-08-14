import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type LoginCredentials } from '@/services/authService'
import type { User } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!(user.value && token.value))
  const userDisplayName = computed(() => user.value?.username || 'Guest')
  const userRole = computed(() => user.value?.role || 'guest')
  const hasPermission = computed(() => (permission: string) => {
    // In a real app, this would check user permissions
    return userRole.value === 'admin' || userRole.value === 'owner'
  })

  // Actions
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token
        
        // Set up token refresh if expiry is provided
        if (response.data.expiresIn) {
          scheduleTokenRefresh(response.data.expiresIn)
        }
        
        return true
      } else {
        error.value = response.message || 'Login failed'
        return false
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = 'Network error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function demoLogin() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authService.demoLogin()
      
      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token
        
        if (response.data.expiresIn) {
          scheduleTokenRefresh(response.data.expiresIn)
        }
        
        return true
      } else {
        error.value = response.message || 'Demo login failed'
        return false
      }
    } catch (err) {
      console.error('Demo login error:', err)
      error.value = 'Demo login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      error.value = null
      isLoading.value = false
      
      // Clear any scheduled token refresh
      clearTokenRefresh()
    }
  }

  async function refreshToken() {
    try {
      const response = await authService.refreshToken()
      if (response.success && response.data) {
        token.value = response.data.token
        
        if (response.data.expiresIn) {
          scheduleTokenRefresh(response.data.expiresIn)
        }
        
        return true
      }
    } catch (err) {
      console.error('Token refresh error:', err)
      // If refresh fails, log out the user
      await logout()
    }
    
    return false
  }

  function initializeAuth() {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    const currentToken = authService.getAuthToken()
    
    if (currentUser && currentToken && authService.isAuthenticated()) {
      user.value = currentUser
      token.value = currentToken
      
      // Try to refresh token on initialization to ensure it's valid
      refreshToken()
    }
  }

  function clearError() {
    error.value = null
  }

  // Token refresh scheduling
  let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null

  function scheduleTokenRefresh(expiresInSeconds: number) {
    clearTokenRefresh()
    
    // Schedule refresh 5 minutes before expiry
    const refreshTime = Math.max(expiresInSeconds - 300, 60) * 1000
    
    refreshTimeoutId = setTimeout(() => {
      refreshToken()
    }, refreshTime)
  }

  function clearTokenRefresh() {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId)
      refreshTimeoutId = null
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    token,
    // Getters
    isAuthenticated,
    userDisplayName,
    userRole,
    hasPermission,
    // Actions
    login,
    demoLogin,
    logout,
    refreshToken,
    initializeAuth,
    clearError,
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage
  }
})
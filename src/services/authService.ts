import httpService from './http'
import type { ApiResponse, User } from '@/types/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await httpService.post<LoginResponse>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store auth token and user data
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
      
      // Store token expiry if provided
      if (response.data.expiresIn) {
        const expiryTime = Date.now() + (response.data.expiresIn * 1000)
        localStorage.setItem('token_expiry', expiryTime.toString())
      }
    }
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await httpService.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      this.clearAuthData()
    }
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await httpService.post<RefreshTokenResponse>('/auth/refresh')
    
    if (response.success && response.data) {
      // Update stored token
      localStorage.setItem('auth_token', response.data.token)
      
      // Update token expiry
      if (response.data.expiresIn) {
        const expiryTime = Date.now() + (response.data.expiresIn * 1000)
        localStorage.setItem('token_expiry', expiryTime.toString())
      }
    }
    
    return response
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (!token || !userData) {
      return false
    }
    
    // Check if token has expired
    const expiryTime = localStorage.getItem('token_expiry')
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      this.clearAuthData()
      return false
    }
    
    return true
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        return JSON.parse(userData) as User
      } catch {
        return null
      }
    }
    return null
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('token_expiry')
    return expiry ? parseInt(expiry) : null
  }

  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expiry = this.getTokenExpiry()
    if (!expiry) return false
    
    const thresholdMs = thresholdMinutes * 60 * 1000
    return (expiry - Date.now()) < thresholdMs
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('token_expiry')
  }

  // Demo login for development
  async demoLogin(): Promise<ApiResponse<LoginResponse>> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockResponse: ApiResponse<LoginResponse> = {
      success: true,
      message: 'Login successful',
      errors: [],
      data: {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          lastLoginDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'demo-jwt-token-' + Date.now(),
        expiresIn: 3600 // 1 hour
      }
    }
    
    // Store auth data
    if (mockResponse.data) {
      localStorage.setItem('auth_token', mockResponse.data.token)
      localStorage.setItem('user_data', JSON.stringify(mockResponse.data.user))
      
      const expiryTime = Date.now() + (mockResponse.data.expiresIn * 1000)
      localStorage.setItem('token_expiry', expiryTime.toString())
    }
    
    return mockResponse
  }
}

export const authService = new AuthService()
export default authService
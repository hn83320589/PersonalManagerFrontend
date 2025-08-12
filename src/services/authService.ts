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

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await httpService.post<LoginResponse>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store auth token and user data
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
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
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    return !!(token && userData)
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
}

export const authService = new AuthService()
export default authService
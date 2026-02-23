import httpService from './http'
import type { ApiResponse, AuthResponse, User } from '@/types/api'

class AuthService {
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await httpService.post<AuthResponse>('/auth/login', credentials)

    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify({
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
      }))

      if (response.data.expiresAt) {
        localStorage.setItem('token_expiry', new Date(response.data.expiresAt).getTime().toString())
      }
    }

    return response
  }

  async register(data: { username: string; email: string; password: string; fullName?: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await httpService.post<AuthResponse>('/auth/register', data)

    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify({
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
      }))

      if (response.data.expiresAt) {
        localStorage.setItem('token_expiry', new Date(response.data.expiresAt).getTime().toString())
      }
    }

    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpService.get<User>('/auth/me')
  }

  async logout(): Promise<void> {
    this.clearAuthData()
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    if (!token) return false

    const expiryTime = localStorage.getItem('token_expiry')
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      this.clearAuthData()
      return false
    }

    return true
  }

  getCurrentUserData(): Partial<User> | null {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch {
        return null
      }
    }
    return null
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('token_expiry')
  }
}

export const authService = new AuthService()
export default authService

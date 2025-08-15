import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { httpService } from '../http'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('HttpService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('設定與攔截器', () => {
    it('應該有正確的基礎設定', () => {
      expect(httpService.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5253/api')
      expect(httpService.defaults.timeout).toBe(10000)
      expect(httpService.defaults.headers.common['Content-Type']).toBe('application/json')
    })

    it('請求攔截器應該添加 Authorization header', () => {
      const mockConfig = {
        headers: {},
        url: '/test'
      }

      // Mock localStorage
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue('test-token')

      // 觸發請求攔截器
      const requestInterceptor = httpService.interceptors.request.handlers[0]
      const result = requestInterceptor.fulfilled(mockConfig)

      expect(result.headers.Authorization).toBe('Bearer test-token')
      
      getItemSpy.mockRestore()
    })

    it('請求攔截器在沒有 token 時不應該添加 Authorization header', () => {
      const mockConfig = {
        headers: {},
        url: '/test'
      }

      // Mock localStorage 返回 null
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue(null)

      const requestInterceptor = httpService.interceptors.request.handlers[0]
      const result = requestInterceptor.fulfilled(mockConfig)

      expect(result.headers.Authorization).toBeUndefined()
      
      getItemSpy.mockRestore()
    })
  })

  describe('回應攔截器', () => {
    it('成功回應應該返回 response.data', () => {
      const mockResponse = {
        data: { message: 'success', data: { id: 1 } },
        status: 200
      }

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      const result = responseInterceptor.fulfilled(mockResponse)

      expect(result).toEqual(mockResponse.data)
    })

    it('401 錯誤應該清除 token 並重新載入頁面', () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      // Mock localStorage 和 window.location
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
      const reloadSpy = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true
      })

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      
      expect(() => {
        responseInterceptor.rejected(mockError)
      }).rejects.toThrow()

      expect(removeItemSpy).toHaveBeenCalledWith('auth_token')
      expect(reloadSpy).toHaveBeenCalled()
      
      removeItemSpy.mockRestore()
    })

    it('403 錯誤應該顯示權限不足訊息', () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      }

      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      
      expect(() => {
        responseInterceptor.rejected(mockError)
      }).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith('權限不足:', 'Forbidden')
      
      consoleErrorSpy.mockRestore()
    })

    it('500 錯誤應該顯示伺服器錯誤訊息', () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      
      expect(() => {
        responseInterceptor.rejected(mockError)
      }).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith('伺服器錯誤:', 'Internal Server Error')
      
      consoleErrorSpy.mockRestore()
    })

    it('網路錯誤應該顯示連線錯誤訊息', () => {
      const mockError = {
        request: {},
        message: 'Network Error'
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      
      expect(() => {
        responseInterceptor.rejected(mockError)
      }).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith('網路連線錯誤，請檢查您的網路連線')
      
      consoleErrorSpy.mockRestore()
    })

    it('其他錯誤應該顯示通用錯誤訊息', () => {
      const mockError = {
        message: 'Something went wrong'
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const responseInterceptor = httpService.interceptors.response.handlers[0]
      
      expect(() => {
        responseInterceptor.rejected(mockError)
      }).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith('請求錯誤:', 'Something went wrong')
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('HTTP 方法', () => {
    it('get 方法應該正確調用', async () => {
      const mockData = { id: 1, name: 'test' }
      mockedAxios.get.mockResolvedValue({ data: mockData })

      const result = await httpService.get('/test')

      expect(mockedAxios.get).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockData)
    })

    it('post 方法應該正確調用', async () => {
      const mockData = { id: 1, name: 'test' }
      const postData = { name: 'test' }
      mockedAxios.post.mockResolvedValue({ data: mockData })

      const result = await httpService.post('/test', postData)

      expect(mockedAxios.post).toHaveBeenCalledWith('/test', postData, undefined)
      expect(result).toEqual(mockData)
    })

    it('put 方法應該正確調用', async () => {
      const mockData = { id: 1, name: 'updated' }
      const putData = { name: 'updated' }
      mockedAxios.put.mockResolvedValue({ data: mockData })

      const result = await httpService.put('/test/1', putData)

      expect(mockedAxios.put).toHaveBeenCalledWith('/test/1', putData, undefined)
      expect(result).toEqual(mockData)
    })

    it('delete 方法應該正確調用', async () => {
      const mockData = { message: 'deleted' }
      mockedAxios.delete.mockResolvedValue({ data: mockData })

      const result = await httpService.delete('/test/1')

      expect(mockedAxios.delete).toHaveBeenCalledWith('/test/1', undefined)
      expect(result).toEqual(mockData)
    })
  })
})
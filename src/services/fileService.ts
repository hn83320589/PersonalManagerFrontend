import { httpService } from './http'
import type { ApiResponse } from '@/types/api'

// 檔案上傳相關介面
export interface FileUploadRequest {
  category?: string
  description?: string
  isPublic?: boolean
  userId?: number
}

export interface FileUploadResponse {
  id: number
  fileName: string
  originalFileName: string
  filePath: string
  contentType: string
  fileSize: number
  category: string
  description: string
  isPublic: boolean
  createdAt: string
  fileUrl: string
}

export interface ImageResizeRequest {
  fileId: number
  width: number
  height: number
  keepAspectRatio?: boolean
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

class FileService {
  private readonly baseUrl = '/files'

  /**
   * 上傳單個檔案
   */
  async uploadFile(
    file: File, 
    request: FileUploadRequest = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    
    // 添加額外的請求參數
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    })

    return httpService.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const loaded = progressEvent.loaded
          const total = progressEvent.total
          const percentage = Math.round((loaded * 100) / total)
          onProgress({ loaded, total, percentage })
        }
      }
    })
  }

  /**
   * 上傳多個檔案
   */
  async uploadMultipleFiles(
    files: File[],
    request: FileUploadRequest = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadResponse[]>> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, request, onProgress)
    )

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.data!)

      return {
        success: true,
        message: `成功上傳 ${successfulUploads.length}/${files.length} 個檔案`,
        data: successfulUploads,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        message: '批量上傳失敗',
        data: [],
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }

  /**
   * 取得檔案資訊
   */
  async getFile(id: number): Promise<ApiResponse<FileUploadResponse>> {
    return httpService.get(`${this.baseUrl}/${id}`)
  }

  /**
   * 取得使用者的所有檔案
   */
  async getUserFiles(userId: number): Promise<ApiResponse<FileUploadResponse[]>> {
    return httpService.get(`${this.baseUrl}/user/${userId}`)
  }

  /**
   * 取得公開檔案列表
   */
  async getPublicFiles(category?: string): Promise<ApiResponse<FileUploadResponse[]>> {
    const params = category ? { category } : {}
    return httpService.get(`${this.baseUrl}/public`, { params })
  }

  /**
   * 取得圖片檔案
   */
  async getImages(): Promise<ApiResponse<FileUploadResponse[]>> {
    return httpService.get(`${this.baseUrl}/images`)
  }

  /**
   * 取得影片檔案
   */
  async getVideos(): Promise<ApiResponse<FileUploadResponse[]>> {
    return httpService.get(`${this.baseUrl}/videos`)
  }

  /**
   * 取得文件檔案
   */
  async getDocuments(): Promise<ApiResponse<FileUploadResponse[]>> {
    return httpService.get(`${this.baseUrl}/documents`)
  }

  /**
   * 更新檔案資訊
   */
  async updateFileInfo(
    id: number, 
    request: FileUploadRequest
  ): Promise<ApiResponse<FileUploadResponse>> {
    return httpService.put(`${this.baseUrl}/${id}`, request)
  }

  /**
   * 刪除檔案
   */
  async deleteFile(id: number): Promise<ApiResponse<void>> {
    return httpService.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * 調整圖片尺寸
   */
  async resizeImage(request: ImageResizeRequest): Promise<ApiResponse<FileUploadResponse>> {
    return httpService.post(`${this.baseUrl}/${request.fileId}/resize`, {
      width: request.width,
      height: request.height,
      keepAspectRatio: request.keepAspectRatio ?? true
    })
  }

  /**
   * 驗證檔案類型
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.includes('/')) {
        // MIME type
        return file.type === type
      } else {
        // 副檔名
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
    })
  }

  /**
   * 驗證檔案大小
   */
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }

  /**
   * 格式化檔案大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 取得檔案預覽URL
   */
  getPreviewUrl(fileUrl: string): string {
    // 如果是相對路徑，加上 API 基礎 URL
    if (fileUrl.startsWith('/')) {
      return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${fileUrl}`
    }
    return fileUrl
  }

  /**
   * 檢查是否為圖片檔案
   */
  isImage(file: File | string): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    
    if (file instanceof File) {
      return imageTypes.includes(file.type)
    } else {
      // 檔案路徑或URL
      const extension = file.toLowerCase().split('.').pop()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')
    }
  }

  /**
   * 檢查是否為影片檔案
   */
  isVideo(file: File | string): boolean {
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
    
    if (file instanceof File) {
      return videoTypes.includes(file.type)
    } else {
      const extension = file.toLowerCase().split('.').pop()
      return ['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension || '')
    }
  }
}

export const fileService = new FileService()
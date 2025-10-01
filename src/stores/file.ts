import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fileService } from '@/services/fileService'
import type { FileUploadResponse } from '@/services/fileService'
import type { ApiResponse } from '@/types/api'

export const useFileStore = defineStore('file', () => {
  // State
  const files = ref<FileUploadResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalFiles = computed(() => files.value.length)
  
  const imageFiles = computed(() => 
    files.value.filter(file => file.contentType.startsWith('image/'))
  )
  
  const documentFiles = computed(() => 
    files.value.filter(file => 
      file.contentType.includes('pdf') || 
      file.contentType.includes('document') ||
      file.contentType.includes('text/')
    )
  )
  
  const videoFiles = computed(() => 
    files.value.filter(file => file.contentType.startsWith('video/'))
  )

  const totalSize = computed(() => 
    files.value.reduce((total, file) => total + file.fileSize, 0)
  )

  // Actions
  async function fetchFiles(): Promise<void> {
    try {
      loading.value = true
      error.value = null
      
      // For demo purposes, we'll create some mock files
      // In real app: const response = await fileService.getFiles()
      files.value = [
        {
          id: 1,
          fileName: 'profile-photo.jpg',
          originalFileName: 'my-profile-photo.jpg',
          filePath: '/uploads/images/profile-photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 524288, // 512KB
          category: 'image',
          description: '個人頭像照片',
          isPublic: true,
          createdAt: '2024-01-15T10:00:00Z',
          fileUrl: '/uploads/images/profile-photo.jpg'
        },
        {
          id: 2,
          fileName: 'resume.pdf',
          originalFileName: 'john-doe-resume.pdf',
          filePath: '/uploads/documents/resume.pdf',
          contentType: 'application/pdf',
          fileSize: 1048576, // 1MB
          category: 'document',
          description: '個人履歷檔案',
          isPublic: false,
          createdAt: '2024-01-14T15:30:00Z',
          fileUrl: '/uploads/documents/resume.pdf'
        },
        {
          id: 3,
          fileName: 'project-demo.mp4',
          originalFileName: 'project-demonstration.mp4',
          filePath: '/uploads/videos/project-demo.mp4',
          contentType: 'video/mp4',
          fileSize: 10485760, // 10MB
          category: 'video',
          description: '專案展示影片',
          isPublic: true,
          createdAt: '2024-01-13T09:15:00Z',
          fileUrl: '/uploads/videos/project-demo.mp4'
        },
        {
          id: 4,
          fileName: 'screenshot-1.png',
          originalFileName: 'app-screenshot-homepage.png',
          filePath: '/uploads/images/screenshot-1.png',
          contentType: 'image/png',
          fileSize: 256000, // 250KB
          category: 'image',
          description: '應用程式首頁截圖',
          isPublic: true,
          createdAt: '2024-01-12T14:20:00Z',
          fileUrl: '/uploads/images/screenshot-1.png'
        },
        {
          id: 5,
          fileName: 'api-docs.pdf',
          originalFileName: 'API-documentation-v2.pdf',
          filePath: '/uploads/documents/api-docs.pdf',
          contentType: 'application/pdf',
          fileSize: 2097152, // 2MB
          category: 'document',
          description: 'API 技術文件',
          isPublic: false,
          createdAt: '2024-01-11T11:45:00Z',
          fileUrl: '/uploads/documents/api-docs.pdf'
        }
      ]
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch files'
      console.error('Error fetching files:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadFile(
    file: File, 
    options: {
      category?: string
      description?: string
      isPublic?: boolean
    } = {}
  ): Promise<FileUploadResponse | null> {
    try {
      loading.value = true
      error.value = null

      // In real app: const response = await fileService.uploadFile(file, options)
      // Mock upload response
      const mockFile: FileUploadResponse = {
        id: Math.floor(Math.random() * 10000),
        fileName: `uploaded_${Date.now()}_${file.name}`,
        originalFileName: file.name,
        filePath: `/uploads/${options.category || 'files'}/${file.name}`,
        contentType: file.type,
        fileSize: file.size,
        category: options.category || 'other',
        description: options.description || '',
        isPublic: options.isPublic ?? true,
        createdAt: new Date().toISOString(),
        fileUrl: `/uploads/${options.category || 'files'}/${file.name}`
      }

      files.value.push(mockFile)
      return mockFile
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upload file'
      console.error('Error uploading file:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function uploadMultipleFiles(
    fileList: File[],
    options: {
      category?: string
      description?: string
      isPublic?: boolean
    } = {}
  ): Promise<FileUploadResponse[]> {
    try {
      loading.value = true
      error.value = null

      const uploadPromises = fileList.map(file => uploadFile(file, options))
      const results = await Promise.all(uploadPromises)
      
      return results.filter(file => file !== null) as FileUploadResponse[]
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upload files'
      console.error('Error uploading files:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function deleteFile(id: number): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      // In real app: await fileService.deleteFile(id)
      // Mock deletion
      const index = files.value.findIndex(file => file.id === id)
      if (index !== -1) {
        files.value.splice(index, 1)
        return true
      }
      
      return false
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete file'
      console.error('Error deleting file:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateFile(
    id: number, 
    updates: {
      description?: string
      isPublic?: boolean
      category?: string
    }
  ): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      // In real app: await fileService.updateFile(id, updates)
      // Mock update
      const file = files.value.find(f => f.id === id)
      if (file) {
        Object.assign(file, updates)
        return true
      }
      
      return false
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update file'
      console.error('Error updating file:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  function getFileById(id: number): FileUploadResponse | undefined {
    return files.value.find(file => file.id === id)
  }

  function getFilesByCategory(category: string): FileUploadResponse[] {
    return files.value.filter(file => file.category === category)
  }

  function getFilesByType(contentType: string): FileUploadResponse[] {
    return files.value.filter(file => file.contentType.startsWith(contentType))
  }

  function searchFiles(query: string): FileUploadResponse[] {
    const lowerQuery = query.toLowerCase()
    return files.value.filter(file => 
      file.fileName.toLowerCase().includes(lowerQuery) ||
      file.originalFileName.toLowerCase().includes(lowerQuery) ||
      file.description.toLowerCase().includes(lowerQuery)
    )
  }

  function clearError(): void {
    error.value = null
  }

  function reset(): void {
    files.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    files,
    loading,
    error,
    
    // Getters
    totalFiles,
    imageFiles,
    documentFiles,
    videoFiles,
    totalSize,
    
    // Actions
    fetchFiles,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    updateFile,
    getFileById,
    getFilesByCategory,
    getFilesByType,
    searchFiles,
    clearError,
    reset
  }
})
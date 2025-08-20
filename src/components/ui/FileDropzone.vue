<template>
  <div
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    :class="[
      'file-dropzone border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
      isDragging
        ? 'border-blue-400 bg-blue-50 scale-105'
        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
  >
    <!-- 拖拽提示 -->
    <div v-if="isDragging && !disabled" class="space-y-4">
      <CloudArrowDownIcon class="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
      <p class="text-xl font-semibold text-blue-600">
        放開以上傳檔案
      </p>
    </div>
    
    <!-- 正常狀態 -->
    <div v-else class="space-y-4">
      <CloudArrowUpIcon 
        :class="[
          'w-16 h-16 mx-auto',
          disabled ? 'text-gray-300' : 'text-gray-400'
        ]" 
      />
      <div>
        <p :class="[
          'text-xl font-semibold mb-2',
          disabled ? 'text-gray-400' : 'text-gray-700'
        ]">
          {{ title }}
        </p>
        <p :class="[
          'text-sm',
          disabled ? 'text-gray-300' : 'text-gray-500'
        ]">
          {{ description }}
        </p>
      </div>
      
      <!-- 檔案類型和大小提示 -->
      <div v-if="!disabled" class="text-xs text-gray-400 space-y-1">
        <p v-if="acceptText">{{ acceptText }}</p>
        <p v-if="maxSize">檔案大小限制: {{ maxSize }}MB</p>
      </div>
    </div>
    
    <!-- 上傳進度 -->
    <div v-if="uploading" class="mt-6">
      <div class="flex items-center justify-center space-x-2 mb-2">
        <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-blue-600">上傳中...</span>
      </div>
      
      <!-- 整體進度條 -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${overallProgress}%` }"
        ></div>
      </div>
      
      <p class="text-xs text-gray-500">
        {{ uploadedCount }}/{{ totalFiles }} 個檔案已上傳 ({{ overallProgress }}%)
      </p>
    </div>
    
    <!-- 成功提示 -->
    <div v-if="showSuccess" class="mt-6 text-green-600">
      <CheckCircleIcon class="w-8 h-8 mx-auto mb-2" />
      <p class="text-sm font-medium">上傳完成！</p>
    </div>
    
    <!-- 錯誤提示 -->
    <div v-if="lastError" class="mt-6 text-red-600">
      <XCircleIcon class="w-8 h-8 mx-auto mb-2" />
      <p class="text-sm">{{ lastError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import { fileService, type FileUploadRequest } from '@/services/fileService'

// Props
interface Props {
  title?: string
  description?: string
  accept?: string
  maxSize?: number // MB
  category?: string
  isPublic?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '拖拽檔案到此處上傳',
  description: '支援多檔案批量上傳',
  accept: '*/*',
  maxSize: 10,
  category: 'general',
  isPublic: false,
  disabled: false
})

// Emits
const emit = defineEmits<{
  uploaded: [files: any[]]
  error: [error: string]
  progress: [progress: { loaded: number; total: number; percentage: number }]
}>()

// State
const isDragging = ref(false)
const uploading = ref(false)
const uploadedCount = ref(0)
const totalFiles = ref(0)
const showSuccess = ref(false)
const lastError = ref<string>()

// Computed
const acceptText = computed(() => {
  if (props.accept === '*/*') return '支援所有檔案格式'
  if (props.accept.includes('image/')) return '支援圖片檔案'
  if (props.accept.includes('video/')) return '支援影片檔案'
  if (props.accept.includes('application/')) return '支援文件檔案'
  return `支援格式: ${props.accept}`
})

const overallProgress = computed(() => {
  if (totalFiles.value === 0) return 0
  return Math.round((uploadedCount.value / totalFiles.value) * 100)
})

// Methods
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  if (props.disabled) return
  
  if (event.dataTransfer?.files) {
    uploadFiles(Array.from(event.dataTransfer.files))
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
    isDragging.value = false
  }
}

async function uploadFiles(files: File[]) {
  if (props.disabled || files.length === 0) return
  
  // 重置狀態
  uploading.value = true
  uploadedCount.value = 0
  totalFiles.value = files.length
  showSuccess.value = false
  lastError.value = undefined
  
  // 驗證檔案
  const validFiles = files.filter(file => {
    // 驗證檔案類型
    if (props.accept !== '*/*' && !fileService.validateFileType(file, props.accept.split(','))) {
      lastError.value = `檔案 "${file.name}" 格式不支援`
      emit('error', lastError.value)
      return false
    }
    
    // 驗證檔案大小
    if (props.maxSize && !fileService.validateFileSize(file, props.maxSize)) {
      lastError.value = `檔案 "${file.name}" 大小超過 ${props.maxSize}MB 限制`
      emit('error', lastError.value)
      return false
    }
    
    return true
  })
  
  if (validFiles.length === 0) {
    uploading.value = false
    return
  }
  
  totalFiles.value = validFiles.length
  const uploadedFiles: any[] = []
  
  try {
    // 批量上傳
    for (const file of validFiles) {
      const request: FileUploadRequest = {
        category: props.category,
        isPublic: props.isPublic
      }
      
      const result = await fileService.uploadFile(file, request, (progress) => {
        emit('progress', progress)
      })
      
      if (result.success && result.data) {
        uploadedFiles.push(result.data)
        uploadedCount.value++
      } else {
        lastError.value = result.message || `檔案 "${file.name}" 上傳失敗`
        emit('error', lastError.value)
      }
    }
    
    if (uploadedFiles.length > 0) {
      emit('uploaded', uploadedFiles)
      showSuccess.value = true
      
      // 3秒後隱藏成功提示
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
    
  } catch (error) {
    lastError.value = error instanceof Error ? error.message : '上傳失敗'
    emit('error', lastError.value)
  } finally {
    uploading.value = false
    
    // 5秒後清除錯誤訊息
    if (lastError.value) {
      setTimeout(() => {
        lastError.value = undefined
      }, 5000)
    }
  }
}
</script>

<style scoped>
.file-dropzone {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
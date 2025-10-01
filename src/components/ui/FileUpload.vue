<template>
  <div class="file-upload">
    <!-- 上傳區域 -->
    <div
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      ]"
    >
      <!-- 上傳圖示和提示 -->
      <div class="flex flex-col items-center">
        <CloudArrowUpIcon 
          :class="[
            'w-12 h-12 mb-4',
            isDragging ? 'text-blue-500' : 'text-gray-400'
          ]" 
        />
        <p class="text-lg font-medium text-gray-900 mb-2">
          {{ isDragging ? '放開以上傳檔案' : '點擊或拖拽檔案到此處' }}
        </p>
        <p class="text-sm text-gray-500 mb-4">
          {{ acceptText }}
        </p>
        <p v-if="maxSize" class="text-xs text-gray-400">
          檔案大小限制: {{ formatFileSize(maxSize * 1024 * 1024) }}
        </p>
      </div>
    </div>

    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 檔案列表 -->
    <div v-if="files.length > 0" class="mt-4 space-y-2">
      <div
        v-for="(fileItem, index) in files"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center flex-1 min-w-0">
          <!-- 檔案圖示 -->
          <div class="flex-shrink-0 mr-3">
            <PhotoIcon v-if="isImage(fileItem.file)" class="w-8 h-8 text-blue-500" />
            <VideoCameraIcon v-else-if="isVideo(fileItem.file)" class="w-8 h-8 text-purple-500" />
            <DocumentIcon v-else class="w-8 h-8 text-gray-500" />
          </div>

          <!-- 檔案資訊 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ fileItem.file.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(fileItem.file.size) }}
            </p>

            <!-- 上傳進度 -->
            <div v-if="fileItem.uploading" class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>上傳中...</span>
                <span>{{ fileItem.progress?.percentage || 0 }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${fileItem.progress?.percentage || 0}%` }"
                ></div>
              </div>
            </div>

            <!-- 上傳成功 -->
            <div v-else-if="fileItem.uploaded" class="mt-1 flex items-center text-xs text-green-600">
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              上傳成功
            </div>

            <!-- 上傳錯誤 -->
            <div v-else-if="fileItem.error" class="mt-1 flex items-center text-xs text-red-600">
              <XCircleIcon class="w-4 h-4 mr-1" />
              {{ fileItem.error }}
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="flex items-center space-x-2 ml-4">
          <!-- 預覽按鈕 -->
          <button
            v-if="fileItem.uploaded && fileItem.result?.fileUrl"
            @click="previewFile(fileItem)"
            class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="預覽"
          >
            <EyeIcon class="w-4 h-4" />
          </button>

          <!-- 刪除按鈕 -->
          <button
            @click="removeFile(index)"
            class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="移除"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="files.length > 0 && multiple" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        共 {{ files.length }} 個檔案
        <span v-if="uploadedCount > 0">
          ({{ uploadedCount }} 個已上傳)
        </span>
      </div>
      <div class="flex space-x-2">
        <BaseButton
          v-if="hasUnuploadedFiles"
          @click="uploadAll"
          variant="primary"
          size="small"
          :loading="isUploading"
        >
          上傳全部
        </BaseButton>
        <BaseButton
          @click="clearAll"
          variant="outline"
          size="small"
        >
          清除全部
        </BaseButton>
      </div>
    </div>

    <!-- 預覽模態 -->
    <BaseModal
      :show="showPreview"
      @close="showPreview = false"
      title="檔案預覽"
      max-width="4xl"
    >
      <div v-if="previewFileItem" class="text-center">
        <!-- 圖片預覽 -->
        <img
          v-if="isImage(previewFileItem.file)"
          :src="getPreviewUrl(previewFileItem.result?.fileUrl || '')"
          :alt="previewFileItem.file.name"
          class="max-w-full max-h-96 mx-auto rounded-lg"
        />
        <!-- 影片預覽 -->
        <video
          v-else-if="isVideo(previewFileItem.file)"
          :src="getPreviewUrl(previewFileItem.result?.fileUrl || '')"
          controls
          class="max-w-full max-h-96 mx-auto rounded-lg"
        >
          您的瀏覽器不支援影片播放。
        </video>
        <!-- 其他檔案類型 -->
        <div v-else class="p-8">
          <DocumentIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-900">{{ previewFileItem.file.name }}</p>
          <p class="text-sm text-gray-500 mt-2">
            {{ formatFileSize(previewFileItem.file.size) }}
          </p>
          <BaseButton
            @click="downloadFile(previewFileItem)"
            variant="primary"
            class="mt-4"
          >
            下載檔案
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'
import { fileService, type FileUploadRequest, type FileUploadResponse, type UploadProgress } from '@/services/fileService'

// Props
interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  autoUpload?: boolean
  category?: string
  isPublic?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  multiple: false,
  maxSize: 10,
  autoUpload: true,
  category: 'general',
  isPublic: false
})

// Emits
const emit = defineEmits<{
  uploaded: [files: FileUploadResponse[]]
  error: [error: string]
  progress: [progress: UploadProgress]
}>()

// File item interface
interface FileItem {
  file: File
  uploading: boolean
  uploaded: boolean
  error?: string
  progress?: UploadProgress
  result?: FileUploadResponse
}

// State
const fileInput = ref<HTMLInputElement>()
const files = ref<FileItem[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const showPreview = ref(false)
const previewFileItem = ref<FileItem | null>(null)

// Computed
const acceptText = computed(() => {
  if (props.accept === '*/*') return '支援所有檔案格式'
  if (props.accept.includes('image/')) return '支援圖片檔案 (JPG, PNG, GIF 等)'
  if (props.accept.includes('video/')) return '支援影片檔案 (MP4, AVI 等)'
  return `支援格式: ${props.accept}`
})

const uploadedCount = computed(() => 
  files.value.filter(f => f.uploaded).length
)

const hasUnuploadedFiles = computed(() =>
  files.value.some(f => !f.uploaded && !f.uploading)
)

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  if (!(event.currentTarget as Element)?.contains(event.relatedTarget as Node)) {
    isDragging.value = false
  }
}

function addFiles(newFiles: File[]) {
  const validFiles = newFiles.filter(file => {
    // 驗證檔案類型
    if (props.accept !== '*/*' && !fileService.validateFileType(file, props.accept.split(','))) {
      emit('error', `檔案 "${file.name}" 格式不支援`)
      return false
    }
    
    // 驗證檔案大小
    if (props.maxSize && !fileService.validateFileSize(file, props.maxSize)) {
      emit('error', `檔案 "${file.name}" 大小超過 ${props.maxSize}MB 限制`)
      return false
    }
    
    return true
  })

  const fileItems = validFiles.map(file => ({
    file,
    uploading: false,
    uploaded: false
  }))

  if (props.multiple) {
    files.value.push(...fileItems)
  } else {
    files.value = fileItems
  }

  if (props.autoUpload && fileItems.length > 0) {
    uploadFiles(fileItems)
  }
}

async function uploadFiles(fileItems: FileItem[]) {
  isUploading.value = true
  
  for (const fileItem of fileItems) {
    if (fileItem.uploaded) continue
    
    fileItem.uploading = true
    fileItem.error = undefined
    
    try {
      const request: FileUploadRequest = {
        category: props.category,
        isPublic: props.isPublic
      }
      
      const result = await fileService.uploadFile(
        fileItem.file,
        request,
        (progress) => {
          fileItem.progress = progress
          emit('progress', progress)
        }
      )
      
      if (result.success) {
        fileItem.uploaded = true
        fileItem.result = result.data
        emit('uploaded', [result.data])
      } else {
        fileItem.error = result.message || '上傳失敗'
        emit('error', fileItem.error)
      }
    } catch (error) {
      fileItem.error = error instanceof Error ? error.message : '上傳失敗'
      emit('error', fileItem.error)
    } finally {
      fileItem.uploading = false
    }
  }
  
  isUploading.value = false
}

function uploadAll() {
  const unuploadedFiles = files.value.filter(f => !f.uploaded && !f.uploading)
  uploadFiles(unuploadedFiles)
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

function clearAll() {
  files.value = []
}

function previewFile(fileItem: FileItem) {
  previewFileItem.value = fileItem
  showPreview.value = true
}

function downloadFile(fileItem: FileItem) {
  if (fileItem.result?.fileUrl) {
    const link = document.createElement('a')
    link.href = getPreviewUrl(fileItem.result.fileUrl)
    link.download = fileItem.file.name
    link.click()
  }
}

// Utility methods
const { isImage, isVideo, formatFileSize, getPreviewUrl } = fileService
</script>

<style scoped>
.file-upload {
  @apply w-full;
}
</style>
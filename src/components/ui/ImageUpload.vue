<template>
  <div class="image-upload">
    <!-- 上傳區域 -->
    <div
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="[
        'relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        'aspect-square', // 正方形比例
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      ]"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <!-- 已上傳的圖片 -->
      <div v-if="imageUrl" class="relative w-full h-full">
        <img
          :src="imageUrl"
          :alt="fileName || '上傳的圖片'"
          class="w-full h-full object-cover"
        />
        <!-- 遮罩層 -->
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div class="opacity-0 hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              @click.stop="previewImage"
              class="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
              title="預覽"
            >
              <EyeIcon class="w-5 h-5" />
            </button>
            <button
              @click.stop="removeImage"
              class="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
              title="移除"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- 上傳進度 -->
        <div v-if="uploading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-4 max-w-xs w-full mx-4">
            <div class="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span>上傳中...</span>
              <span>{{ progress?.percentage || 0 }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress?.percentage || 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="flex flex-col items-center justify-center h-full p-4">
        <PhotoIcon 
          :class="[
            'w-12 h-12 mb-3',
            isDragging ? 'text-blue-500' : 'text-gray-400'
          ]" 
        />
        <p class="text-sm font-medium text-gray-900 text-center mb-1">
          {{ isDragging ? '放開以上傳' : '點擊上傳圖片' }}
        </p>
        <p class="text-xs text-gray-500 text-center">
          支援 JPG, PNG, GIF
        </p>
        <p v-if="maxSize" class="text-xs text-gray-400 text-center mt-1">
          最大 {{ maxSize }}MB
        </p>
      </div>
    </div>

    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 錯誤訊息 -->
    <div v-if="error" class="mt-2 text-sm text-red-600 flex items-center">
      <XCircleIcon class="w-4 h-4 mr-1 flex-shrink-0" />
      {{ error }}
    </div>

    <!-- 檔案資訊 -->
    <div v-if="fileName && !error" class="mt-2 text-sm text-gray-600">
      <p class="truncate">{{ fileName }}</p>
      <p v-if="fileSize" class="text-xs text-gray-500">
        {{ formatFileSize(fileSize) }}
      </p>
    </div>

    <!-- 預覽模態 -->
    <BaseModal
      :show="showPreview"
      @close="showPreview = false"
      title="圖片預覽"
      max-width="4xl"
    >
      <div v-if="imageUrl" class="text-center">
        <img
          :src="imageUrl"
          :alt="fileName || '預覽圖片'"
          class="max-w-full max-h-[80vh] mx-auto rounded-lg"
        />
      </div>
    </BaseModal>

    <!-- 圖片裁切模態 -->
    <BaseModal
      :show="showCropper"
      @close="cancelCrop"
      title="裁切圖片"
      max-width="4xl"
    >
      <div v-if="cropImageSrc" class="space-y-4">
        <!-- 裁切區域 -->
        <div class="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            ref="cropImage"
            :src="cropImageSrc"
            alt="待裁切圖片"
            class="max-w-full max-h-96"
          />
        </div>
        
        <!-- 裁切選項 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">縱橫比:</label>
            <select 
              v-model="cropAspectRatio" 
              class="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="1">1:1 (正方形)</option>
              <option value="1.33">4:3</option>
              <option value="1.78">16:9</option>
              <option value="0">自由裁切</option>
            </select>
          </div>
          
          <div class="flex space-x-2">
            <BaseButton @click="cancelCrop" variant="outline" size="small">
              取消
            </BaseButton>
            <BaseButton @click="applyCrop" variant="primary" size="small">
              套用裁切
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PhotoIcon, EyeIcon, TrashIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'
import { fileService, type FileUploadRequest, type FileUploadResponse, type UploadProgress } from '@/services/fileService'

// Props
interface Props {
  modelValue?: string // 圖片 URL
  size?: number // 上傳區域大小 (px)
  maxSize?: number // 檔案大小限制 (MB)
  category?: string
  isPublic?: boolean
  allowCrop?: boolean // 是否允許裁切
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  maxSize: 5,
  category: 'images',
  isPublic: false,
  allowCrop: false,
  placeholder: '上傳圖片'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  uploaded: [file: FileUploadResponse]
  error: [error: string]
}>()

// State
const fileInput = ref<HTMLInputElement>()
const cropImage = ref<HTMLImageElement>()
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref<UploadProgress>()
const error = ref<string>()
const showPreview = ref(false)
const showCropper = ref(false)
const cropImageSrc = ref<string>()
const cropAspectRatio = ref<number>(1)
const currentFile = ref<File>()
const fileName = ref<string>()
const fileSize = ref<number>()

// Computed
const imageUrl = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

// Cropper instance (動態導入)
let cropper: any = null

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    processFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  if (event.dataTransfer?.files?.[0]) {
    processFile(event.dataTransfer.files[0])
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

function processFile(file: File) {
  error.value = undefined
  
  // 驗證檔案類型
  if (!fileService.isImage(file)) {
    error.value = '請選擇圖片檔案 (JPG, PNG, GIF)'
    return
  }
  
  // 驗證檔案大小
  if (!fileService.validateFileSize(file, props.maxSize)) {
    error.value = `圖片大小不能超過 ${props.maxSize}MB`
    return
  }
  
  currentFile.value = file
  fileName.value = file.name
  fileSize.value = file.size
  
  if (props.allowCrop) {
    // 顯示裁切介面
    const reader = new FileReader()
    reader.onload = (e) => {
      cropImageSrc.value = e.target?.result as string
      showCropper.value = true
    }
    reader.readAsDataURL(file)
  } else {
    // 直接上傳
    uploadFile(file)
  }
}

async function uploadFile(file: File) {
  uploading.value = true
  error.value = undefined
  
  try {
    const request: FileUploadRequest = {
      category: props.category,
      isPublic: props.isPublic
    }
    
    const result = await fileService.uploadFile(
      file,
      request,
      (uploadProgress) => {
        progress.value = uploadProgress
      }
    )
    
    if (result.success && result.data) {
      imageUrl.value = result.data.fileUrl
      emit('uploaded', result.data)
    } else {
      error.value = result.message || '上傳失敗'
      emit('error', error.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '上傳失敗'
    emit('error', error.value)
  } finally {
    uploading.value = false
    progress.value = undefined
  }
}

function removeImage() {
  imageUrl.value = ''
  fileName.value = undefined
  fileSize.value = undefined
  error.value = undefined
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function previewImage() {
  if (imageUrl.value) {
    showPreview.value = true
  }
}

// 裁切相關方法
async function initCropper() {
  if (!cropImage.value || !cropImageSrc.value) return
  
  try {
    // 動態導入 cropperjs
    const Cropper = (await import('cropperjs' as any)).default
    
    cropper = new Cropper(cropImage.value, {
      aspectRatio: cropAspectRatio.value || undefined,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    })
  } catch (error) {
    console.warn('裁切功能需要安裝 cropperjs 套件')
    // 如果沒有安裝 cropperjs，直接上傳原圖
    if (currentFile.value) {
      uploadFile(currentFile.value)
    }
    showCropper.value = false
  }
}

function cancelCrop() {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  showCropper.value = false
  cropImageSrc.value = undefined
}

async function applyCrop() {
  if (!cropper || !currentFile.value) return
  
  try {
    const canvas = cropper.getCroppedCanvas({
      width: 800,
      height: 800,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const croppedFile = new File([blob], currentFile.value!.name, {
          type: currentFile.value!.type,
          lastModified: Date.now(),
        })
        
        await uploadFile(croppedFile)
      }
    }, currentFile.value.type, 0.9)
  } catch (error) {
    error.value = '圖片裁切失敗'
    emit('error', error.value)
  } finally {
    cancelCrop()
  }
}

// Watch
watch(() => cropAspectRatio.value, (newRatio) => {
  if (cropper) {
    cropper.setAspectRatio(newRatio || undefined)
  }
})

watch(() => showCropper.value, (show) => {
  if (show) {
    // 等待模態開啟後初始化裁切器
    setTimeout(initCropper, 100)
  }
})

// Lifecycle
onUnmounted(() => {
  if (cropper) {
    cropper.destroy()
  }
})

// Utility methods
const { formatFileSize } = fileService
</script>

<style scoped>
.image-upload {
  @apply inline-block;
}

/* Cropper.js 樣式覆蓋 */
:deep(.cropper-container) {
  @apply max-h-96;
}
</style>
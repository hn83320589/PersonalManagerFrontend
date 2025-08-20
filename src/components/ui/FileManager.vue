<template>
  <div class="file-manager space-y-6">
    <!-- 檔案上傳區域 -->
    <div v-if="allowUpload" class="bg-gray-50 rounded-lg p-4">
      <FileDropzone
        :title="uploadTitle"
        :description="uploadDescription"
        :accept="accept"
        :max-size="maxSize"
        :category="category"
        :is-public="isPublic"
        @uploaded="handleFilesUploaded"
        @error="handleUploadError"
      />
    </div>

    <!-- 工具列 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- 視圖切換 -->
        <div class="flex items-center space-x-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-md transition-colors',
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            ]"
            title="網格視圖"
          >
            <Squares2X2Icon class="w-5 h-5" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            ]"
            title="列表視圖"
          >
            <ListBulletIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- 篩選器 -->
        <div class="flex items-center space-x-2">
          <select
            v-model="filterType"
            class="text-sm border border-gray-300 rounded px-3 py-1"
          >
            <option value="">全部類型</option>
            <option value="image">圖片</option>
            <option value="video">影片</option>
            <option value="document">文件</option>
          </select>
          
          <select
            v-model="sortBy"
            class="text-sm border border-gray-300 rounded px-3 py-1"
          >
            <option value="createdAt">上傳時間</option>
            <option value="fileName">檔案名稱</option>
            <option value="fileSize">檔案大小</option>
          </select>
        </div>

        <!-- 搜尋 -->
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋檔案..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- 批量操作 -->
      <div class="flex items-center space-x-2">
        <span v-if="selectedFiles.length > 0" class="text-sm text-gray-600">
          已選中 {{ selectedFiles.length }} 個檔案
        </span>
        <BaseButton
          v-if="selectedFiles.length > 0"
          @click="deleteSelectedFiles"
          variant="outline"
          size="small"
        >
          <TrashIcon class="w-4 h-4 mr-1" />
          刪除選中
        </BaseButton>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner class="mx-auto" />
      <p class="mt-2 text-sm text-gray-500">載入檔案中...</p>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="filteredFiles.length === 0" class="text-center py-12">
      <FolderOpenIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p class="text-lg font-medium text-gray-900 mb-2">
        {{ searchQuery ? '沒有找到相關檔案' : '還沒有上傳任何檔案' }}
      </p>
      <p class="text-sm text-gray-500">
        {{ searchQuery ? '嘗試調整搜尋條件' : '開始上傳您的第一個檔案' }}
      </p>
    </div>

    <!-- 檔案列表 - 網格視圖 -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="file in paginatedFiles"
        :key="file.id"
        class="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- 選擇框 -->
        <div class="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            :value="file.id"
            v-model="selectedFiles"
            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <!-- 檔案預覽 -->
        <div 
          @click="openPreview(file)"
          class="aspect-square cursor-pointer"
        >
          <!-- 圖片預覽 -->
          <img
            v-if="isImage(file.fileName)"
            :src="getPreviewUrl(file.fileUrl)"
            :alt="file.originalFileName"
            class="w-full h-full object-cover"
          />
          <!-- 影片預覽 -->
          <div v-else-if="isVideo(file.fileName)" class="w-full h-full bg-gray-100 flex items-center justify-center">
            <VideoCameraIcon class="w-12 h-12 text-purple-500" />
          </div>
          <!-- 其他檔案 -->
          <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
            <DocumentIcon class="w-12 h-12 text-gray-500" />
          </div>
        </div>

        <!-- 檔案資訊 -->
        <div class="p-3">
          <p class="text-sm font-medium text-gray-900 truncate" :title="file.originalFileName">
            {{ file.originalFileName }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatFileSize(file.fileSize) }}
          </p>
        </div>

        <!-- 操作按鈕 -->
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex space-x-1">
            <button
              @click="downloadFile(file)"
              class="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              title="下載"
            >
              <ArrowDownTrayIcon class="w-4 h-4 text-gray-600" />
            </button>
            <button
              @click="deleteFile(file)"
              class="p-1 bg-white rounded-full shadow-sm hover:bg-red-100 transition-colors"
              title="刪除"
            >
              <TrashIcon class="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 檔案列表 - 列表視圖 -->
    <div v-else class="bg-white rounded-lg border border-gray-200">
      <BaseTable
        :data="paginatedFiles"
        :columns="tableColumns"
        :loading="loading"
        selectable
        v-model:selected="selectedFiles"
        @row-click="openPreview"
      >
        <!-- 檔案名稱欄位 -->
        <template #fileName="{ row }">
          <div class="flex items-center">
            <div class="flex-shrink-0 mr-3">
              <PhotoIcon v-if="isImage(row.fileName)" class="w-8 h-8 text-blue-500" />
              <VideoCameraIcon v-else-if="isVideo(row.fileName)" class="w-8 h-8 text-purple-500" />
              <DocumentIcon v-else class="w-8 h-8 text-gray-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ row.originalFileName }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ row.category }}
              </p>
            </div>
          </div>
        </template>

        <!-- 檔案大小欄位 -->
        <template #fileSize="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>

        <!-- 上傳時間欄位 -->
        <template #createdAt="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <!-- 操作欄位 -->
        <template #actions="{ row }">
          <div class="flex items-center space-x-2">
            <button
              @click.stop="openPreview(row)"
              class="text-blue-600 hover:text-blue-700 transition-colors"
              title="預覽"
            >
              <EyeIcon class="w-4 h-4" />
            </button>
            <button
              @click.stop="downloadFile(row)"
              class="text-gray-600 hover:text-gray-700 transition-colors"
              title="下載"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
            </button>
            <button
              @click.stop="deleteFile(row)"
              class="text-red-600 hover:text-red-700 transition-colors"
              title="刪除"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2">
      <BaseButton
        @click="currentPage--"
        :disabled="currentPage <= 1"
        variant="outline"
        size="small"
      >
        上一頁
      </BaseButton>
      
      <span class="text-sm text-gray-600">
        第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
      </span>
      
      <BaseButton
        @click="currentPage++"
        :disabled="currentPage >= totalPages"
        variant="outline"
        size="small"
      >
        下一頁
      </BaseButton>
    </div>

    <!-- 預覽模態 -->
    <BaseModal
      :show="showPreview"
      @close="showPreview = false"
      :title="`預覽: ${previewFile?.originalFileName}`"
      max-width="4xl"
    >
      <div v-if="previewFile" class="text-center">
        <!-- 圖片預覽 -->
        <img
          v-if="isImage(previewFile.fileName)"
          :src="getPreviewUrl(previewFile.fileUrl)"
          :alt="previewFile.originalFileName"
          class="max-w-full max-h-96 mx-auto rounded-lg"
        />
        <!-- 影片預覽 -->
        <video
          v-else-if="isVideo(previewFile.fileName)"
          :src="getPreviewUrl(previewFile.fileUrl)"
          controls
          class="max-w-full max-h-96 mx-auto rounded-lg"
        >
          您的瀏覽器不支援影片播放。
        </video>
        <!-- 其他檔案類型 -->
        <div v-else class="p-8">
          <DocumentIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-900">{{ previewFile.originalFileName }}</p>
          <p class="text-sm text-gray-500 mt-2">
            {{ formatFileSize(previewFile.fileSize) }}
          </p>
          <BaseButton
            @click="downloadFile(previewFile)"
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
import { ref, computed, onMounted, watch } from 'vue'
import {
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import BaseTable from './BaseTable.vue'
import BaseModal from './BaseModal.vue'
import FileDropzone from './FileDropzone.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { fileService, type FileUploadResponse } from '@/services/fileService'

// Props
interface Props {
  userId?: number
  category?: string
  isPublic?: boolean
  allowUpload?: boolean
  accept?: string
  maxSize?: number
  uploadTitle?: string
  uploadDescription?: string
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  allowUpload: true,
  accept: '*/*',
  maxSize: 10,
  uploadTitle: '拖拽檔案到此處上傳',
  uploadDescription: '支援多檔案批量上傳',
  pageSize: 20
})

// Emits
const emit = defineEmits<{
  uploaded: [files: FileUploadResponse[]]
  deleted: [file: FileUploadResponse]
}>()

// State
const files = ref<FileUploadResponse[]>([])
const loading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const filterType = ref('')
const sortBy = ref('createdAt')
const searchQuery = ref('')
const selectedFiles = ref<number[]>([])
const currentPage = ref(1)
const showPreview = ref(false)
const previewFile = ref<FileUploadResponse | null>(null)

// Table columns
const tableColumns = [
  { key: 'fileName', label: '檔案名稱', sortable: true },
  { key: 'fileSize', label: '大小', sortable: true },
  { key: 'createdAt', label: '上傳時間', sortable: true },
  { key: 'actions', label: '操作', width: '120px' }
]

// Computed
const filteredFiles = computed(() => {
  let result = [...files.value]

  // 篩選類型
  if (filterType.value) {
    result = result.filter(file => {
      if (filterType.value === 'image') return isImage(file.fileName)
      if (filterType.value === 'video') return isVideo(file.fileName)
      if (filterType.value === 'document') return !isImage(file.fileName) && !isVideo(file.fileName)
      return true
    })
  }

  // 搜尋
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(file =>
      file.originalFileName.toLowerCase().includes(query) ||
      file.description.toLowerCase().includes(query)
    )
  }

  // 排序
  result.sort((a, b) => {
    const aValue = a[sortBy.value as keyof FileUploadResponse]
    const bValue = b[sortBy.value as keyof FileUploadResponse]
    
    if (sortBy.value === 'createdAt') {
      return new Date(bValue as string).getTime() - new Date(aValue as string).getTime()
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return bValue - aValue
    }
    
    return 0
  })

  return result
})

const totalPages = computed(() => 
  Math.ceil(filteredFiles.value.length / props.pageSize)
)

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredFiles.value.slice(start, end)
})

// Methods
async function loadFiles() {
  loading.value = true
  try {
    let result
    if (props.userId) {
      result = await fileService.getUserFiles(props.userId)
    } else {
      result = await fileService.getPublicFiles(props.category)
    }
    
    if (result.success && result.data) {
      files.value = result.data
    }
  } catch (error) {
    console.error('載入檔案失敗:', error)
  } finally {
    loading.value = false
  }
}

function handleFilesUploaded(uploadedFiles: FileUploadResponse[]) {
  files.value.unshift(...uploadedFiles)
  emit('uploaded', uploadedFiles)
}

function handleUploadError(error: string) {
  console.error('上傳錯誤:', error)
}

function openPreview(file: FileUploadResponse) {
  previewFile.value = file
  showPreview.value = true
}

async function deleteFile(file: FileUploadResponse) {
  if (!confirm(`確定要刪除檔案 "${file.originalFileName}" 嗎？`)) return
  
  try {
    const result = await fileService.deleteFile(file.id)
    if (result.success) {
      files.value = files.value.filter(f => f.id !== file.id)
      selectedFiles.value = selectedFiles.value.filter(id => id !== file.id)
      emit('deleted', file)
    }
  } catch (error) {
    console.error('刪除檔案失敗:', error)
  }
}

async function deleteSelectedFiles() {
  if (!confirm(`確定要刪除選中的 ${selectedFiles.value.length} 個檔案嗎？`)) return
  
  const deletedFiles: FileUploadResponse[] = []
  
  for (const fileId of selectedFiles.value) {
    try {
      const result = await fileService.deleteFile(fileId)
      if (result.success) {
        const file = files.value.find(f => f.id === fileId)
        if (file) {
          deletedFiles.push(file)
        }
      }
    } catch (error) {
      console.error(`刪除檔案 ${fileId} 失敗:`, error)
    }
  }
  
  // 更新檔案列表
  files.value = files.value.filter(f => !selectedFiles.value.includes(f.id))
  selectedFiles.value = []
  
  // 發送刪除事件
  deletedFiles.forEach(file => emit('deleted', file))
}

function downloadFile(file: FileUploadResponse) {
  const link = document.createElement('a')
  link.href = getPreviewUrl(file.fileUrl)
  link.download = file.originalFileName
  link.click()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Utility methods
const { isImage, isVideo, formatFileSize, getPreviewUrl } = fileService

// Watch
watch([filterType, sortBy, searchQuery], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.file-manager {
  @apply max-w-full;
}
</style>
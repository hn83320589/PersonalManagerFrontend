<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">檔案管理</h2>
          <p class="mt-1 text-sm text-gray-600">
            管理上傳的檔案、圖片和文件
          </p>
        </div>
        <div class="flex space-x-3">
          <BaseButton
            variant="outline"
            @click="showUploadModal = true"
          >
            <CloudArrowUpIcon class="w-4 h-4 mr-2" />
            上傳檔案
          </BaseButton>
          <BaseButton
            variant="outline"
            @click="showBatchModal = true"
            :disabled="selectedFiles.length === 0"
          >
            <Squares2X2Icon class="w-4 h-4 mr-2" />
            批量操作 ({{ selectedFiles.length }})
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="showSettingsModal = true"
          >
            <Cog6ToothIcon class="w-4 h-4 mr-2" />
            檔案設定
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <FolderIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">總檔案數</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ totalFiles }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100">
            <PhotoIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">圖片檔案</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ imageFiles }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100">
            <DocumentIcon class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">文檔檔案</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ documentFiles }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-100">
            <CircleStackIcon class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">已使用空間</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ formatFileSize(totalSize) }}</p>
            <p class="text-xs text-gray-500">{{ storageUsagePercent }}% 已使用</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Filters and Controls -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Search and Filters -->
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <div class="relative flex-1 max-w-md">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋檔案名稱..."
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="flex gap-2">
            <select
              v-model="selectedCategory"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有類型</option>
              <option value="image">圖片</option>
              <option value="document">文檔</option>
              <option value="video">影片</option>
              <option value="other">其他</option>
            </select>

            <select
              v-model="selectedTimeRange"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有時間</option>
              <option value="today">今天</option>
              <option value="week">本週</option>
              <option value="month">本月</option>
            </select>
          </div>
        </div>

        <!-- View Options -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-700">排序:</label>
            <select
              v-model="sortBy"
              class="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">上傳時間</option>
              <option value="name">檔案名稱</option>
              <option value="size">檔案大小</option>
              <option value="type">檔案類型</option>
            </select>
          </div>

          <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <ListBulletIcon class="w-4 h-4" />
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <Squares2X2Icon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Files Content -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <!-- Table Header -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="flex items-center">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="toggleSelectAll"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
            />
            <div class="flex-1 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div class="col-span-4">檔案名稱</div>
              <div class="col-span-2">類型</div>
              <div class="col-span-2">大小</div>
              <div class="col-span-2">上傳時間</div>
              <div class="col-span-2">操作</div>
            </div>
          </div>
        </div>

        <!-- File Rows -->
        <div class="divide-y divide-gray-200">
          <div
            v-for="file in filteredAndSortedFiles"
            :key="file.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center">
              <input
                type="checkbox"
                :checked="selectedFiles.includes(file.id)"
                @change="toggleFileSelection(file.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
              />
              <div class="flex-1 grid grid-cols-12 gap-4">
                <!-- File Info -->
                <div class="col-span-4 flex items-center">
                  <div class="flex-shrink-0 mr-3">
                    <component 
                      :is="getFileIcon(file.contentType)" 
                      class="h-8 w-8 text-gray-400" 
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.fileName }}</p>
                    <p class="text-xs text-gray-500">{{ file.originalFileName }}</p>
                  </div>
                </div>

                <!-- Type -->
                <div class="col-span-2">
                  <span :class="getTypeBadgeClass(file.contentType)">
                    {{ getFileTypeLabel(file.contentType) }}
                  </span>
                </div>

                <!-- Size -->
                <div class="col-span-2">
                  <p class="text-sm text-gray-900">{{ formatFileSize(file.fileSize) }}</p>
                </div>

                <!-- Upload Time -->
                <div class="col-span-2">
                  <p class="text-sm text-gray-900">{{ formatDate(file.createdAt) }}</p>
                  <p class="text-xs text-gray-500">{{ formatTimeAgo(file.createdAt) }}</p>
                </div>

                <!-- Actions -->
                <div class="col-span-2">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="previewFile(file)"
                      class="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="預覽"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="downloadFile(file)"
                      class="p-1 text-green-600 hover:text-green-700 transition-colors"
                      title="下載"
                    >
                      <ArrowDownTrayIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="copyFileUrl(file)"
                      class="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                      title="複製連結"
                    >
                      <LinkIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteFile(file.id)"
                      class="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="刪除"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div
            v-for="file in filteredAndSortedFiles"
            :key="file.id"
            class="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="previewFile(file)"
          >
            <!-- Selection Checkbox -->
            <div class="absolute top-2 right-2">
              <input
                type="checkbox"
                :checked="selectedFiles.includes(file.id)"
                @change.stop="toggleFileSelection(file.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <!-- File Preview -->
            <div class="flex flex-col items-center">
              <div class="mb-3">
                <img 
                  v-if="isImage(file.contentType)"
                  :src="getFileUrl(file)"
                  :alt="file.fileName"
                  class="w-16 h-16 object-cover rounded"
                  loading="lazy"
                />
                <component 
                  v-else
                  :is="getFileIcon(file.contentType)" 
                  class="h-16 w-16 text-gray-400" 
                />
              </div>

              <!-- File Info -->
              <div class="text-center w-full">
                <p class="text-xs font-medium text-gray-900 truncate" :title="file.fileName">
                  {{ file.fileName }}
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(file.fileSize) }}</p>
                <span :class="getTypeBadgeClass(file.contentType, true)">
                  {{ getFileTypeLabel(file.contentType) }}
                </span>
              </div>
            </div>

            <!-- Actions Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                @click.stop="previewFile(file)"
                class="p-2 bg-white rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                title="預覽"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
              <button
                @click.stop="downloadFile(file)"
                class="p-2 bg-white rounded-full text-gray-600 hover:text-green-600 transition-colors"
                title="下載"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
              </button>
              <button
                @click.stop="deleteFile(file.id)"
                class="p-2 bg-white rounded-full text-gray-600 hover:text-red-600 transition-colors"
                title="刪除"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredAndSortedFiles.length === 0" class="text-center py-12">
        <FolderIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到檔案</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? '嘗試調整搜尋條件' : '還沒有上傳任何檔案' }}
        </p>
        <div class="mt-6">
          <BaseButton
            variant="primary"
            @click="showUploadModal = true"
          >
            <CloudArrowUpIcon class="w-4 h-4 mr-2" />
            上傳第一個檔案
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- File Upload Modal -->
    <BaseModal
      :show="showUploadModal"
      @close="showUploadModal = false"
      title="上傳檔案"
      max-width="lg"
    >
      <FileUpload
        :multiple="true"
        :max-file-size="10"
        :accepted-types="['image/*', 'application/pdf', 'text/*']"
        @uploaded="handleFileUploaded"
        @error="handleUploadError"
      />
    </BaseModal>

    <!-- File Preview Modal -->
    <BaseModal
      :show="showPreviewModal"
      @close="showPreviewModal = false"
      :title="previewingFile?.fileName || '檔案預覽'"
      max-width="4xl"
    >
      <div v-if="previewingFile" class="space-y-4">
        <!-- Image Preview -->
        <div v-if="isImage(previewingFile.contentType)" class="text-center">
          <img 
            :src="getFileUrl(previewingFile)"
            :alt="previewingFile.fileName"
            class="max-w-full max-h-96 mx-auto rounded"
          />
        </div>
        
        <!-- File Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">檔案名稱</dt>
              <dd class="text-sm text-gray-900">{{ previewingFile.fileName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">原始名稱</dt>
              <dd class="text-sm text-gray-900">{{ previewingFile.originalFileName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">檔案類型</dt>
              <dd class="text-sm text-gray-900">{{ previewingFile.contentType }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">檔案大小</dt>
              <dd class="text-sm text-gray-900">{{ formatFileSize(previewingFile.fileSize) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">上傳時間</dt>
              <dd class="text-sm text-gray-900">{{ formatDate(previewingFile.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">檔案URL</dt>
              <dd class="text-sm text-blue-600 break-all">
                <a :href="getFileUrl(previewingFile)" target="_blank">{{ getFileUrl(previewingFile) }}</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="downloadFile(previewingFile!)"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          下載
        </BaseButton>
        <BaseButton
          variant="outline"
          @click="copyFileUrl(previewingFile!)"
        >
          <LinkIcon class="w-4 h-4 mr-2" />
          複製連結
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Batch Operations Modal -->
    <BaseModal
      :show="showBatchModal"
      @close="showBatchModal = false"
      title="批量操作"
      max-width="md"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          已選擇 {{ selectedFiles.length }} 個檔案
        </p>
        
        <div class="space-y-3">
          <BaseButton
            variant="outline"
            @click="batchDownload"
            class="w-full justify-start text-green-600"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            批量下載
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="batchDelete"
            class="w-full justify-start text-red-600"
          >
            <TrashIcon class="w-4 h-4 mr-2" />
            批量刪除
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Settings Modal -->
    <BaseModal
      :show="showSettingsModal"
      @close="showSettingsModal = false"
      title="檔案管理設定"
      max-width="lg"
    >
      <div class="space-y-6">
        <!-- Upload Settings -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">上傳設定</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                最大檔案大小 (MB)
              </label>
              <BaseInput
                v-model.number="settings.maxFileSize"
                type="number"
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                允許的檔案類型
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="settings.allowedTypes.image"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  圖片 (jpg, png, gif, webp)
                </label>
                <label class="flex items-center">
                  <input
                    v-model="settings.allowedTypes.document"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  文檔 (pdf, doc, txt)
                </label>
                <label class="flex items-center">
                  <input
                    v-model="settings.allowedTypes.video"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  影片 (mp4, avi, mov)
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Settings -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">儲存設定</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                儲存空間限制 (GB)
              </label>
              <BaseInput
                v-model.number="settings.storageLimit"
                type="number"
                min="1"
                max="1000"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">自動清理</label>
                <p class="text-xs text-gray-500">自動刪除 30 天前的暫存檔案</p>
              </div>
              <input
                v-model="settings.autoCleanup"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="showSettingsModal = false"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="saveSettings"
        >
          儲存設定
        </BaseButton>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  CloudArrowUpIcon,
  FolderIcon,
  PhotoIcon,
  DocumentIcon,
  CircleStackIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useFileStore } from '@/stores/file'
import type { FileUploadResponse } from '@/services/fileService'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FileUpload from '@/components/ui/FileUpload.vue'

// Stores
const fileStore = useFileStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTimeRange = ref('')
const sortBy = ref<'createdAt' | 'name' | 'size' | 'type'>('createdAt')
const viewMode = ref<'list' | 'grid'>('grid')
const selectedFiles = ref<number[]>([])
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showBatchModal = ref(false)
const showSettingsModal = ref(false)
const previewingFile = ref<FileUploadResponse | null>(null)

const settings = ref({
  maxFileSize: 10,
  storageLimit: 100,
  autoCleanup: true,
  allowedTypes: {
    image: true,
    document: true,
    video: false
  }
})

// Computed
const files = computed(() => fileStore.files)

const totalFiles = computed(() => files.value.length)

const imageFiles = computed(() => {
  return files.value.filter(file => isImage(file.contentType)).length
})

const documentFiles = computed(() => {
  return files.value.filter(file => isDocument(file.contentType)).length
})

const totalSize = computed(() => {
  return files.value.reduce((total, file) => total + file.fileSize, 0)
})

const storageUsagePercent = computed(() => {
  const limitInBytes = settings.value.storageLimit * 1024 * 1024 * 1024
  return Math.round((totalSize.value / limitInBytes) * 100)
})

const allSelected = computed(() => {
  return filteredAndSortedFiles.value.length > 0 && 
         filteredAndSortedFiles.value.every(file => selectedFiles.value.includes(file.id))
})

const someSelected = computed(() => {
  return selectedFiles.value.length > 0 && selectedFiles.value.length < filteredAndSortedFiles.value.length
})

const filteredAndSortedFiles = computed(() => {
  let filtered = files.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(file =>
      file.fileName.toLowerCase().includes(query) ||
      file.originalFileName.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(file => {
      const category = getFileCategory(file.contentType)
      return category === selectedCategory.value
    })
  }

  // Time range filter
  if (selectedTimeRange.value) {
    const now = new Date()
    const startDate = new Date()
    
    switch (selectedTimeRange.value) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }
    
    filtered = filtered.filter(file => new Date(file.createdAt) >= startDate)
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
        return a.fileName.localeCompare(b.fileName)
      case 'size':
        return b.fileSize - a.fileSize
      case 'type':
        return a.contentType.localeCompare(b.contentType)
      default:
        return 0
    }
  })
})

// Methods
function toggleFileSelection(fileId: number) {
  const index = selectedFiles.value.indexOf(fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedFiles.value = []
  } else {
    selectedFiles.value = filteredAndSortedFiles.value.map(file => file.id)
  }
}

function getFileCategory(contentType: string): string {
  if (isImage(contentType)) return 'image'
  if (isDocument(contentType)) return 'document'
  if (isVideo(contentType)) return 'video'
  return 'other'
}

function isImage(contentType: string): boolean {
  return contentType.startsWith('image/')
}

function isDocument(contentType: string): boolean {
  return ['application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'].some(type => 
    contentType.startsWith(type)
  )
}

function isVideo(contentType: string): boolean {
  return contentType.startsWith('video/')
}

function getFileIcon(contentType: string) {
  if (isImage(contentType)) return PhotoIcon
  if (isDocument(contentType)) return DocumentIcon
  if (isVideo(contentType)) return 'VideoCameraIcon'
  return FolderIcon
}

function getFileTypeLabel(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'application/pdf': 'PDF',
    'text/plain': 'TXT',
    'video/mp4': 'MP4',
    'video/avi': 'AVI'
  }
  
  return typeMap[contentType] || contentType.split('/')[1]?.toUpperCase() || 'Unknown'
}

function getTypeBadgeClass(contentType: string, small = false): string {
  const baseClass = small 
    ? 'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium'
    : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  if (isImage(contentType)) {
    return `${baseClass} bg-green-100 text-green-800`
  }
  if (isDocument(contentType)) {
    return `${baseClass} bg-blue-100 text-blue-800`
  }
  if (isVideo(contentType)) {
    return `${baseClass} bg-purple-100 text-purple-800`
  }
  return `${baseClass} bg-gray-100 text-gray-800`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return '剛剛'
  if (diffInHours < 24) return `${diffInHours} 小時前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} 天前`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks} 週前`
  
  return formatDate(dateString)
}

function getFileUrl(file: FileUploadResponse): string {
  return file.fileUrl || file.filePath
}

function previewFile(file: FileUploadResponse) {
  previewingFile.value = file
  showPreviewModal.value = true
}

function downloadFile(file: FileUploadResponse) {
  const link = document.createElement('a')
  link.href = getFileUrl(file)
  link.download = file.originalFileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function copyFileUrl(file: FileUploadResponse) {
  try {
    await navigator.clipboard.writeText(getFileUrl(file))
    // Show success message
    alert('檔案連結已複製到剪貼簿')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

async function deleteFile(id: number) {
  if (confirm('確定要刪除這個檔案嗎？此操作無法復原。')) {
    try {
      await fileStore.deleteFile(id)
    } catch (error) {
      console.error('Delete file error:', error)
    }
  }
}

function handleFileUploaded(files: FileUploadResponse[]) {
  showUploadModal.value = false
  // Refresh file list
  fileStore.fetchFiles()
}

function handleUploadError(error: string) {
  console.error('Upload error:', error)
  alert('檔案上傳失敗：' + error)
}

async function batchDownload() {
  const selectedFileObjects = files.value.filter(file => selectedFiles.value.includes(file.id))
  
  // Create download links for each file
  selectedFileObjects.forEach(file => {
    downloadFile(file)
  })
  
  selectedFiles.value = []
  showBatchModal.value = false
}

async function batchDelete() {
  if (confirm(`確定要刪除選中的 ${selectedFiles.value.length} 個檔案嗎？此操作無法復原。`)) {
    try {
      await Promise.all(
        selectedFiles.value.map(id => fileStore.deleteFile(id))
      )
      selectedFiles.value = []
      showBatchModal.value = false
    } catch (error) {
      console.error('Batch delete error:', error)
    }
  }
}

function saveSettings() {
  // In a real app, save settings to backend
  console.log('Saving file management settings:', settings.value)
  showSettingsModal.value = false
}

// Lifecycle
onMounted(async () => {
  await fileStore.fetchFiles()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
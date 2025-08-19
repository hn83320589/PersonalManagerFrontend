<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto">
      <!-- Editor Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ post ? '編輯文章' : '撰寫新文章' }}
            </h2>
            <p class="mt-1 text-sm text-gray-600">
              {{ post ? `編輯文章「${post.title}」` : '建立一篇新的部落格文章' }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Auto Save Status -->
            <div class="flex items-center text-sm text-gray-500">
              <div v-if="autoSaveStatus === 'saving'" class="flex items-center">
                <div class="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
                儲存中...
              </div>
              <div v-else-if="autoSaveStatus === 'saved'" class="flex items-center text-green-600">
                <CheckIcon class="w-3 h-3 mr-1" />
                已儲存
              </div>
              <div v-else-if="autoSaveStatus === 'error'" class="flex items-center text-red-600">
                <ExclamationTriangleIcon class="w-3 h-3 mr-1" />
                儲存失敗
              </div>
            </div>

            <!-- Action Buttons -->
            <BaseButton
              variant="outline"
              @click="showPreview = !showPreview"
            >
              <EyeIcon class="w-4 h-4 mr-2" />
              {{ showPreview ? '隱藏預覽' : '預覽' }}
            </BaseButton>
            <BaseButton
              variant="outline"
              @click="saveDraft"
              :disabled="!isFormValid"
            >
              <DocumentIcon class="w-4 h-4 mr-2" />
              儲存草稿
            </BaseButton>
            <BaseButton
              variant="primary"
              @click="showPublishModal = true"
              :disabled="!isFormValid"
            >
              <CloudArrowUpIcon class="w-4 h-4 mr-2" />
              {{ post?.status === 'published' ? '更新文章' : '發布文章' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Editor Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Main Editor Column -->
        <div :class="showPreview ? 'lg:col-span-6' : 'lg:col-span-9'" class="space-y-6">
          <!-- Article Meta Information -->
          <BaseCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">文章資訊</h3>
              <div class="space-y-4">
                <!-- Title -->
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700">
                    文章標題 <span class="text-red-500">*</span>
                  </label>
                  <BaseInput
                    id="title"
                    v-model="formData.title"
                    type="text"
                    placeholder="輸入吸引人的文章標題..."
                    required
                    class="mt-1"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    目前字數: {{ formData.title.length }} / 100
                  </p>
                </div>

                <!-- Slug -->
                <div>
                  <label for="slug" class="block text-sm font-medium text-gray-700">
                    文章網址 (Slug)
                  </label>
                  <div class="mt-1 flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      /blog/
                    </span>
                    <BaseInput
                      id="slug"
                      v-model="formData.slug"
                      type="text"
                      placeholder="article-url-slug"
                      class="rounded-l-none"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    留空將自動從標題生成
                  </p>
                </div>

                <!-- Excerpt -->
                <div>
                  <label for="excerpt" class="block text-sm font-medium text-gray-700">
                    摘要說明
                  </label>
                  <BaseTextarea
                    id="excerpt"
                    v-model="formData.excerpt"
                    :rows="3"
                    placeholder="簡短描述文章內容，用於搜尋預覽和分享..."
                    class="mt-1"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    目前字數: {{ formData.excerpt?.length || 0 }} / 200
                  </p>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Content Editor -->
          <BaseCard>
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">文章內容</h3>
                <div class="flex space-x-2">
                  <!-- Editor Mode Toggle -->
                  <div class="flex bg-gray-100 rounded-lg p-1">
                    <button
                      @click="editorMode = 'markdown'"
                      :class="[
                        'px-3 py-1 text-sm font-medium rounded transition-colors',
                        editorMode === 'markdown'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      <DocumentTextIcon class="w-4 h-4 mr-1 inline" />
                      Markdown
                    </button>
                    <button
                      @click="editorMode = 'wysiwyg'"
                      :class="[
                        'px-3 py-1 text-sm font-medium rounded transition-colors',
                        editorMode === 'wysiwyg'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      <PencilIcon class="w-4 h-4 mr-1 inline" />
                      富文本
                    </button>
                  </div>
                </div>
              </div>

              <!-- Markdown Editor -->
              <div v-if="editorMode === 'markdown'" class="space-y-4">
                <!-- Markdown Toolbar -->
                <div class="flex flex-wrap items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <button
                    @click="insertMarkdown('**', true)"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="粗體"
                  >
                    <strong class="text-sm">B</strong>
                  </button>
                  <button
                    @click="insertMarkdown('*', true)"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="斜體"
                  >
                    <em class="text-sm">I</em>
                  </button>
                  <button
                    @click="insertMarkdown('[文字](網址)', false)"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="連結"
                  >
                    🔗
                  </button>
                  <button
                    @click="insertMarkdown('- ', false)"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="列表"
                  >
                    •
                  </button>
                  <button
                    @click="insertMarkdown('```\n', true)"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="程式碼"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                <!-- Markdown Textarea -->
                <BaseTextarea
                  v-model="formData.content"
                  :rows="20"
                  placeholder="# 文章標題

在這裡使用 Markdown 語法撰寫您的文章內容...

## 小標題

- 項目一
- 項目二

**粗體文字** 和 *斜體文字*

[連結](https://example.com)

```code
程式碼區塊
```"
                  class="font-mono text-sm"
                  @keydown="handleKeyDown"
                  ref="contentEditor"
                />
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>字數: {{ wordCount }} 字</span>
                  <span>預計閱讀時間: {{ readingTime }} 分鐘</span>
                </div>
              </div>

              <!-- WYSIWYG Editor (Placeholder) -->
              <div v-else class="space-y-4">
                <div class="border border-gray-300 rounded-lg min-h-96 p-4 bg-gray-50">
                  <div class="text-center py-12">
                    <PencilIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">富文本編輯器</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      正在開發中，請使用 Markdown 模式
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Featured Image -->
          <BaseCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">特色圖片</h3>
              <div class="space-y-4">
                <div v-if="formData.featuredImage" class="relative">
                  <img
                    :src="formData.featuredImage"
                    alt="特色圖片"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    @click="formData.featuredImage = ''"
                    class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-else
                  class="border-2 border-gray-300 border-dashed rounded-lg p-6"
                >
                  <div class="text-center">
                    <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <div class="mt-4">
                      <label for="featured-image" class="cursor-pointer">
                        <span class="mt-2 block text-sm font-medium text-gray-900">
                          上傳特色圖片
                        </span>
                        <input
                          id="featured-image"
                          type="file"
                          accept="image/*"
                          class="sr-only"
                          @change="handleImageUpload"
                        />
                      </label>
                      <p class="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF 最大 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Preview Column -->
        <div v-if="showPreview" class="lg:col-span-6">
          <BaseCard class="sticky top-6">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <EyeIcon class="w-5 h-5 mr-2" />
                即時預覽
              </h3>
              <div class="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <!-- Preview Content -->
                <article class="prose prose-sm max-w-none">
                  <h1>{{ formData.title || '文章標題' }}</h1>
                  <p class="text-gray-600 italic" v-if="formData.excerpt">
                    {{ formData.excerpt }}
                  </p>
                  <div v-html="previewContent"></div>
                </article>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Sidebar Settings -->
        <div :class="showPreview ? 'lg:col-span-12 lg:order-first' : 'lg:col-span-3'" class="space-y-6">
          <!-- Publish Settings -->
          <BaseCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">發布設定</h3>
              <div class="space-y-4">
                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    狀態
                  </label>
                  <BaseSelect
                    v-model="formData.status"
                    :options="statusOptions"
                    placeholder="選擇狀態"
                  />
                </div>

                <!-- Visibility -->
                <div>
                  <div class="flex items-center">
                    <input
                      id="isPublic"
                      v-model="formData.isPublic"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="isPublic" class="ml-2 text-sm font-medium text-gray-700">
                      公開文章
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    取消勾選則只有登入後才能查看
                  </p>
                </div>

                <!-- Publish Date -->
                <div v-if="formData.status === 'scheduled'">
                  <label for="publishedAt" class="block text-sm font-medium text-gray-700">
                    排程發布時間
                  </label>
                  <BaseInput
                    id="publishedAt"
                    v-model="formData.publishedAt"
                    type="datetime-local"
                    class="mt-1"
                  />
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Categories & Tags -->
          <BaseCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">分類與標籤</h3>
              <div class="space-y-4">
                <!-- Category -->
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700">
                    分類
                  </label>
                  <div class="mt-1 flex space-x-2">
                    <BaseInput
                      id="category"
                      v-model="formData.category"
                      type="text"
                      placeholder="選擇或輸入分類"
                      class="flex-1"
                      list="categories"
                    />
                    <datalist id="categories">
                      <option v-for="category in availableCategories" :key="category" :value="category">
                        {{ category }}
                      </option>
                    </datalist>
                    <BaseButton
                      type="button"
                      variant="outline"
                      size="small"
                      @click="showCategoryModal = true"
                      title="管理分類"
                    >
                      <TagIcon class="w-4 h-4" />
                    </BaseButton>
                  </div>
                </div>

                <!-- Tags -->
                <div>
                  <label for="tags" class="block text-sm font-medium text-gray-700">
                    標籤
                  </label>
                  <BaseInput
                    id="tags"
                    v-model="formData.tags"
                    type="text"
                    placeholder="用逗號分隔多個標籤"
                    class="mt-1"
                  />
                  <div v-if="tagsList.length > 0" class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="tag in tagsList"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- SEO Settings -->
          <BaseCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">SEO 設定</h3>
              <div class="space-y-4">
                <!-- Meta Description -->
                <div>
                  <label for="metaDescription" class="block text-sm font-medium text-gray-700">
                    Meta 描述
                  </label>
                  <BaseTextarea
                    id="metaDescription"
                    v-model="formData.metaDescription"
                    :rows="3"
                    placeholder="搜尋引擎結果頁面顯示的描述文字..."
                    class="mt-1"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    建議 150-160 字 (目前: {{ formData.metaDescription?.length || 0 }} 字)
                  </p>
                </div>

                <!-- Meta Keywords -->
                <div>
                  <label for="metaKeywords" class="block text-sm font-medium text-gray-700">
                    關鍵字
                  </label>
                  <BaseInput
                    id="metaKeywords"
                    v-model="formData.metaKeywords"
                    type="text"
                    placeholder="關鍵字1, 關鍵字2, 關鍵字3"
                    class="mt-1"
                  />
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Article Stats (for existing posts) -->
          <BaseCard v-if="post">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">文章統計</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">觀看次數</span>
                  <span class="font-medium">{{ post.views || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">建立時間</span>
                  <span class="text-sm">{{ formatDate(post.createdAt) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">更新時間</span>
                  <span class="text-sm">{{ formatDate(post.updatedAt) }}</span>
                </div>
                <div v-if="post.publishedAt" class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">發布時間</span>
                  <span class="text-sm">{{ formatDate(post.publishedAt) }}</span>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Publish Confirmation Modal -->
    <BaseModal
      :show="showPublishModal"
      @close="showPublishModal = false"
      title="發布文章"
      max-width="md"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          您即將發布文章「{{ formData.title }}」，請確認以下設定：
        </p>
        
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">狀態:</span>
            <span class="text-sm font-medium">{{ getStatusLabel(formData.status) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">可見性:</span>
            <span class="text-sm font-medium">{{ formData.isPublic ? '公開' : '需登入' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">分類:</span>
            <span class="text-sm font-medium">{{ formData.category || '無分類' }}</span>
          </div>
          <div v-if="formData.status === 'scheduled'" class="flex justify-between">
            <span class="text-sm text-gray-600">發布時間:</span>
            <span class="text-sm font-medium">{{ formatDate(formData.publishedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="showPublishModal = false"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="publishPost"
        >
          確認發布
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Category Management Modal -->
    <BaseModal
      :show="showCategoryModal"
      @close="showCategoryModal = false"
      title="管理分類"
      max-width="2xl"
    >
      <!-- Category management would go here -->
      <div class="text-center py-8">
        <TagIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">分類管理</h3>
        <p class="mt-1 text-sm text-gray-500">
          此功能將在後續版本中實現
        </p>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  EyeIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PencilIcon,
  PhotoIcon,
  XMarkIcon,
  TagIcon
} from '@heroicons/vue/24/outline'
import { useBlogStore } from '@/stores/blog'
import type { BlogPost } from '@/types/api'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const blogStore = useBlogStore()

// State
const post = ref<BlogPost | null>(null)
const showPreview = ref(false)
const showPublishModal = ref(false)
const showCategoryModal = ref(false)
const editorMode = ref<'markdown' | 'wysiwyg'>('markdown')
const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const contentEditor = ref()

const formData = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  category: '',
  tags: '',
  status: 'draft',
  isPublic: true,
  publishedAt: '',
  metaDescription: '',
  metaKeywords: '',
  author: '系統管理員'
})

// Constants
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已發布' },
  { value: 'scheduled', label: '排程發布' },
  { value: 'archived', label: '已封存' }
]

const availableCategories = [
  '技術', '生活', '旅遊', '美食', '閱讀', '攝影', '音樂', '電影', '健康', '學習'
]

// Auto-save timer
let autoSaveTimer: NodeJS.Timeout | null = null

// Computed
const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0 && 
         formData.value.content.trim().length > 0
})

const wordCount = computed(() => {
  return formData.value.content.replace(/\s+/g, '').length
})

const readingTime = computed(() => {
  const wordsPerMinute = 200
  const words = wordCount.value
  return Math.ceil(words / wordsPerMinute) || 1
})

const tagsList = computed(() => {
  if (!formData.value.tags) return []
  return formData.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
})

const previewContent = computed(() => {
  // Simple markdown to HTML conversion (in a real app, use a proper markdown parser)
  let html = formData.value.content
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold and italic
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
  
  // Line breaks
  html = html.replace(/\n/gim, '<br>')
  
  return html
})

// Methods
function loadPost() {
  const postId = route.params.id
  if (postId && postId !== 'new') {
    const existingPost = blogStore.blogPosts.find(p => p.id === Number(postId))
    if (existingPost) {
      post.value = existingPost
      formData.value = {
        title: existingPost.title,
        slug: existingPost.slug || '',
        content: existingPost.content || '',
        excerpt: existingPost.excerpt || '',
        featuredImage: existingPost.featuredImage || '',
        category: existingPost.category || '',
        tags: existingPost.tags || '',
        status: existingPost.status,
        isPublic: existingPost.isPublic ?? true,
        publishedAt: existingPost.publishedAt ? new Date(existingPost.publishedAt).toISOString().slice(0, 16) : '',
        metaDescription: existingPost.metaDescription || '',
        metaKeywords: existingPost.metaKeywords || '',
        author: existingPost.author || '系統管理員'
      }
    }
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

function insertMarkdown(syntax: string, wrap: boolean) {
  const textarea = contentEditor.value?.$el?.querySelector('textarea') || contentEditor.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.value.content.substring(start, end)

  let newText = ''
  if (wrap && selectedText) {
    newText = syntax + selectedText + syntax
  } else if (syntax.includes('\n')) {
    newText = syntax + (selectedText || '內容') + '\n```'
  } else {
    newText = syntax + (selectedText || '')
  }

  formData.value.content = 
    formData.value.content.substring(0, start) +
    newText +
    formData.value.content.substring(end)

  // Focus and set cursor position
  setTimeout(() => {
    textarea.focus()
    const newPosition = start + newText.length
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)
}

function handleKeyDown(event: KeyboardEvent) {
  // Handle tab key for indentation
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = event.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    formData.value.content = 
      formData.value.content.substring(0, start) +
      '  ' +
      formData.value.content.substring(end)
    
    setTimeout(() => {
      textarea.setSelectionRange(start + 2, start + 2)
    }, 0)
  }
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // In a real app, upload to server and get URL
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.featuredImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function startAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  autoSaveTimer = setTimeout(() => {
    if (isFormValid.value) {
      saveDraft(true)
    }
  }, 30000) // Auto-save every 30 seconds
}

async function saveDraft(isAutoSave = false) {
  if (!isFormValid.value) return

  try {
    autoSaveStatus.value = 'saving'
    
    const postData = {
      ...formData.value,
      slug: formData.value.slug || generateSlug(formData.value.title),
      status: 'draft'
    }

    if (post.value) {
      await blogStore.updateBlogPost(post.value.id, postData)
    } else {
      const newPost = await blogStore.createBlogPost(postData)
      post.value = newPost
      // Update URL to include the new post ID
      router.replace(`/admin/blog/editor/${newPost.id}`)
    }
    
    autoSaveStatus.value = 'saved'
    
    if (!isAutoSave) {
      // Show success message for manual saves
      setTimeout(() => {
        autoSaveStatus.value = 'idle'
      }, 2000)
    }
    
  } catch (error) {
    autoSaveStatus.value = 'error'
    console.error('Save error:', error)
  }
}

async function publishPost() {
  if (!isFormValid.value) return

  try {
    const postData = {
      ...formData.value,
      slug: formData.value.slug || generateSlug(formData.value.title),
      publishedAt: formData.value.status === 'published' ? new Date().toISOString() : formData.value.publishedAt
    }

    if (post.value) {
      await blogStore.updateBlogPost(post.value.id, postData)
    } else {
      const newPost = await blogStore.createBlogPost(postData)
      post.value = newPost
    }
    
    showPublishModal.value = false
    router.push('/admin/blog')
    
  } catch (error) {
    console.error('Publish error:', error)
  }
}

function getStatusLabel(status: string): string {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || status
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch(() => formData.value.title, (newTitle) => {
  if (!formData.value.slug && newTitle) {
    formData.value.slug = generateSlug(newTitle)
  }
})

watch(formData, () => {
  startAutoSave()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadPost()
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>
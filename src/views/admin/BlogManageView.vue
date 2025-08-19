<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">文章管理</h2>
          <p class="mt-1 text-sm text-gray-600">
            管理部落格文章、分類和發布狀態
          </p>
        </div>
        <div class="flex space-x-3">
          <BaseButton
            variant="outline"
            @click="showCategoryModal = true"
          >
            <TagIcon class="w-4 h-4 mr-2" />
            管理分類
          </BaseButton>
          <BaseButton
            variant="outline"
            @click="showBatchModal = true"
            :disabled="selectedPosts.length === 0"
          >
            <Squares2X2Icon class="w-4 h-4 mr-2" />
            批量操作 ({{ selectedPosts.length }})
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="createNewPost"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            撰寫文章
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <DocumentTextIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">總文章數</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ totalPosts }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100">
            <EyeIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">已發布</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ publishedPosts }}</p>
            <p class="text-xs text-gray-500">{{ publishedRate.toFixed(1) }}%</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100">
            <DocumentIcon class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">草稿</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ draftPosts }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100">
            <HeartIcon class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">總觀看數</h3>
            <p class="text-2xl font-semibold text-gray-900">{{ totalViews.toLocaleString() }}</p>
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
              placeholder="搜尋文章標題、內容..."
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="flex gap-2">
            <select
              v-model="selectedStatus"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有狀態</option>
              <option value="draft">草稿</option>
              <option value="published">已發布</option>
              <option value="scheduled">排程發布</option>
              <option value="archived">已封存</option>
            </select>

            <select
              v-model="selectedCategory"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有分類</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <select
              v-model="selectedAuthor"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有作者</option>
              <option v-for="author in authors" :key="author" :value="author">
                {{ author }}
              </option>
            </select>
          </div>
        </div>

        <!-- View and Sort Options -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-700">排序:</label>
            <select
              v-model="sortBy"
              class="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">建立時間</option>
              <option value="updatedAt">更新時間</option>
              <option value="publishedAt">發布時間</option>
              <option value="title">標題</option>
              <option value="views">觀看數</option>
            </select>
          </div>

          <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              @click="viewMode = 'table'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <TableCellsIcon class="w-4 h-4" />
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

    <!-- Posts Content -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Table View -->
      <div v-if="viewMode === 'table'">
        <BlogTableView
          :posts="filteredAndSortedPosts"
          :loading="loading"
          :selectedPosts="selectedPosts"
          @toggle-select="togglePostSelection"
          @edit-post="editPost"
          @delete-post="deletePost"
          @duplicate-post="duplicatePost"
          @toggle-publish="togglePublish"
          @preview-post="previewPost"
        />
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'">
        <BlogGridView
          :posts="filteredAndSortedPosts"
          :loading="loading"
          :selectedPosts="selectedPosts"
          @toggle-select="togglePostSelection"
          @edit-post="editPost"
          @delete-post="deletePost"
          @duplicate-post="duplicatePost"
          @toggle-publish="togglePublish"
          @preview-post="previewPost"
        />
      </div>
    </div>

    <!-- Category Management Modal -->
    <BaseModal
      :show="showCategoryModal"
      @close="showCategoryModal = false"
      title="管理文章分類"
      max-width="2xl"
    >
      <CategoryManagement
        :categories="categoriesWithStats"
        @save="handleCategorySave"
        @delete="handleCategoryDelete"
      />
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
          已選擇 {{ selectedPosts.length }} 篇文章
        </p>
        
        <div class="space-y-3">
          <BaseButton
            variant="outline"
            @click="batchUpdateStatus('published')"
            class="w-full justify-start"
          >
            <EyeIcon class="w-4 h-4 mr-2" />
            批量發布
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="batchUpdateStatus('draft')"
            class="w-full justify-start"
          >
            <DocumentIcon class="w-4 h-4 mr-2" />
            轉為草稿
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="batchUpdateCategory"
            class="w-full justify-start"
          >
            <TagIcon class="w-4 h-4 mr-2" />
            更改分類
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="batchExport"
            class="w-full justify-start"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            匯出選中文章
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="batchDelete"
            class="w-full justify-start text-red-600 hover:text-red-700"
          >
            <TrashIcon class="w-4 h-4 mr-2" />
            刪除選中文章
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      title="確認刪除"
    >
      <div class="mt-2">
        <p class="text-sm text-gray-500">
          您確定要刪除這{{ deleteType === 'single' ? '篇' : `${selectedPosts.length}篇` }}文章嗎？此操作無法復原。
        </p>
      </div>
      <div class="mt-5 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="showDeleteModal = false"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="danger"
          @click="confirmDelete"
        >
          刪除
        </BaseButton>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  DocumentIcon,
  HeartIcon,
  TagIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import { useBlogStore } from '@/stores/blog'
import type { BlogPost } from '@/types/api'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BlogTableView from '@/components/blog/BlogTableView.vue'
import BlogGridView from '@/components/blog/BlogGridView.vue'
import CategoryManagement from '@/components/blog/CategoryManagement.vue'

// Router
const router = useRouter()

// Stores
const blogStore = useBlogStore()

// State
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedAuthor = ref('')
const sortBy = ref<'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'views'>('updatedAt')
const viewMode = ref<'table' | 'grid'>('table')
const loading = ref(false)
const showCategoryModal = ref(false)
const showBatchModal = ref(false)
const showDeleteModal = ref(false)
const selectedPosts = ref<number[]>([])
const deletingId = ref<number | null>(null)
const deleteType = ref<'single' | 'batch'>('single')

// Computed
const posts = computed(() => blogStore.blogPosts)

const totalPosts = computed(() => posts.value.length)

const publishedPosts = computed(() => {
  return posts.value.filter(post => post.status === 'published').length
})

const publishedRate = computed(() => {
  return totalPosts.value > 0 ? (publishedPosts.value / totalPosts.value) * 100 : 0
})

const draftPosts = computed(() => {
  return posts.value.filter(post => post.status === 'draft').length
})

const totalViews = computed(() => {
  return posts.value.reduce((sum, post) => sum + (post.views || 0), 0)
})

const categories = computed(() => {
  const categorySet = new Set(posts.value.map(post => post.category).filter(Boolean))
  return Array.from(categorySet).sort()
})

const authors = computed(() => {
  const authorSet = new Set(posts.value.map(post => post.author).filter(Boolean))
  return Array.from(authorSet).sort()
})

const categoriesWithStats = computed(() => {
  return categories.value.map(category => ({
    name: category,
    count: posts.value.filter(post => post.category === category).length,
    publishedCount: posts.value.filter(post => post.category === category && post.status === 'published').length
  }))
})

const filteredAndSortedPosts = computed(() => {
  let filtered = posts.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.tags?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(post => post.status === selectedStatus.value)
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }

  // Author filter
  if (selectedAuthor.value) {
    filtered = filtered.filter(post => post.author === selectedAuthor.value)
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      case 'updatedAt':
        return new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime()
      case 'publishedAt':
        if (!a.publishedAt) return 1
        if (!b.publishedAt) return -1
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'views':
        return (b.views || 0) - (a.views || 0)
      default:
        return 0
    }
  })
})

// Methods
function togglePostSelection(postId: number) {
  const index = selectedPosts.value.indexOf(postId)
  if (index > -1) {
    selectedPosts.value.splice(index, 1)
  } else {
    selectedPosts.value.push(postId)
  }
}

function createNewPost() {
  router.push('/admin/blog/editor')
}

function editPost(post: BlogPost) {
  router.push(`/admin/blog/editor/${post.id}`)
}

function deletePost(id: number) {
  deletingId.value = id
  deleteType.value = 'single'
  showDeleteModal.value = true
}

function duplicatePost(post: BlogPost) {
  const duplicated = {
    ...post,
    id: undefined,
    title: `${post.title} (複製)`,
    status: 'draft' as const,
    publishedAt: undefined,
    createdAt: undefined,
    updatedAt: undefined
  }
  
  // This would typically create a new post and then redirect to editor
  blogStore.createBlogPost(duplicated).then((newPost) => {
    router.push(`/admin/blog/editor/${newPost.id}`)
  })
}

async function togglePublish(post: BlogPost) {
  const newStatus = post.status === 'published' ? 'draft' : 'published'
  await blogStore.updateBlogPost(post.id, {
    status: newStatus,
    publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined
  })
}

function previewPost(post: BlogPost) {
  // Open preview in new tab
  const previewUrl = `/blog/${post.slug || post.id}`
  window.open(previewUrl, '_blank')
}

async function batchUpdateStatus(status: string) {
  try {
    await Promise.all(
      selectedPosts.value.map(postId =>
        blogStore.updateBlogPost(postId, {
          status,
          publishedAt: status === 'published' ? new Date().toISOString() : undefined
        })
      )
    )
    selectedPosts.value = []
    showBatchModal.value = false
  } catch (error) {
    console.error('Batch status update error:', error)
  }
}

function batchUpdateCategory() {
  // This could open another modal for category selection
  console.log('Batch update category for posts:', selectedPosts.value)
}

function batchExport() {
  // This would implement export functionality
  console.log('Export posts:', selectedPosts.value)
  
  // Generate CSV or JSON export
  const selectedPostData = posts.value.filter(post => selectedPosts.value.includes(post.id))
  const exportData = selectedPostData.map(post => ({
    title: post.title,
    content: post.content,
    category: post.category,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt,
    views: post.views
  }))
  
  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `blog-posts-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showBatchModal.value = false
}

function batchDelete() {
  if (selectedPosts.value.length === 0) return
  
  deleteType.value = 'batch'
  showBatchModal.value = false
  showDeleteModal.value = true
}

async function confirmDelete() {
  try {
    if (deleteType.value === 'single' && deletingId.value) {
      await blogStore.deleteBlogPost(deletingId.value)
      deletingId.value = null
    } else if (deleteType.value === 'batch') {
      await Promise.all(
        selectedPosts.value.map(postId => blogStore.deleteBlogPost(postId))
      )
      selectedPosts.value = []
    }
    showDeleteModal.value = false
  } catch (error) {
    console.error('Delete error:', error)
  }
}

function handleCategorySave(categoryData: any) {
  // Handle category save logic
  console.log('Save category:', categoryData)
}

function handleCategoryDelete(categoryName: string) {
  // Handle category delete logic
  console.log('Delete category:', categoryName)
}

// Lifecycle
onMounted(async () => {
  await blogStore.fetchBlogPosts()
})
</script>
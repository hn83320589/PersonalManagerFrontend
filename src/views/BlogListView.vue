<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Blog
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Thoughts, insights, and stories from my journey in technology and life.
          </p>
        </div>
      </div>
    </section>

    <!-- Search and Filters -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <!-- Search -->
          <div class="flex-1">
            <BaseInput
              v-model="searchTerm"
              type="search"
              placeholder="Search articles..."
              class="w-full"
            />
          </div>

          <!-- Category Filter -->
          <div class="md:w-48">
            <BaseSelect
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="All Categories"
              class="w-full"
            />
          </div>

          <!-- Sort Options -->
          <div class="md:w-48">
            <BaseSelect
              v-model="sortBy"
              :options="sortOptions"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Blog Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Featured Posts -->
          <section v-if="featuredPosts.length > 0 && !searchTerm && !selectedCategory" class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article
                v-for="post in featuredPosts.slice(0, 2)"
                :key="post.id"
                class="group cursor-pointer"
                @click="goToPost(post)"
              >
                <BaseCard hoverable clickable class="h-full">
                  <div class="space-y-4">
                    <div v-if="false" class="aspect-w-16 aspect-h-9">
                      <img
                        src=""
                        :alt="post.title"
                        class="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        <span v-if="post.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {{ post.category }}
                        </span>
                        <span class="text-sm text-gray-500">
                          {{ formatDate(post.publishedAt || post.createdAt) }}
                        </span>
                      </div>
                      
                      <h3 class="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {{ post.title }}
                      </h3>
                      
                      <p class="text-gray-600 line-clamp-3">
                        {{ post.summary || extractSummary(post.content) }}
                      </p>
                      
                      <div class="flex items-center justify-between text-sm text-gray-500">
                        <span>{{ post.viewCount }} views</span>
                        <span class="flex items-center space-x-1">
                          <ClockIcon class="w-4 h-4" />
                          <span>{{ estimateReadTime(post.content) }} min read</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </article>
            </div>
          </section>

          <!-- Regular Posts -->
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ searchTerm || selectedCategory ? 'Search Results' : 'Latest Posts' }}
                <span v-if="filteredPosts.length > 0" class="text-gray-500 font-normal">
                  ({{ filteredPosts.length }})
                </span>
              </h2>
            </div>

            <!-- No Results -->
            <div v-if="filteredPosts.length === 0" class="text-center py-16">
              <DocumentTextIcon class="mx-auto h-16 w-16 text-gray-400" />
              <h3 class="mt-4 text-lg font-medium text-gray-900">
                {{ searchTerm || selectedCategory ? 'No posts found' : 'No posts available' }}
              </h3>
              <p class="mt-2 text-gray-500">
                {{ searchTerm || selectedCategory 
                  ? 'Try adjusting your search criteria or browse all posts.' 
                  : 'Check back later for new content.' 
                }}
              </p>
              <div v-if="searchTerm || selectedCategory" class="mt-4">
                <BaseButton variant="outline" @click="clearFilters">
                  Clear Filters
                </BaseButton>
              </div>
            </div>

            <!-- Posts Grid -->
            <div v-else class="space-y-6">
              <article
                v-for="post in paginatedPosts"
                :key="post.id"
                class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                @click="goToPost(post)"
              >
                <div class="p-6">
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <!-- Image -->
                    <div v-if="false" class="md:w-48 mb-4 md:mb-0 flex-shrink-0">
                      <img
                        src=""
                        :alt="post.title"
                        class="w-full h-32 md:h-24 object-cover rounded-md"
                      />
                    </div>

                    <!-- Content -->
                    <div class="flex-1">
                      <div class="space-y-3">
                        <!-- Meta Info -->
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                          <span v-if="post.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {{ post.category }}
                          </span>
                          <span>{{ post.viewCount }} views</span>
                          <span class="flex items-center space-x-1">
                            <ClockIcon class="w-4 h-4" />
                            <span>{{ estimateReadTime(post.content) }} min</span>
                          </span>
                        </div>

                        <!-- Title -->
                        <h3 class="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                          {{ post.title }}
                        </h3>

                        <!-- Summary -->
                        <p class="text-gray-600 line-clamp-2">
                          {{ post.summary || extractSummary(post.content) }}
                        </p>

                        <!-- Tags -->
                        <div v-if="post.tags" class="flex flex-wrap gap-2">
                          <span
                            v-for="tag in parseTagsFromString(post.tags)"
                            :key="tag"
                            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                            @click.stop="searchByTag(tag)"
                          >
                            #{{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-12 flex justify-center">
              <nav class="flex items-center space-x-2">
                <BaseButton
                  variant="outline"
                  size="small"
                  :disabled="currentPage === 1"
                  @click="currentPage = currentPage - 1"
                >
                  Previous
                </BaseButton>
                
                <span
                  v-for="page in visiblePages"
                  :key="page"
                  class="px-3 py-2"
                >
                  <BaseButton
                    v-if="page !== '...'"
                    :variant="page === currentPage ? 'primary' : 'outline'"
                    size="small"
                    @click="currentPage = page as number"
                  >
                    {{ page }}
                  </BaseButton>
                  <span v-else class="text-gray-500">...</span>
                </span>
                
                <BaseButton
                  variant="outline"
                  size="small"
                  :disabled="currentPage === totalPages"
                  @click="currentPage = currentPage + 1"
                >
                  Next
                </BaseButton>
              </nav>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Popular Posts -->
          <BaseCard v-if="popularPosts.length > 0" title="Popular Posts">
            <div class="space-y-4">
              <article
                v-for="post in popularPosts.slice(0, 5)"
                :key="post.id"
                class="cursor-pointer group"
                @click="goToPost(post)"
              >
                <h4 class="font-medium text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                  {{ post.title }}
                </h4>
                <div class="text-xs text-gray-500">
                  {{ post.viewCount }} views
                </div>
              </article>
            </div>
          </BaseCard>

          <!-- Categories -->
          <BaseCard v-if="categories.length > 0" title="Categories">
            <div class="space-y-2">
              <button
                v-for="category in categories"
                :key="category.name"
                :class="[
                  'flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors',
                  selectedCategory === category.name ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                ]"
                @click="selectedCategory = selectedCategory === category.name ? '' : category.name"
              >
                <span class="text-sm">{{ category.name }}</span>
                <span class="text-xs text-gray-500">{{ category.count }}</span>
              </button>
            </div>
          </BaseCard>

          <!-- Tags -->
          <BaseCard v-if="popularTags.length > 0" title="Popular Tags">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in popularTags"
                :key="tag.tag"
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                @click="searchByTag(tag.tag)"
              >
                #{{ tag.tag }}
                <span class="ml-1 text-gray-500">({{ tag.count }})</span>
              </button>
            </div>
          </BaseCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ClockIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { useBlogStore } from '@/stores/blog'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { BlogPost } from '@/types/api'

// Router
const router = useRouter()

// Stores
const blogStore = useBlogStore()

// State
const isLoading = ref(true)
const searchTerm = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const postsPerPage = 6

// Computed
const posts = computed(() => blogStore.publicPosts)
const featuredPosts = computed(() => posts.value.filter(post => post.slug?.includes('featured')).slice(0, 3))
const popularPosts = computed(() => blogStore.popularPosts)

const categories = computed(() => {
  const categoryMap = new Map<string, number>()
  posts.value.forEach(post => {
    if (post.category) {
      categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1)
    }
  })
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const popularTags = computed(() => {
  const tagMap = new Map<string, number>()
  posts.value.forEach(post => {
    if (post.tags) {
      const tags = parseTagsFromString(post.tags)
      tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    }
  })
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
})

const categoryOptions = computed(() => [
  { label: 'All Categories', value: '' },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.name }))
])

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Alphabetical', value: 'alphabetical' }
]

const filteredPosts = computed(() => {
  let filtered = [...posts.value]

  // Apply search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      (post.summary && post.summary.toLowerCase().includes(term)) ||
      (post.tags && post.tags.toLowerCase().includes(term))
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime())
      break
    case 'popular':
      filtered.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'alphabetical':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function extractSummary(content: string): string {
  // Remove HTML tags and get first 150 characters
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > 150 
    ? textContent.substring(0, 150) + '...'
    : textContent
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

function parseTagsFromString(tags: string): string[] {
  return tags.split(',').map(tag => tag.trim()).filter(Boolean)
}

function goToPost(post: BlogPost) {
  if (post.slug) {
    router.push(`/blog/${post.slug}`)
  } else {
    router.push(`/blog/${post.id}`)
  }
}

function searchByTag(tag: string) {
  searchTerm.value = `#${tag}`
  currentPage.value = 1
}

function clearFilters() {
  searchTerm.value = ''
  selectedCategory.value = ''
  sortBy.value = 'newest'
  currentPage.value = 1
}

// Watch for filter changes
watch([searchTerm, selectedCategory, sortBy], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  try {
    await blogStore.fetchPublicPosts()
  } catch (error) {
    console.error('Failed to load blog posts:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.aspect-w-16 > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
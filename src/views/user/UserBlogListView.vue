<template>
  <div>
    <!-- Search & Filter -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="搜尋文章..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#0ea5e9)] focus:border-[var(--color-primary,#0ea5e9)]"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#0ea5e9)] focus:border-[var(--color-primary,#0ea5e9)]"
        >
          <option value="">所有分類</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="isLoading" size="medium" text="載入中..." />

    <template v-else-if="allPosts.length > 0">
      <!-- Posts List -->
      <div v-if="paginatedPosts.length > 0" class="space-y-4">
        <RouterLink
          v-for="post in paginatedPosts"
          :key="post.id"
          :to="`/@${username}/blog/${post.slug}`"
          class="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 group"
        >
          <div class="p-5">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    v-if="post.category"
                    class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :style="{ backgroundColor: 'var(--color-primary-light,#e0f2fe)', color: 'var(--color-primary-dark,#0c4a6e)' }"
                  >{{ post.category }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                  <span v-if="post.viewCount" class="text-xs text-gray-400">{{ post.viewCount }} 次瀏覽</span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <ClockIcon class="h-3 w-3" />{{ estimateReadTime(post.content) }} 分鐘
                  </span>
                </div>
                <h2 class="text-base font-semibold text-gray-900 group-hover:text-[var(--color-primary,#0ea5e9)] transition-colors line-clamp-2">
                  {{ post.title }}
                </h2>
                <p v-if="post.summary" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ post.summary }}</p>
              </div>
            </div>
            <!-- Tags -->
            <div v-if="post.tags" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="tag in parseTags(post.tags).slice(0, 4)"
                :key="tag"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >#{{ tag }}</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- No search results -->
      <div v-else class="text-center py-12 text-gray-400">
        <p>找不到符合的文章</p>
        <button @click="clearFilters" class="mt-3 text-sm text-sky-600 hover:text-sky-800">清除篩選</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >上一頁</button>
        <span class="text-sm text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >下一頁</button>
      </div>
    </template>

    <div v-else-if="!isLoading" class="text-center text-gray-400 py-12">尚無文章</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { RouterLink } from 'vue-router'
import { ClockIcon } from '@heroicons/vue/24/outline'
import httpService from '@/services/http'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { BlogPost } from '@/types/api'

const userId = inject<ComputedRef<number | null>>('userId')
const username = inject<ComputedRef<string>>('username')

const isLoading = ref(true)
const allPosts = ref<BlogPost[]>([])
const searchTerm = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const perPage = 8

const categories = computed(() => {
  const cats = new Set<string>()
  allPosts.value.forEach(p => { if (p.category) cats.add(p.category) })
  return Array.from(cats).sort()
})

const filteredPosts = computed(() => {
  let list = allPosts.value
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.summary?.toLowerCase().includes(q)) ||
      (p.tags?.toLowerCase().includes(q))
    )
  }
  if (selectedCategory.value) {
    list = list.filter(p => p.category === selectedCategory.value)
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / perPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPosts.value.slice(start, start + perPage)
})

function parseTags(tags: string): string[] {
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))
}

function clearFilters() {
  searchTerm.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

watch([searchTerm, selectedCategory], () => { currentPage.value = 1 })

async function load(uid: number) {
  isLoading.value = true
  try {
    const res = await httpService.get<BlogPost[]>(`/blogposts/user/${uid}/public`)
    if (res.success) allPosts.value = res.data || []
  } catch {
    allPosts.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { if (userId?.value) load(userId.value) })
watch(() => userId?.value, (uid) => { if (uid) load(uid) })
</script>

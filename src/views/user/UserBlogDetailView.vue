<template>
  <div>
    <LoadingSpinner v-if="isLoading" size="medium" text="載入中..." />

    <article v-else-if="post" class="space-y-6">
      <div>
        <RouterLink :to="`/@${username}/blog`" class="text-sm text-sky-600 hover:text-sky-800">← 返回部落格</RouterLink>
      </div>

      <!-- Article Header -->
      <header class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div class="flex flex-wrap items-center gap-3 mb-3">
          <span
            v-if="post.category"
            class="text-xs font-medium px-2.5 py-1 rounded-full"
            :style="{ backgroundColor: 'var(--color-primary-light,#e0f2fe)', color: 'var(--color-primary-dark,#0c4a6e)' }"
          >{{ post.category }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">{{ post.title }}</h1>
        <p v-if="post.summary" class="text-gray-500 text-base leading-relaxed mb-4">{{ post.summary }}</p>
        <div class="flex flex-wrap gap-4 text-sm text-gray-400 pb-5 border-b border-gray-100">
          <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
          <span v-if="post.viewCount">{{ post.viewCount }} 次閱讀</span>
          <span class="flex items-center gap-1">
            <ClockIcon class="h-4 w-4" />{{ estimateReadTime(post.content) }} 分鐘閱讀
          </span>
        </div>
        <!-- Tags -->
        <div v-if="post.tags" class="flex flex-wrap gap-2 pt-4">
          <span
            v-for="tag in parseTags(post.tags)"
            :key="tag"
            class="text-xs px-3 py-1 rounded-full font-medium bg-sky-50 text-sky-600"
          >#{{ tag }}</span>
        </div>
      </header>

      <!-- Article Content -->
      <main class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div class="prose-content">{{ post.content }}</div>
      </main>

      <!-- Footer: share + update time -->
      <footer class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <span class="text-xs text-gray-400">最後更新：{{ formatDate(post.updatedAt) }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">分享：</span>
            <button
              @click="copyLink"
              :class="copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'"
              class="flex items-center gap-1 text-sm transition-colors"
              title="複製連結"
            >
              <LinkIcon class="h-4 w-4" />
              {{ copied ? '已複製！' : '複製連結' }}
            </button>
          </div>
        </div>
      </footer>
    </article>

    <div v-else-if="!isLoading" class="text-center text-gray-400 py-12">找不到此文章</div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ClockIcon, LinkIcon } from '@heroicons/vue/24/outline'
import httpService from '@/services/http'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { BlogPost } from '@/types/api'

const route = useRoute()
const username = inject<ComputedRef<string>>('username')

const isLoading = ref(true)
const post = ref<BlogPost | null>(null)
const copied = ref(false)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))
}

function parseTags(tags: string): string[] {
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* ignore */ }
}

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    const res = await httpService.get<BlogPost>(`/blogposts/slug/${encodeURIComponent(slug)}`)
    if (res.success) post.value = res.data
  } catch {
    // ignore
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.prose-content {
  color: #374151;
  line-height: 1.75;
  white-space: pre-wrap;
  font-size: 0.9375rem;
}
</style>

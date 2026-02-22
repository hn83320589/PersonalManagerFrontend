<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-red-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">找不到文章</h3>
        <p class="mt-2 text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <BaseButton @click="router.push('/blog')"> 返回部落格 </BaseButton>
        </div>
      </div>
    </div>

    <!-- Blog Post Content -->
    <article
      v-else-if="post"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Article Header -->
          <header class="bg-white rounded-lg shadow-md p-8 mb-8">
            <div class="space-y-4">
              <!-- Category & Date -->
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span
                  v-if="post.category"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {{ post.category }}
                </span>
                <time :datetime="post.publishedAt || post.createdAt">
                  {{ formatDate(post.publishedAt || post.createdAt) }}
                </time>
                <span>{{ post.viewCount }} 次瀏覽</span>
                <span class="flex items-center space-x-1">
                  <ClockIcon class="w-4 h-4" />
                  <span>{{ estimateReadTime(post.content) }} 分鐘閱讀</span>
                </span>
              </div>

              <!-- Title -->
              <h1 class="text-4xl font-bold text-gray-900 leading-tight">
                {{ post.title }}
              </h1>

              <!-- Summary -->
              <p
                v-if="post.summary"
                class="text-xl text-gray-600 leading-relaxed"
              >
                {{ post.summary }}
              </p>

              <!-- Featured Image placeholder -->

              <!-- Tags -->
              <div v-if="post.tags" class="flex flex-wrap gap-2 pt-4">
                <span
                  v-for="tag in parseTagsFromString(post.tags)"
                  :key="tag"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                  @click="searchByTag(tag)"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </header>

          <!-- Article Content -->
          <main class="bg-white rounded-lg shadow-md p-8 mb-8">
            <div class="prose prose-lg max-w-none">
              <div v-html="formattedContent"></div>
            </div>
          </main>

          <!-- Article Footer -->
          <footer class="bg-white rounded-lg shadow-md p-8 mb-8">
            <div class="border-t border-gray-200 pt-6">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  最後更新：{{ formatDate(post.updatedAt) }}
                </div>
                <div class="flex items-center space-x-4">
                  <!-- Share Buttons -->
                  <span class="text-sm font-medium text-gray-700">分享：</span>
                  <button
                    @click="shareOnTwitter"
                    class="text-blue-400 hover:text-blue-600 transition-colors"
                    title="分享到 Twitter"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="shareOnLinkedIn"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                    title="分享到 LinkedIn"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="copyToClipboard"
                    class="text-gray-500 hover:text-gray-700 transition-colors"
                    title="複製連結"
                  >
                    <LinkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </footer>

          <!-- Navigation -->
          <nav
            v-if="previousPost || nextPost"
            class="bg-white rounded-lg shadow-md p-8"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Previous Post -->
              <div v-if="previousPost">
                <span class="text-sm font-medium text-gray-500">上一篇</span>
                <BaseCard
                  hoverable
                  clickable
                  class="mt-2 cursor-pointer"
                  @click="goToPost(previousPost)"
                >
                  <div class="space-y-2">
                    <h3 class="font-semibold text-gray-900 line-clamp-2">
                      {{ previousPost.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{
                        previousPost.summary ||
                        extractSummary(previousPost.content)
                      }}
                    </p>
                  </div>
                </BaseCard>
              </div>

              <!-- Next Post -->
              <div v-if="nextPost" :class="{ 'md:text-right': !previousPost }">
                <span class="text-sm font-medium text-gray-500">下一篇</span>
                <BaseCard
                  hoverable
                  clickable
                  class="mt-2 cursor-pointer"
                  @click="goToPost(nextPost)"
                >
                  <div class="space-y-2">
                    <h3 class="font-semibold text-gray-900 line-clamp-2">
                      {{ nextPost.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ nextPost.summary || extractSummary(nextPost.content) }}
                    </p>
                  </div>
                </BaseCard>
              </div>
            </div>
          </nav>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Table of Contents -->
          <BaseCard v-if="tableOfContents.length > 0" title="目錄">
            <nav class="space-y-2">
              <a
                v-for="item in tableOfContents"
                :key="item.id"
                :href="`#${item.id}`"
                :class="[
                  'block text-sm hover:text-primary-600 transition-colors',
                  item.level === 1
                    ? 'font-medium text-gray-900'
                    : item.level === 2
                      ? 'ml-4 text-gray-700'
                      : 'ml-8 text-gray-600',
                ]"
              >
                {{ item.text }}
              </a>
            </nav>
          </BaseCard>

          <!-- Related Posts -->
          <BaseCard v-if="relatedPosts.length > 0" title="相關文章">
            <div class="space-y-4">
              <article
                v-for="relatedPost in relatedPosts"
                :key="relatedPost.id"
                class="cursor-pointer group"
                @click="goToPost(relatedPost)"
              >
                <div class="space-y-2">
                  <h4
                    class="font-medium text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2"
                  >
                    {{ relatedPost.title }}
                  </h4>
                  <div class="text-xs text-gray-500">
                    {{
                      formatDate(
                        relatedPost.publishedAt || relatedPost.createdAt,
                      )
                    }}
                  </div>
                </div>
              </article>
            </div>
          </BaseCard>

          <!-- Popular Posts -->
          <BaseCard v-if="popularPosts.length > 0" title="熱門文章">
            <div class="space-y-4">
              <article
                v-for="popularPost in popularPosts.slice(0, 5)"
                :key="popularPost.id"
                class="cursor-pointer group"
                @click="goToPost(popularPost)"
              >
                <div class="space-y-2">
                  <h4
                    class="font-medium text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2"
                  >
                    {{ popularPost.title }}
                  </h4>
                  <div class="text-xs text-gray-500">
                    {{ popularPost.viewCount }} 次瀏覽
                  </div>
                </div>
              </article>
            </div>
          </BaseCard>

          <!-- Back to Blog -->
          <BaseCard>
            <BaseButton
              variant="outline"
              class="w-full"
              @click="router.push('/blog')"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-2" />
              返回部落格
            </BaseButton>
          </BaseCard>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ClockIcon,
  LinkIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { useBlogStore } from "@/stores/blog";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import type { BlogPost } from "@/types/api";

// Router
const route = useRoute();
const router = useRouter();

// Stores
const blogStore = useBlogStore();

// State
const isLoading = ref(true);
const error = ref<string | null>(null);
const tableOfContents = ref<Array<{ id: string; text: string; level: number }>>(
  [],
);

// Computed
const post = computed(() => blogStore.currentPost);
const relatedPosts = computed(() => blogStore.recentPosts);
const popularPosts = computed(() => blogStore.popularPosts);
const previousPost = ref<BlogPost | null>(null);
const nextPost = ref<BlogPost | null>(null);

const formattedContent = computed(() => {
  if (!post.value?.content) return "";

  // Simple HTML formatting - in a real app, you'd use a proper markdown parser
  let content = post.value.content;

  // Convert line breaks to paragraphs
  content = content.replace(/\n\n/g, "</p><p>");
  content = `<p>${content}</p>`;

  // Add IDs to headings for table of contents
  content = content.replace(
    /<h([1-6])>(.*?)<\/h[1-6]>/g,
    (match, level, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return `<h${level} id="${id}">${text}</h${level}>`;
    },
  );

  return content;
});

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function extractSummary(content: string): string {
  // Remove HTML tags and get first 100 characters
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  return textContent.length > 100
    ? textContent.substring(0, 100) + "..."
    : textContent;
}

function parseTagsFromString(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function goToPost(targetPost: BlogPost) {
  if (targetPost.slug) {
    router.push(`/blog/${targetPost.slug}`);
  } else {
    router.push(`/blog/${targetPost.id}`);
  }
}

function searchByTag(tag: string) {
  router.push(`/blog?search=${encodeURIComponent("#" + tag)}`);
}

function shareOnTwitter() {
  const url = window.location.href;
  const text = `推薦這篇文章：${post.value?.title}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank", "width=600,height=400");
}

function shareOnLinkedIn() {
  const url = window.location.href;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, "_blank", "width=600,height=400");
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    // In a real app, you'd show a toast notification
    console.log("Link copied to clipboard");
  } catch (err) {
    console.error("Failed to copy link:", err);
  }
}

function generateTableOfContents() {
  if (!post.value?.content) return;

  const headings = formattedContent.value.match(
    /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g,
  );

  if (headings) {
    tableOfContents.value = headings
      .map((heading) => {
        const matches = heading.match(
          /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/,
        );
        if (matches) {
          return {
            level: parseInt(matches[1]),
            id: matches[2],
            text: matches[3].replace(/<[^>]*>/g, ""), // Remove any HTML tags from heading text
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ id: string; text: string; level: number }>;
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const identifier =
      (route.params.slug as string) || (route.params.id as string);

    if (!identifier) {
      error.value = "未提供文章識別碼";
      return;
    }

    // Fetch the blog post
    if (isNaN(Number(identifier))) {
      await blogStore.fetchPostBySlug(identifier);
    } else {
      await blogStore.fetchPostById(Number(identifier));
    }

    if (!post.value) {
      error.value = "找不到文章";
      return;
    }

    // Fetch related content
    await blogStore.fetchPublicPosts();

    // Generate table of contents after content is rendered
    await nextTick();
    generateTableOfContents();
  } catch (err) {
    console.error("Failed to load blog post:", err);
    error.value = "無法載入部落格文章，請稍後再試。";
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Prose styles for content */
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #111827;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h1 {
  font-size: 2.25rem;
}
.prose h2 {
  font-size: 1.875rem;
}
.prose h3 {
  font-size: 1.5rem;
}
.prose h4 {
  font-size: 1.25rem;
}
.prose h5 {
  font-size: 1.125rem;
}
.prose h6 {
  font-size: 1rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family:
    ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Cascadia Code",
    "Roboto Mono", Consolas, "Courier New", monospace;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose a {
  color: #0ea5e9;
  text-decoration: underline;
}

.prose a:hover {
  color: #0284c7;
}

.prose img {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
</style>

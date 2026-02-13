<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Guestbook
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Leave a message, share your thoughts, or just say hello! Your words are always welcome here.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Comment Form -->
        <div class="lg:col-span-2">
          <BaseCard title="Leave a Message" class="mb-8">
            <BaseForm @submit="handleSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="form.name"
                  label="Name *"
                  placeholder="Your name"
                  required
                />
                <BaseInput
                  v-model="form.email"
                  type="email"
                  label="Email *"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <BaseTextarea
                v-model="form.message"
                label="Message *"
                placeholder="Share your thoughts, feedback, or just say hello..."
                :rows="6"
                required
              />

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <input
                    id="subscribe"
                    v-model="form.subscribe"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label for="subscribe" class="text-sm text-gray-700">
                    Subscribe to new post notifications
                  </label>
                </div>

                <BaseButton
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="!isFormValid"
                >
                  Post Message
                </BaseButton>
              </div>
            </BaseForm>
          </BaseCard>

          <!-- Comments List -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">
                Messages ({{ approvedComments.length }})
              </h2>
              <BaseSelect
                v-model="sortBy"
                :options="sortOptions"
                class="w-48"
              />
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center py-12">
              <LoadingSpinner />
            </div>

            <!-- No Comments -->
            <div v-else-if="approvedComments.length === 0" class="text-center py-16">
              <ChatBubbleLeftEllipsisIcon class="mx-auto h-16 w-16 text-gray-400" />
              <h3 class="mt-4 text-lg font-medium text-gray-900">No messages yet</h3>
              <p class="mt-2 text-gray-500">Be the first to leave a message!</p>
            </div>

            <!-- Comments -->
            <div v-else class="space-y-6">
              <article
                v-for="comment in paginatedComments"
                :key="comment.id"
                class="bg-white rounded-lg shadow-md p-6"
              >
                <div class="flex items-start space-x-4">
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {{ getInitials(comment.name) }}
                    </div>
                  </div>

                  <!-- Comment Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-semibold text-gray-900">
                          {{ comment.name }}
                        </h3>
                      </div>
                      <time :datetime="comment.createdAt" class="text-sm text-gray-500">
                        {{ formatDate(comment.createdAt) }}
                      </time>
                    </div>

                    <div class="prose prose-sm max-w-none">
                      <p class="text-gray-700 whitespace-pre-wrap">{{ comment.message }}</p>
                    </div>

                    <!-- Admin Reply Section -->
                    <div v-if="comment.adminReply" class="mt-4 pl-4 border-l-2 border-primary-200">
                      <div class="bg-primary-50 rounded-lg p-4">
                        <div class="flex items-center space-x-2 mb-2">
                          <div class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            A
                          </div>
                          <span class="font-medium text-primary-900">Admin Reply</span>
                        </div>
                        <p class="text-primary-800 whitespace-pre-wrap">{{ comment.adminReply }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8 flex justify-center">
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
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Guidelines -->
          <BaseCard title="Community Guidelines">
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Be respectful and kind to others</span>
              </div>
              <div class="flex items-start space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Share constructive feedback and thoughts</span>
              </div>
              <div class="flex items-start space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>No spam, advertising, or inappropriate content</span>
              </div>
              <div class="flex items-start space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Messages are moderated before appearing</span>
              </div>
            </div>
          </BaseCard>

          <!-- Statistics -->
          <BaseCard title="Guestbook Stats">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Total Messages</span>
                <span class="font-semibold text-gray-900">{{ stats.totalComments }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">This Month</span>
                <span class="font-semibold text-gray-900">{{ stats.thisMonth }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Recent Visitors</span>
                <span class="font-semibold text-gray-900">{{ stats.recentVisitors }}</span>
              </div>
            </div>
          </BaseCard>

          <!-- Recent Activity -->
          <BaseCard v-if="recentComments.length > 0" title="Recent Messages">
            <div class="space-y-3">
              <div
                v-for="comment in recentComments.slice(0, 3)"
                :key="comment.id"
                class="text-sm"
              >
                <div class="font-medium text-gray-900">{{ comment.name }}</div>
                <div class="text-gray-600 line-clamp-2">{{ comment.message }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(comment.createdAt) }}</div>
              </div>
            </div>
          </BaseCard>

          <!-- Contact -->
          <BaseCard title="Get in Touch">
            <div class="text-sm text-gray-600 space-y-3">
              <p>Want to have a longer conversation or discuss opportunities?</p>
              <BaseButton variant="outline" class="w-full" @click="router.push('/contact')">
                Contact Me Directly
              </BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Success Modal -->
    <BaseModal v-model:show="showSuccessModal" title="Message Submitted!" size="medium">
      <div class="text-center py-4">
        <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500 mb-4" />
        <p class="text-gray-700 mb-4">
          Thank you for your message! It will be reviewed and published shortly.
        </p>
        <p class="text-sm text-gray-500">
          Messages are typically approved within 24 hours.
        </p>
      </div>
      <template #footer>
        <BaseButton variant="primary" @click="showSuccessModal = false">
          Continue
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useCommentStore } from '@/stores/comment'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseForm from '@/components/ui/BaseForm.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// Router
const router = useRouter()

// Stores
const commentStore = useCommentStore()

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const sortBy = ref('newest')
const currentPage = ref(1)
const commentsPerPage = 10

const form = reactive({
  name: '',
  email: '',
  message: '',
  subscribe: false
})

// Computed
const approvedComments = computed(() => commentStore.publicEntries)
const recentComments = computed(() => commentStore.recentEntries)
const stats = ref({ totalComments: 0, thisMonth: 0, recentVisitors: 0 })

const isFormValid = computed(() => {
  return form.name.trim() && form.email.trim() && form.message.trim()
})

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' }
]

const sortedComments = computed(() => {
  const comments = [...approvedComments.value]

  switch (sortBy.value) {
    case 'newest':
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    default:
      return comments
  }
})

const totalPages = computed(() => Math.ceil(sortedComments.value.length / commentsPerPage))

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * commentsPerPage
  const end = start + commentsPerPage
  return sortedComments.value.slice(start, end)
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
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true
    
    await commentStore.createEntry({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    })

    // Reset form
    Object.assign(form, {
      name: '',
      email: '',
      message: '',
      subscribe: false
    })

    showSuccessModal.value = true

  } catch (error) {
    console.error('Failed to submit comment:', error)
    // In a real app, you'd show an error toast
  } finally {
    isSubmitting.value = false
  }
}


// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      commentStore.fetchPublicEntries()
    ])
  } catch (error) {
    console.error('Failed to load guestbook data:', error)
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

.prose {
  color: #374151;
  line-height: 1.75;
}

.prose p {
  margin: 0;
}
</style>
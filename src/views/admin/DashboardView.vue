<template>
  <AdminLayout>
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <BaseCard>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <DocumentTextIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">總文章數</h3>
              <p class="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <BriefcaseIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">專案作品</h3>
              <p class="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100">
              <ChatBubbleLeftEllipsisIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">待審核留言</h3>
              <p class="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <CheckCircleIcon class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">待辦事項</h3>
              <p class="text-2xl font-semibold text-gray-900">5</p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Posts -->
        <BaseCard title="最近文章">
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon class="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">文章標題 {{ i }}</h4>
                <p class="text-sm text-gray-500">2 天前</p>
              </div>
              <div class="text-xs text-gray-400">草稿</div>
            </div>
          </div>
          
          <template #footer>
            <BaseButton variant="outline" size="small" class="w-full">
              查看所有文章
            </BaseButton>
          </template>
        </BaseCard>

        <!-- Quick Actions -->
        <BaseCard title="快速操作">
          <div class="grid grid-cols-2 gap-4">
            <BaseButton 
              variant="primary" 
              class="h-16"
              @click="router.push('/admin/blog/editor')"
            >
              <div class="text-center">
                <PlusIcon class="w-5 h-5 mx-auto mb-1" />
                <span class="text-sm">新增文章</span>
              </div>
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              class="h-16"
              @click="router.push('/admin/projects')"
            >
              <div class="text-center">
                <FolderPlusIcon class="w-5 h-5 mx-auto mb-1" />
                <span class="text-sm">新增專案</span>
              </div>
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              class="h-16"
              @click="router.push('/admin/calendar')"
            >
              <div class="text-center">
                <CalendarDaysIcon class="w-5 h-5 mx-auto mb-1" />
                <span class="text-sm">管理行程</span>
              </div>
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              class="h-16"
              @click="router.push('/admin/profile')"
            >
              <div class="text-center">
                <CogIcon class="w-5 h-5 mx-auto mb-1" />
                <span class="text-sm">個人設定</span>
              </div>
            </BaseButton>
          </div>
        </BaseCard>
      </div>

      <!-- System Info -->
      <div class="mt-8">
        <BaseCard title="系統資訊">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-500">使用者角色</h4>
              <p class="text-lg font-semibold text-gray-900">{{ authStore.userRole }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500">最後登入</h4>
              <p class="text-lg font-semibold text-gray-900">{{ formatDate(authStore.user?.lastLoginDate) }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500">帳號狀態</h4>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已啟用
              </span>
            </div>
          </div>
        </BaseCard>
      </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DocumentTextIcon,
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  PlusIcon,
  FolderPlusIcon,
  CalendarDaysIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

// Router
const router = useRouter()

// Stores
const authStore = useAuthStore()

// Methods

function formatDate(dateString?: string): string {
  if (!dateString) return '從未'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <div class="w-4 h-4 bg-gray-300 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div class="w-16 h-6 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div v-else-if="tasks.length > 0" class="divide-y divide-gray-200">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="p-6 hover:bg-gray-50 transition-colors"
        :class="{
          'bg-red-50 border-l-4 border-l-red-500': isOverdue(task),
          'bg-yellow-50 border-l-4 border-l-yellow-500': isDueSoon(task) && !isOverdue(task),
          'opacity-60': task.status === 'completed'
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <!-- Selection Checkbox -->
            <input
              type="checkbox"
              :checked="selectedTasks.includes(task.id)"
              @change="$emit('toggleSelect', task.id)"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />

            <!-- Completion Status -->
            <button
              @click="$emit('toggleComplete', task)"
              :class="[
                'flex items-center justify-center w-5 h-5 rounded border-2 transition-colors',
                task.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              ]"
            >
              <CheckIcon v-if="task.status === 'completed'" class="w-3 h-3" />
            </button>

            <!-- Task Content -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 :class="[
                  'text-lg font-medium',
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                ]">
                  {{ task.title }}
                </h3>
                
                <!-- Priority Badge -->
                <span :class="getPriorityStyle(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>

                <!-- Status Badge -->
                <span :class="getStatusStyle(task.status)">
                  {{ getStatusLabel(task.status) }}
                </span>

                <!-- Category Tag -->
                <span v-if="task.category" class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {{ task.category }}
                </span>
              </div>

              <!-- Description -->
              <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ task.description }}
              </p>

              <!-- Task Meta Information -->
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span v-if="task.dueDate" class="flex items-center">
                  <CalendarDaysIcon class="w-4 h-4 mr-1" />
                  {{ formatDate(task.dueDate) }}
                  <span v-if="isOverdue(task)" class="ml-1 text-red-600 font-medium">(逾期)</span>
                  <span v-else-if="isDueSoon(task)" class="ml-1 text-yellow-600 font-medium">(即將到期)</span>
                </span>

                <span v-if="task.estimatedHours" class="flex items-center">
                  <ClockIcon class="w-4 h-4 mr-1" />
                  預估 {{ task.estimatedHours }}h
                </span>

                <span v-if="task.actualHours" class="flex items-center">
                  <ChartBarIcon class="w-4 h-4 mr-1" />
                  實際 {{ task.actualHours }}h
                </span>

                <span class="flex items-center">
                  <CalendarIcon class="w-4 h-4 mr-1" />
                  建立於 {{ formatDate(task.createdAt) }}
                </span>

                <span v-if="task.completedAt" class="flex items-center text-green-600">
                  <CheckCircleIcon class="w-4 h-4 mr-1" />
                  完成於 {{ formatDate(task.completedAt) }}
                </span>
              </div>

              <!-- Progress Bar (if has estimated hours) -->
              <div v-if="task.estimatedHours && task.estimatedHours > 0" class="mt-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-gray-500">進度</span>
                  <span class="text-xs text-gray-900 font-medium">{{ getProgressPercentage(task) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    :class="[
                      'h-2 rounded-full transition-all duration-300',
                      task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    ]"
                    :style="{ width: `${getProgressPercentage(task)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 ml-4">
            <BaseButton
              variant="outline"
              size="small"
              @click="$emit('duplicateTask', task)"
              title="複製任務"
            >
              <DocumentDuplicateIcon class="w-4 h-4" />
            </BaseButton>
            <BaseButton
              variant="outline"
              size="small"
              @click="$emit('editTask', task)"
              title="編輯任務"
            >
              <PencilIcon class="w-4 h-4" />
            </BaseButton>
            <BaseButton
              variant="outline"
              size="small"
              @click="$emit('deleteTask', task.id)"
              title="刪除任務"
              class="text-red-600 hover:text-red-700"
            >
              <TrashIcon class="w-4 h-4" />
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center">
      <ListBulletIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到待辦事項</h3>
      <p class="mt-1 text-sm text-gray-500">
        開始建立您的第一個待辦事項吧
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import type { TodoItem } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'

// Props
interface Props {
  tasks: TodoItem[]
  loading?: boolean
  selectedTasks: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  toggleSelect: [id: number]
  toggleComplete: [task: TodoItem]
  editTask: [task: TodoItem]
  deleteTask: [id: number]
  duplicateTask: [task: TodoItem]
}>()

// Methods
function getPriorityLabel(priority: string | number): string {
  const priorityStr = String(priority)
  const priorityMap = {
    low: '低',
    '0': '低',
    medium: '中',
    '1': '中',
    high: '高',
    '2': '高',
    urgent: '緊急',
    '3': '緊急'
  }
  return priorityMap[priorityStr as keyof typeof priorityMap] || '中'
}

function getPriorityStyle(priority: string | number): string {
  const priorityStr = String(priority)
  const styleMap = {
    low: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    '0': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    medium: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    '1': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    high: 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
    '2': 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
    urgent: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    '3': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return styleMap[priorityStr as keyof typeof styleMap] || styleMap.medium || styleMap['1']
}

function getStatusLabel(status: string | number): string {
  const statusStr = String(status)
  const statusMap = {
    pending: '待處理',
    '0': '待處理',
    planning: '規劃中',
    '1': '規劃中',
    in_progress: '進行中',
    inProgress: '進行中',
    '2': '進行中',
    testing: '測試中',
    '3': '測試中',
    completed: '已完成',
    '4': '已完成',
    onHold: '暫停',
    '5': '暫停',
    cancelled: '已取消',
    '6': '已取消'
  }
  return statusMap[statusStr as keyof typeof statusMap] || '待處理'
}

function getStatusStyle(status: string | number): string {
  const statusStr = String(status)
  const styleMap = {
    pending: 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
    '0': 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
    planning: 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
    '1': 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
    in_progress: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    inProgress: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    '2': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    testing: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    '3': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    completed: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    '4': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    onHold: 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
    '5': 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
    cancelled: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    '6': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return styleMap[statusStr as keyof typeof styleMap] || styleMap.pending || styleMap['0']
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

function isOverdue(task: TodoItem): boolean {
  if (!task.dueDate || task.status === 'completed') return false
  
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return dueDate < today
}

function isDueSoon(task: TodoItem): boolean {
  if (!task.dueDate || task.status === 'completed') return false
  
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return diffDays >= 0 && diffDays <= 2 // Due within 2 days
}

function getProgressPercentage(task: TodoItem): number {
  if (task.status === 'completed') return 100
  
  const estimated = task.estimatedHours || 0
  const actual = task.actualHours || 0
  
  if (estimated === 0) return 0
  
  return Math.min(Math.round((actual / estimated) * 100), 100)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
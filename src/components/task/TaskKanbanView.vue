<template>
  <div class="p-6">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">載入中...</p>
    </div>

    <div v-else class="flex space-x-6 overflow-x-auto pb-4">
      <!-- Status Columns -->
      <div
        v-for="status in kanbanColumns"
        :key="status.value"
        class="flex-shrink-0 w-80"
      >
        <!-- Column Header -->
        <div class="bg-gray-50 border border-gray-200 rounded-t-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div :class="status.colorClass" class="w-3 h-3 rounded-full"></div>
              <h3 class="font-medium text-gray-900">{{ status.label }}</h3>
              <span class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                {{ getTasksForStatus(status.value).length }}
              </span>
            </div>
          </div>
        </div>

        <!-- Column Content -->
        <div class="bg-white border-l border-r border-b border-gray-200 rounded-b-lg min-h-96 p-4 space-y-3">
          <!-- Tasks -->
          <div
            v-for="task in getTasksForStatus(status.value)"
            :key="task.id"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            :class="{
              'border-l-4 border-l-red-500': isOverdue(task),
              'border-l-4 border-l-yellow-500': isDueSoon(task) && !isOverdue(task)
            }"
            @click="$emit('edit-task', task)"
          >
            <!-- Task Header -->
            <div class="flex items-start justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-900 line-clamp-2">
                {{ task.title }}
              </h4>
              <div class="flex items-center space-x-1 ml-2">
                <button
                  @click.stop="$emit('toggle-complete', task)"
                  :class="[
                    'flex items-center justify-center w-5 h-5 rounded border-2 transition-colors',
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  ]"
                >
                  <CheckIcon v-if="task.status === 'completed'" class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Task Description -->
            <p v-if="task.description" class="text-xs text-gray-600 mb-3 line-clamp-2">
              {{ task.description }}
            </p>

            <!-- Task Meta -->
            <div class="space-y-2">
              <!-- Priority and Category -->
              <div class="flex items-center space-x-2">
                <span :class="getPriorityStyle(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
                <span v-if="task.category" class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {{ task.category }}
                </span>
              </div>

              <!-- Due Date -->
              <div v-if="task.dueDate" class="flex items-center text-xs text-gray-500">
                <CalendarDaysIcon class="w-3 h-3 mr-1" />
                {{ formatDate(task.dueDate) }}
                <span v-if="isOverdue(task)" class="ml-1 text-red-600 font-medium">(逾期)</span>
                <span v-else-if="isDueSoon(task)" class="ml-1 text-yellow-600 font-medium">(即將到期)</span>
              </div>

              <!-- Progress Bar -->
              <div v-if="task.estimatedHours && task.estimatedHours > 0" class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500">進度</span>
                  <span class="font-medium">{{ getProgressPercentage(task) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    :class="[
                      'h-1.5 rounded-full transition-all duration-300',
                      task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    ]"
                    :style="{ width: `${getProgressPercentage(task)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center space-x-1">
                  <button
                    v-if="status.value !== 'pending'"
                    @click.stop="moveTaskTo(task, 'pending')"
                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="移至待處理"
                  >
                    <ArrowLeftIcon class="w-3 h-3" />
                  </button>
                  <button
                    v-if="status.value !== 'completed'"
                    @click.stop="moveTaskTo(task, getNextStatus(status.value))"
                    class="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="下一階段"
                  >
                    <ArrowRightIcon class="w-3 h-3" />
                  </button>
                </div>
                
                <div class="flex items-center space-x-1">
                  <button
                    @click.stop="$emit('edit-task', task)"
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="編輯"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click.stop="$emit('delete-task', task.id)"
                    class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="刪除"
                  >
                    <TrashIcon class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Column -->
          <div v-if="getTasksForStatus(status.value).length === 0" class="text-center py-8 text-gray-400">
            <RectangleStackIcon class="mx-auto h-8 w-8 mb-2" />
            <p class="text-sm">沒有 {{ status.label }} 的任務</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Empty State -->
    <div v-if="!loading && tasks.length === 0" class="text-center py-12">
      <RectangleStackIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到待辦事項</h3>
      <p class="mt-1 text-sm text-gray-500">
        開始建立您的第一個待辦事項吧
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RectangleStackIcon
} from '@heroicons/vue/24/outline'
import type { TodoItem } from '@/types/api'

// Props
interface Props {
  tasks: TodoItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  toggleComplete: [task: TodoItem]
  editTask: [task: TodoItem]
  deleteTask: [id: number]
  moveTask: [taskId: number, newStatus: string]
}>()

// Constants
const kanbanColumns = [
  {
    value: 'pending',
    label: '待處理',
    colorClass: 'bg-gray-400'
  },
  {
    value: 'in_progress',
    label: '進行中',
    colorClass: 'bg-blue-500'
  },
  {
    value: 'completed',
    label: '已完成',
    colorClass: 'bg-green-500'
  },
  {
    value: 'cancelled',
    label: '已取消',
    colorClass: 'bg-red-500'
  }
]

// Methods
function getTasksForStatus(status: string): TodoItem[] {
  return props.tasks.filter(task => task.status === status)
}

function moveTaskTo(task: TodoItem, newStatus: string) {
  emit('move-task', task.id, newStatus)
}

function getNextStatus(currentStatus: string): string {
  const statusFlow = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'completed',
    cancelled: 'pending'
  }
  return statusFlow[currentStatus as keyof typeof statusFlow] || 'pending'
}

// Reuse utility methods from other views
function getPriorityLabel(priority: string): string {
  const priorityMap = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '緊急'
  }
  return priorityMap[priority as keyof typeof priorityMap] || '中'
}

function getPriorityStyle(priority: string): string {
  const styleMap = {
    low: 'px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded',
    medium: 'px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded',
    high: 'px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded',
    urgent: 'px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded'
  }
  return styleMap[priority as keyof typeof styleMap] || styleMap.medium
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
  
  return diffDays >= 0 && diffDays <= 2
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
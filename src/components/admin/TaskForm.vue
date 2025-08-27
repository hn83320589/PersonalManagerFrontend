<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Task Title -->
      <div class="md:col-span-2">
        <label for="title" class="block text-sm font-medium text-gray-700">
          任務標題 <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="輸入任務標題"
          required
          class="mt-1"
        />
      </div>

      <!-- Description -->
      <div class="md:col-span-2">
        <label for="description" class="block text-sm font-medium text-gray-700">
          任務描述
        </label>
        <BaseTextarea
          id="description"
          v-model="formData.description"
          :rows="4"
          placeholder="詳細描述任務內容和要求..."
          class="mt-1"
        />
      </div>
    </div>

    <!-- Task Settings -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Status -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">
          狀態 <span class="text-red-500">*</span>
        </label>
        <BaseSelect
          id="status"
          v-model="formData.status"
          :options="taskStatuses"
          placeholder="選擇狀態"
          required
          class="mt-1"
        />
      </div>

      <!-- Priority -->
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700">
          優先級 <span class="text-red-500">*</span>
        </label>
        <BaseSelect
          id="priority"
          v-model="formData.priority"
          :options="taskPriorities"
          placeholder="選擇優先級"
          required
          class="mt-1"
        />
      </div>

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
            placeholder="輸入或選擇分類"
            class="flex-1"
            list="categories"
          />
          <datalist id="categories">
            <option v-for="category in commonCategories" :key="category" :value="category">
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
        <p class="mt-1 text-xs text-gray-500">例如: 緊急, 會議, 客戶</p>
      </div>
    </div>

    <!-- Dates and Time Estimation -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Start Date -->
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700">
          開始日期
        </label>
        <BaseInput
          id="startDate"
          v-model="formData.startDate"
          type="date"
          class="mt-1"
        />
      </div>

      <!-- Due Date -->
      <div>
        <label for="dueDate" class="block text-sm font-medium text-gray-700">
          到期日期
        </label>
        <BaseInput
          id="dueDate"
          v-model="formData.dueDate"
          type="date"
          class="mt-1"
        />
      </div>

      <!-- Estimated Hours -->
      <div>
        <label for="estimatedHours" class="block text-sm font-medium text-gray-700">
          預估時間 (小時)
        </label>
        <BaseInput
          id="estimatedHours"
          v-model="formData.estimatedHours"
          type="number"
          min="0"
          step="0.25"
          placeholder="0"
          class="mt-1"
        />
      </div>

      <!-- Actual Hours (read-only for new tasks) -->
      <div>
        <label for="actualHours" class="block text-sm font-medium text-gray-700">
          實際時間 (小時)
        </label>
        <BaseInput
          id="actualHours"
          v-model="formData.actualHours"
          type="number"
          min="0"
          step="0.25"
          placeholder="0"
          class="mt-1"
          :disabled="!task"
        />
        <p v-if="!task" class="mt-1 text-xs text-gray-500">新任務建立後可編輯</p>
      </div>
    </div>

    <!-- Advanced Options -->
    <div class="border-t border-gray-200 pt-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">進階設定</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Recurring Task Settings -->
        <div>
          <div class="flex items-center mb-3">
            <input
              id="isRecurring"
              v-model="formData.isRecurring"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isRecurring" class="ml-2 text-sm font-medium text-gray-700">
              重複任務
            </label>
          </div>
          
          <div v-if="formData.isRecurring" class="space-y-3">
            <BaseSelect
              v-model="formData.recurringPattern"
              :options="recurringPatterns"
              placeholder="選擇重複模式"
              class="mt-1"
            />
            
            <div v-if="formData.recurringPattern" class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>重複規則:</strong> {{ getRecurringDescription() }}</p>
            </div>
          </div>
        </div>

        <!-- Reminder Settings -->
        <div>
          <div class="flex items-center mb-3">
            <input
              id="hasReminder"
              v-model="formData.hasReminder"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="hasReminder" class="ml-2 text-sm font-medium text-gray-700">
              設定提醒
            </label>
          </div>
          
          <div v-if="formData.hasReminder" class="space-y-3">
            <BaseSelect
              v-model="formData.reminderType"
              :options="reminderTypes"
              placeholder="選擇提醒方式"
            />
            
            <div class="grid grid-cols-2 gap-3">
              <BaseInput
                v-model="formData.reminderValue"
                type="number"
                min="1"
                placeholder="數量"
              />
              <BaseSelect
                v-model="formData.reminderUnit"
                :options="reminderUnits"
                placeholder="單位"
              />
            </div>
            
            <p class="text-xs text-gray-500">
              將在到期前 {{ formData.reminderValue || 0 }} {{ getReminderUnitLabel() }} 提醒
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Progress (for existing tasks) -->
    <div v-if="task && formData.estimatedHours && formData.estimatedHours > 0" class="space-y-3">
      <label class="block text-sm font-medium text-gray-700">任務進度</label>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600">完成度</span>
          <span class="text-sm font-medium">{{ progressPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            :class="[
              'h-3 rounded-full transition-all duration-300',
              formData.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
            ]"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div class="text-gray-600">
            預估: {{ formData.estimatedHours || 0 }} 小時
          </div>
          <div class="text-gray-600">
            實際: {{ formData.actualHours || 0 }} 小時
          </div>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <BaseButton
        type="button"
        variant="outline"
        @click="$emit('cancel')"
      >
        取消
      </BaseButton>
      <BaseButton
        type="submit"
        variant="primary"
        :disabled="!isFormValid"
      >
        {{ task ? '更新任務' : '建立任務' }}
      </BaseButton>
    </div>

    <!-- Category Management Modal -->
    <BaseModal
      :show="showCategoryModal"
      @close="showCategoryModal = false"
      title="管理分類"
      max-width="md"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900">常用分類</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in commonCategories"
              :key="category"
              @click="selectCategory(category)"
              :class="[
                'px-3 py-1 text-sm rounded-full border transition-colors',
                formData.category === category
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category }}
            </button>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">建立新分類</h4>
          <div class="flex space-x-2">
            <BaseInput
              v-model="newCategory"
              type="text"
              placeholder="輸入新分類名稱"
              class="flex-1"
            />
            <BaseButton
              type="button"
              variant="primary"
              size="small"
              @click="addNewCategory"
              :disabled="!newCategory.trim()"
            >
              新增
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { TagIcon } from '@heroicons/vue/24/outline'
import type { TodoItem, TaskStatus, TodoPriority } from '@/types/api'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// Props
interface Props {
  task?: TodoItem | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [data: Partial<TodoItem>]
  cancel: []
}>()

// State
const showCategoryModal = ref(false)
const newCategory = ref('')

const formData = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  category: '',
  tags: '',
  startDate: '',
  dueDate: '',
  estimatedHours: 0,
  actualHours: 0,
  isRecurring: false,
  recurringPattern: '',
  hasReminder: false,
  reminderType: 'notification',
  reminderValue: 1,
  reminderUnit: 'days'
})

// Constants
const taskStatuses = [
  { value: 'pending', label: '待處理' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const taskPriorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '緊急' }
]

const commonCategories = ref([
  '工作', '個人', '學習', '健康', '購物', '家務', '會議', '專案', '緊急', '例行'
])

const recurringPatterns = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
]

const reminderTypes = [
  { value: 'notification', label: '系統通知' },
  { value: 'email', label: '電子郵件' },
  { value: 'both', label: '通知 + 郵件' }
]

const reminderUnits = [
  { value: 'minutes', label: '分鐘' },
  { value: 'hours', label: '小時' },
  { value: 'days', label: '天' },
  { value: 'weeks', label: '週' }
]

// Computed
const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0 &&
         formData.value.status &&
         formData.value.priority
})

const progressPercentage = computed(() => {
  const estimated = formData.value.estimatedHours || 0
  const actual = formData.value.actualHours || 0
  
  if (estimated === 0) return formData.value.status === 'completed' ? 100 : 0
  
  return Math.min(Math.round((actual / estimated) * 100), 100)
})

// Methods
function selectCategory(category: string) {
  formData.value.category = category
  showCategoryModal.value = false
}

function addNewCategory() {
  if (newCategory.value.trim()) {
    commonCategories.value.push(newCategory.value.trim())
    selectCategory(newCategory.value.trim())
    newCategory.value = ''
  }
}

function getRecurringDescription(): string {
  const patterns = {
    daily: '每天重複',
    weekly: '每週重複',
    monthly: '每月重複',
    yearly: '每年重複'
  }
  return patterns[formData.value.recurringPattern as keyof typeof patterns] || ''
}

function getReminderUnitLabel(): string {
  const units = {
    minutes: '分鐘',
    hours: '小時',
    days: '天',
    weeks: '週'
  }
  return units[formData.value.reminderUnit as keyof typeof units] || '天'
}

function handleSubmit() {
  if (!isFormValid.value) return

  const submitData: Partial<TodoItem> = {
    title: formData.value.title.trim(),
    description: formData.value.description?.trim() || undefined,
    status: parseInt(formData.value.status as string) as TaskStatus,
    priority: parseInt(formData.value.priority as string) as TodoPriority,
    category: formData.value.category?.trim() || undefined,
    startDate: formData.value.startDate || undefined,
    dueDate: formData.value.dueDate || undefined,
    estimatedHours: formData.value.estimatedHours || undefined,
    actualHours: formData.value.actualHours || undefined,
  }

  // Remove undefined values
  Object.keys(submitData).forEach(key => {
    if (submitData[key as keyof typeof submitData] === undefined) {
      delete submitData[key as keyof typeof submitData]
    }
  })

  emit('save', submitData)
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: '',
    tags: '',
    startDate: '',
    dueDate: '',
    estimatedHours: 0,
    actualHours: 0,
    isRecurring: false,
    recurringPattern: '',
    hasReminder: false,
    reminderType: 'notification',
    reminderValue: 1,
    reminderUnit: 'days'
  }
}

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: String(newTask.status) || 'pending',
      priority: String(newTask.priority) || 'medium',
      category: newTask.category || '',
      tags: '',
      startDate: newTask.dueDate?.split('T')[0] || '',
      dueDate: newTask.dueDate?.split('T')[0] || '',
      estimatedHours: 0,
      actualHours: 0,
      // These properties don't exist in the TodoItem model
      // isRecurring, recurringPattern, hasReminder, reminderSettings
      // will be implemented in future updates
    }
  } else {
    resetForm()
  }
}, { immediate: true })
</script>
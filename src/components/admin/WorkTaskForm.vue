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

    <!-- Task Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <!-- Project -->
      <div>
        <label for="project" class="block text-sm font-medium text-gray-700">
          關聯專案
        </label>
        <div class="mt-1 flex space-x-2">
          <BaseInput
            id="project"
            v-model="formData.project"
            type="text"
            placeholder="輸入專案名稱"
            class="flex-1"
          />
          <BaseButton
            type="button"
            variant="outline"
            size="small"
            @click="showProjectSelector = true"
            title="選擇現有專案"
          >
            <FolderIcon class="w-4 h-4" />
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
        <p class="mt-1 text-xs text-gray-500">例如: 緊急, 前端, 修復</p>
      </div>
    </div>

    <!-- Dates and Time -->
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
          step="0.5"
          placeholder="0"
          class="mt-1"
        />
      </div>

      <!-- Actual Hours -->
      <div>
        <label for="actualHours" class="block text-sm font-medium text-gray-700">
          實際時間 (小時)
        </label>
        <BaseInput
          id="actualHours"
          v-model="formData.actualHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="0"
          class="mt-1"
          :disabled="!task" 
        />
        <p v-if="!task" class="mt-1 text-xs text-gray-500">新任務建立後可編輯</p>
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
            class="bg-blue-600 h-3 rounded-full transition-all duration-300"
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

    <!-- Project Selector Modal -->
    <BaseModal
      :show="showProjectSelector"
      @close="showProjectSelector = false"
      title="選擇專案"
      max-width="md"
    >
      <div class="space-y-4">
        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="project in availableProjects"
            :key="project"
            @click="selectProject(project)"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ project }}</span>
              <CheckIcon 
                v-if="formData.project === project"
                class="w-5 h-5 text-green-600"
              />
            </div>
          </div>
        </div>
        <div v-if="availableProjects.length === 0" class="text-center py-8 text-gray-500">
          沒有可用的專案
        </div>
      </div>
    </BaseModal>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { FolderIcon, CheckIcon } from '@heroicons/vue/24/outline'
import type { WorkTask, TaskStatus, TaskPriority } from '@/types/api'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// Props
interface Props {
  task?: WorkTask | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [data: Partial<WorkTask>]
  cancel: []
}>()

// State
const showProjectSelector = ref(false)

const formData = ref({
  title: '',
  description: '',
  status: 0 as TaskStatus,
  priority: 1 as TaskPriority,
  startDate: '',
  dueDate: '',
  estimatedHours: 0,
  actualHours: 0,
  project: '',
  tags: ''
})

// Constants
const taskStatuses = [
  { value: 0, label: '待處理' },
  { value: 1, label: '規劃中' },
  { value: 2, label: '進行中' },
  { value: 3, label: '測試中' },
  { value: 4, label: '已完成' },
  { value: 5, label: '暫停' },
  { value: 6, label: '已取消' }
]

const taskPriorities = [
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
  { value: 3, label: '緊急' }
]

// Mock available projects (should come from store or API)
const availableProjects = ref([
  'Personal Manager',
  'E-commerce Platform',
  'Mobile App Development',
  'Data Analytics Dashboard',
  'Content Management System'
])

// Computed
const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0 &&
         formData.value.status !== null &&
         formData.value.priority !== null
})

const progressPercentage = computed(() => {
  const estimated = formData.value.estimatedHours || 0
  const actual = formData.value.actualHours || 0
  
  if (estimated === 0) return 0
  
  return Math.min(Math.round((actual / estimated) * 100), 100)
})

// Methods
function selectProject(project: string) {
  formData.value.project = project
  showProjectSelector.value = false
}

function handleSubmit() {
  if (!isFormValid.value) return

  const submitData: Partial<WorkTask> = {
    title: formData.value.title.trim(),
    description: formData.value.description?.trim() || undefined,
    status: formData.value.status,
    priority: formData.value.priority,
    startDate: formData.value.startDate || undefined,
    dueDate: formData.value.dueDate || undefined,
    estimatedHours: formData.value.estimatedHours || undefined,
    actualHours: formData.value.actualHours || undefined,
    project: formData.value.project?.trim() || undefined,
    tags: formData.value.tags?.trim() || undefined
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
    status: 0,
    priority: 1,
    startDate: '',
    dueDate: '',
    estimatedHours: 0,
    actualHours: 0,
    project: '',
    tags: ''
  }
}

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: typeof newTask.status === 'string' ? 0 : newTask.status,
      priority: newTask.priority,
      startDate: newTask.startDate || '',
      dueDate: newTask.dueDate || '',
      estimatedHours: newTask.estimatedHours || 0,
      actualHours: newTask.actualHours || 0,
      project: newTask.project || '',
      tags: newTask.tags || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Load available projects from store or API
  // This would typically fetch from a projects API
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
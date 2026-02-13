import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TodoItem, WorkTask, TodoPriority, WorkTaskStatus, WorkTaskPriority } from '@/types/api'

// Time Entry Interface for work tracking
interface TimeEntry {
  id: number
  taskId?: number
  task: string
  project?: string
  date: string
  startTime?: string
  endTime?: string
  duration: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export const useTaskStore = defineStore('task', () => {
  // State
  const todoItems = ref<TodoItem[]>([])
  const workTasks = ref<WorkTask[]>([])
  const timeEntries = ref<TimeEntry[]>([])
  const currentTodo = ref<TodoItem | null>(null)
  const currentWorkTask = ref<WorkTask | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Todo Items Getters
  const completedTodos = computed(() =>
    todoItems.value.filter(todo => todo.status === 'Completed')
  )

  const pendingTodos = computed(() =>
    todoItems.value.filter(todo => todo.status !== 'Completed')
  )

  const todosByPriority = computed(() => {
    const priorityMap: Record<TodoPriority, TodoItem[]> = {
      'Low': [],
      'Medium': [],
      'High': []
    }
    todoItems.value.forEach(todo => {
      priorityMap[todo.priority].push(todo)
    })
    return priorityMap
  })

  const overdueTodos = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return todoItems.value.filter(todo =>
      todo.dueDate && todo.dueDate < today && todo.status !== 'Completed'
    )
  })

  // Work Tasks Getters
  const workTasksByStatus = computed(() => {
    const statusMap: Record<WorkTaskStatus, WorkTask[]> = {
      'Pending': [],
      'Planning': [],
      'InProgress': [],
      'Testing': [],
      'Completed': [],
      'OnHold': [],
      'Cancelled': []
    }
    workTasks.value.forEach(task => {
      statusMap[task.status].push(task)
    })
    return statusMap
  })

  const activeWorkTasks = computed(() =>
    workTasks.value.filter(task =>
      task.status === 'InProgress' || task.status === 'Planning' || task.status === 'Testing'
    )
  )

  const workTasksByPriority = computed(() => {
    const priorityMap: Record<WorkTaskPriority, WorkTask[]> = {
      'Low': [],
      'Medium': [],
      'High': [],
      'Urgent': []
    }
    workTasks.value.forEach(task => {
      priorityMap[task.priority].push(task)
    })
    return priorityMap
  })

  const overdueWorkTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return workTasks.value.filter(task =>
      task.dueDate && task.dueDate < today && task.status !== 'Completed'
    )
  })

  // Todo Items Actions
  async function fetchTodoItems() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      todoItems.value = []
    } catch (err) {
      error.value = 'Failed to fetch todo items'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTodoById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentTodo.value = null
    } catch (err) {
      error.value = 'Failed to fetch todo item'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTodo(todoData: Partial<TodoItem>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create todo item'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateTodo(id: number, todoData: Partial<TodoItem>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update todo item'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function toggleTodoCompletion(id: number) {
    const todo = todoItems.value.find(t => t.id === id)
    if (todo) {
      const isCompleted = todo.status === 'Completed'
      const updatedData: Partial<TodoItem> = {
        status: isCompleted ? 'Pending' : 'Completed',
        completedAt: isCompleted ? undefined : new Date().toISOString()
      }
      return await updateTodo(id, updatedData)
    }
    return null
  }

  async function deleteTodo(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete todo item'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Work Tasks Actions
  async function fetchWorkTasks() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      workTasks.value = []
    } catch (err) {
      error.value = 'Failed to fetch work tasks'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWorkTaskById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentWorkTask.value = null
    } catch (err) {
      error.value = 'Failed to fetch work task'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createWorkTask(taskData: Partial<WorkTask>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create work task'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateWorkTask(id: number, taskData: Partial<WorkTask>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update work task'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateWorkTaskStatus(id: number, status: WorkTaskStatus) {
    return await updateWorkTask(id, { status })
  }

  async function deleteWorkTask(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete work task'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentTodo() {
    currentTodo.value = null
  }

  function clearCurrentWorkTask() {
    currentWorkTask.value = null
  }

  // Time Entries Actions
  async function fetchTimeEntries() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      timeEntries.value = []
    } catch (err) {
      error.value = 'Failed to fetch time entries'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTimeEntry(entryData: Partial<TimeEntry>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create time entry'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateTimeEntry(id: number, entryData: Partial<TimeEntry>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update time entry'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTimeEntry(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete time entry'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    todoItems,
    workTasks,
    timeEntries,
    currentTodo,
    currentWorkTask,
    isLoading,
    error,
    // Todo Getters
    completedTodos,
    pendingTodos,
    todosByPriority,
    overdueTodos,
    // Work Task Getters
    workTasksByStatus,
    activeWorkTasks,
    workTasksByPriority,
    overdueWorkTasks,
    // Todo Actions
    fetchTodoItems,
    fetchTodoById,
    createTodo,
    updateTodo,
    toggleTodoCompletion,
    deleteTodo,
    // Work Task Actions
    fetchWorkTasks,
    fetchWorkTaskById,
    createWorkTask,
    updateWorkTask,
    updateWorkTaskStatus,
    deleteWorkTask,
    // Time Entry Actions
    fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    // Utilities
    clearError,
    clearCurrentTodo,
    clearCurrentWorkTask,
  }
})
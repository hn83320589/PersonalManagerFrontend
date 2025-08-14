import httpService from './http'
import type { ApiResponse, TodoItem, WorkTask, TaskStatus, TodoPriority, TaskPriority } from '@/types/api'

class TaskService {
  // Todo Items API methods
  async getTodoItems(): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>('/todoitems')
  }

  async getTodoItemById(id: number): Promise<ApiResponse<TodoItem>> {
    return httpService.get<TodoItem>(`/todoitems/${id}`)
  }

  async getTodoItemsByUserId(userId: number): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>(`/todoitems/user/${userId}`)
  }

  async getTodoItemsByStatus(status: TaskStatus): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>(`/todoitems/status/${status}`)
  }

  async getTodoItemsByPriority(priority: TodoPriority): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>(`/todoitems/priority/${priority}`)
  }

  async getCompletedTodos(): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>('/todoitems/completed')
  }

  async getPendingTodos(): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>('/todoitems/pending')
  }

  async getOverdueTodos(): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>('/todoitems/overdue')
  }

  async createTodoItem(todo: Partial<TodoItem>): Promise<ApiResponse<TodoItem>> {
    return httpService.post<TodoItem>('/todoitems', todo)
  }

  async updateTodoItem(id: number, todo: Partial<TodoItem>): Promise<ApiResponse<TodoItem>> {
    return httpService.put<TodoItem>(`/todoitems/${id}`, todo)
  }

  async deleteTodoItem(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/todoitems/${id}`)
  }

  async toggleTodoCompletion(id: number): Promise<ApiResponse<TodoItem>> {
    return httpService.post<TodoItem>(`/todoitems/${id}/toggle`)
  }

  // Work Tasks API methods
  async getWorkTasks(): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>('/worktasks')
  }

  async getWorkTaskById(id: number): Promise<ApiResponse<WorkTask>> {
    return httpService.get<WorkTask>(`/worktasks/${id}`)
  }

  async getWorkTasksByUserId(userId: number): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>(`/worktasks/user/${userId}`)
  }

  async getWorkTasksByStatus(status: TaskStatus): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>(`/worktasks/status/${status}`)
  }

  async getWorkTasksByPriority(priority: TaskPriority): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>(`/worktasks/priority/${priority}`)
  }

  async getWorkTasksByProject(projectId: string): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>(`/worktasks/project/${encodeURIComponent(projectId)}`)
  }

  async getActiveWorkTasks(): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>('/worktasks/active')
  }

  async getOverdueWorkTasks(): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>('/worktasks/overdue')
  }

  async createWorkTask(task: Partial<WorkTask>): Promise<ApiResponse<WorkTask>> {
    return httpService.post<WorkTask>('/worktasks', task)
  }

  async updateWorkTask(id: number, task: Partial<WorkTask>): Promise<ApiResponse<WorkTask>> {
    return httpService.put<WorkTask>(`/worktasks/${id}`, task)
  }

  async deleteWorkTask(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/worktasks/${id}`)
  }

  async updateWorkTaskStatus(id: number, status: TaskStatus): Promise<ApiResponse<WorkTask>> {
    return httpService.put<WorkTask>(`/worktasks/${id}/status`, { status })
  }

  // Utility methods
  async updateTodoOrder(todoId: number, newOrder: number): Promise<ApiResponse<void>> {
    return httpService.put<void>(`/todoitems/${todoId}/order`, { sortOrder: newOrder })
  }

  async bulkUpdateTodos(todos: { id: number; data: Partial<TodoItem> }[]): Promise<ApiResponse<TodoItem[]>> {
    return httpService.put<TodoItem[]>('/todoitems/bulk', { todos })
  }

  async bulkDeleteTodos(todoIds: number[]): Promise<ApiResponse<void>> {
    return httpService.post<void>('/todoitems/bulk/delete', { todoIds })
  }

  async bulkUpdateWorkTasks(tasks: { id: number; data: Partial<WorkTask> }[]): Promise<ApiResponse<WorkTask[]>> {
    return httpService.put<WorkTask[]>('/worktasks/bulk', { tasks })
  }

  async bulkDeleteWorkTasks(taskIds: number[]): Promise<ApiResponse<void>> {
    return httpService.post<void>('/worktasks/bulk/delete', { taskIds })
  }

  // Search methods
  async searchTodos(keyword: string): Promise<ApiResponse<TodoItem[]>> {
    return httpService.get<TodoItem[]>('/todoitems/search', { keyword })
  }

  async searchWorkTasks(keyword: string): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get<WorkTask[]>('/worktasks/search', { keyword })
  }

  // Statistics
  async getTodoStatistics(): Promise<ApiResponse<{
    totalTodos: number
    completedTodos: number
    pendingTodos: number
    overdueTodos: number
    todosByPriority: Record<TodoPriority, number>
  }>> {
    return httpService.get('/todoitems/statistics')
  }

  async getWorkTaskStatistics(): Promise<ApiResponse<{
    totalTasks: number
    tasksByStatus: Record<TaskStatus, number>
    tasksByPriority: Record<TaskPriority, number>
    overdueTasks: number
  }>> {
    return httpService.get('/worktasks/statistics')
  }
}

export const taskService = new TaskService()
export default taskService
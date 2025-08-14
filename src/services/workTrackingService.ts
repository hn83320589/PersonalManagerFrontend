import httpService from './http'
import taskService from './taskService'
import type { ApiResponse, WorkTask, TaskStatus, TaskPriority } from '@/types/api'

class WorkTrackingService {
  // Work tracking specific methods (extending TaskService functionality)
  
  async getWorkTrackingDashboard(): Promise<ApiResponse<{
    totalTasks: number
    activeTasks: number
    completedTasks: number
    overdueTasks: number
    totalHoursLogged: number
    currentWeekHours: number
    tasksByStatus: Record<TaskStatus, number>
    tasksByPriority: Record<TaskPriority, number>
    recentlyCompleted: WorkTask[]
    upcomingDeadlines: WorkTask[]
  }>> {
    return httpService.get('/worktasks/tracking/dashboard')
  }

  async getProjectTasks(projectId: string): Promise<ApiResponse<WorkTask[]>> {
    return taskService.getWorkTasksByProject(projectId)
  }

  async getProjectStatistics(projectId: string): Promise<ApiResponse<{
    totalTasks: number
    completedTasks: number
    totalHours: number
    estimatedHours: number
    progressPercentage: number
    tasksByStatus: Record<TaskStatus, number>
    averageTaskDuration: number
  }>> {
    return httpService.get(`/worktasks/tracking/project/${encodeURIComponent(projectId)}/statistics`)
  }

  async getAllProjects(): Promise<ApiResponse<string[]>> {
    return httpService.get('/worktasks/tracking/projects')
  }

  async getProjectProgress(projectId: string): Promise<ApiResponse<{
    completed: number
    total: number
    percentage: number
    estimatedCompletion: string
  }>> {
    return httpService.get(`/worktasks/tracking/project/${encodeURIComponent(projectId)}/progress`)
  }

  // Time tracking methods
  async logWorkTime(taskId: number, hours: number, description?: string): Promise<ApiResponse<WorkTask>> {
    return httpService.post<WorkTask>(`/worktasks/${taskId}/log-time`, {
      hours,
      description
    })
  }

  async updateTaskTime(taskId: number, actualHours: number): Promise<ApiResponse<WorkTask>> {
    return httpService.put<WorkTask>(`/worktasks/${taskId}/time`, {
      actualHours
    })
  }

  async getTimeLog(taskId: number): Promise<ApiResponse<{
    entries: { date: string; hours: number; description?: string }[]
    totalHours: number
  }>> {
    return httpService.get(`/worktasks/${taskId}/time-log`)
  }

  async getWeeklyTimeReport(startDate: string): Promise<ApiResponse<{
    totalHours: number
    taskBreakdown: { taskId: number; title: string; hours: number }[]
    dailyHours: Record<string, number>
  }>> {
    return httpService.get('/worktasks/tracking/weekly-report', { startDate })
  }

  async getMonthlyTimeReport(year: number, month: number): Promise<ApiResponse<{
    totalHours: number
    weeklyBreakdown: Record<string, number>
    projectBreakdown: Record<string, number>
    taskBreakdown: { taskId: number; title: string; hours: number }[]
  }>> {
    return httpService.get('/worktasks/tracking/monthly-report', { year, month })
  }

  // Task progress tracking
  async updateTaskProgress(taskId: number, progressPercentage: number): Promise<ApiResponse<WorkTask>> {
    return httpService.put<WorkTask>(`/worktasks/${taskId}/progress`, {
      progressPercentage
    })
  }

  async addTaskNote(taskId: number, note: string): Promise<ApiResponse<void>> {
    return httpService.post<void>(`/worktasks/${taskId}/notes`, { note })
  }

  async getTaskNotes(taskId: number): Promise<ApiResponse<{
    notes: { id: number; note: string; createdAt: string }[]
  }>> {
    return httpService.get(`/worktasks/${taskId}/notes`)
  }

  // Kanban board functionality
  async getKanbanBoard(projectId?: string): Promise<ApiResponse<{
    columns: {
      status: TaskStatus
      name: string
      tasks: WorkTask[]
    }[]
  }>> {
    const params = projectId ? { projectId } : {}
    return httpService.get('/worktasks/tracking/kanban', params)
  }

  async moveTaskToColumn(taskId: number, newStatus: TaskStatus): Promise<ApiResponse<WorkTask>> {
    return taskService.updateWorkTaskStatus(taskId, newStatus)
  }

  async reorderTasksInColumn(status: TaskStatus, taskIds: number[]): Promise<ApiResponse<void>> {
    return httpService.put('/worktasks/tracking/kanban/reorder', {
      status,
      taskIds
    })
  }

  // Productivity metrics
  async getProductivityMetrics(startDate: string, endDate: string): Promise<ApiResponse<{
    tasksCompleted: number
    averageTaskDuration: number
    hoursWorked: number
    efficiencyRating: number
    trendData: {
      date: string
      tasksCompleted: number
      hoursWorked: number
    }[]
  }>> {
    return httpService.get('/worktasks/tracking/productivity', {
      startDate,
      endDate
    })
  }

  async getBurndownChart(projectId: string): Promise<ApiResponse<{
    idealBurndown: { date: string; remainingTasks: number }[]
    actualBurndown: { date: string; remainingTasks: number }[]
    totalTasks: number
    startDate: string
    endDate: string
  }>> {
    return httpService.get(`/worktasks/tracking/project/${encodeURIComponent(projectId)}/burndown`)
  }

  // Team collaboration (if applicable)
  async getTeamTasks(): Promise<ApiResponse<WorkTask[]>> {
    return httpService.get('/worktasks/tracking/team')
  }

  async assignTaskToUser(taskId: number, userId: number): Promise<ApiResponse<WorkTask>> {
    return httpService.put<WorkTask>(`/worktasks/${taskId}/assign`, { userId })
  }

  // Export and reporting
  async exportWorkReport(format: 'pdf' | 'excel' | 'csv', options: {
    startDate: string
    endDate: string
    projectId?: string
    includeTimeLog?: boolean
  }): Promise<ApiResponse<string>> {
    return httpService.post(`/worktasks/tracking/export/${format}`, options)
  }

  // Custom views and filters
  async saveCustomView(name: string, filters: {
    status?: TaskStatus[]
    priority?: TaskPriority[]
    projectId?: string
    dateRange?: { start: string; end: string }
  }): Promise<ApiResponse<void>> {
    return httpService.post('/worktasks/tracking/views', { name, filters })
  }

  async getCustomViews(): Promise<ApiResponse<{
    id: number
    name: string
    filters: any
  }[]>> {
    return httpService.get('/worktasks/tracking/views')
  }

  async deleteCustomView(viewId: number): Promise<ApiResponse<void>> {
    return httpService.delete(`/worktasks/tracking/views/${viewId}`)
  }

  // Delegate to TaskService for basic CRUD operations
  async getWorkTasks() {
    return taskService.getWorkTasks()
  }

  async getWorkTaskById(id: number) {
    return taskService.getWorkTaskById(id)
  }

  async createWorkTask(task: Partial<WorkTask>) {
    return taskService.createWorkTask(task)
  }

  async updateWorkTask(id: number, task: Partial<WorkTask>) {
    return taskService.updateWorkTask(id, task)
  }

  async deleteWorkTask(id: number) {
    return taskService.deleteWorkTask(id)
  }
}

export const workTrackingService = new WorkTrackingService()
export default workTrackingService
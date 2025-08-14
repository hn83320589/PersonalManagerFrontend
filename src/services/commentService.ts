import httpService from './http'
import type { ApiResponse, GuestBookEntry } from '@/types/api'

class CommentService {
  async getGuestBookEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries')
  }

  async getPublicGuestBookEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/public')
  }

  async getApprovedGuestBookEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/approved')
  }

  async getPendingGuestBookEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/pending')
  }

  async getGuestBookEntryById(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.get<GuestBookEntry>(`/guestbookentries/${id}`)
  }

  async getGuestBookReplies(parentId: number): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>(`/guestbookentries/${parentId}/replies`)
  }

  async getTopLevelEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/toplevel')
  }

  async getRecentEntries(limit: number = 10): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/recent', { limit })
  }

  async createGuestBookEntry(entry: Partial<GuestBookEntry>): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>('/guestbookentries', entry)
  }

  async createReply(parentId: number, entry: Partial<GuestBookEntry>): Promise<ApiResponse<GuestBookEntry>> {
    const replyData = { ...entry, parentId }
    return httpService.post<GuestBookEntry>('/guestbookentries', replyData)
  }

  async updateGuestBookEntry(id: number, entry: Partial<GuestBookEntry>): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.put<GuestBookEntry>(`/guestbookentries/${id}`, entry)
  }

  async deleteGuestBookEntry(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/guestbookentries/${id}`)
  }

  // Moderation methods
  async approveEntry(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>(`/guestbookentries/${id}/approve`)
  }

  async rejectEntry(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>(`/guestbookentries/${id}/reject`)
  }

  async toggleEntryVisibility(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>(`/guestbookentries/${id}/toggle-visibility`)
  }

  async moderateEntry(id: number, action: 'approve' | 'reject' | 'delete'): Promise<ApiResponse<GuestBookEntry | void>> {
    switch (action) {
      case 'approve':
        return this.approveEntry(id)
      case 'reject':
        return this.rejectEntry(id)
      case 'delete':
        return this.deleteGuestBookEntry(id)
      default:
        throw new Error(`Invalid moderation action: ${action}`)
    }
  }

  // Bulk operations
  async bulkApproveEntries(entryIds: number[]): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.post<GuestBookEntry[]>('/guestbookentries/bulk/approve', { entryIds })
  }

  async bulkRejectEntries(entryIds: number[]): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.post<GuestBookEntry[]>('/guestbookentries/bulk/reject', { entryIds })
  }

  async bulkDeleteEntries(entryIds: number[]): Promise<ApiResponse<void>> {
    return httpService.post<void>('/guestbookentries/bulk/delete', { entryIds })
  }

  async bulkUpdateEntries(entries: { id: number; data: Partial<GuestBookEntry> }[]): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.put<GuestBookEntry[]>('/guestbookentries/bulk', { entries })
  }

  // Search methods
  async searchEntries(keyword: string): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/search', { keyword })
  }

  async searchPublicEntries(keyword: string): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/search/public', { keyword })
  }

  // Filter methods
  async getEntriesByEmail(email: string): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/by-email', { email })
  }

  async getEntriesByName(name: string): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/by-name', { name })
  }

  async getEntriesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/by-date-range', {
      startDate,
      endDate
    })
  }

  // Statistics
  async getGuestBookStatistics(): Promise<ApiResponse<{
    totalEntries: number
    approvedEntries: number
    pendingEntries: number
    rejectedEntries: number
    entriesThisMonth: number
    entriesThisWeek: number
    topContributors: { name: string; count: number }[]
  }>> {
    return httpService.get('/guestbookentries/statistics')
  }

  // Spam detection and management
  async markAsSpam(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>(`/guestbookentries/${id}/mark-spam`)
  }

  async markAsNotSpam(id: number): Promise<ApiResponse<GuestBookEntry>> {
    return httpService.post<GuestBookEntry>(`/guestbookentries/${id}/mark-not-spam`)
  }

  async getSpamEntries(): Promise<ApiResponse<GuestBookEntry[]>> {
    return httpService.get<GuestBookEntry[]>('/guestbookentries/spam')
  }

  // Export functionality
  async exportEntries(format: 'json' | 'csv' | 'xml' = 'json'): Promise<ApiResponse<string>> {
    return httpService.get(`/guestbookentries/export/${format}`)
  }

  // Configuration
  async getModerationSettings(): Promise<ApiResponse<{
    requireApproval: boolean
    allowAnonymous: boolean
    allowReplies: boolean
    maxLength: number
    allowedDomains: string[]
    blockedWords: string[]
  }>> {
    return httpService.get('/guestbookentries/settings')
  }

  async updateModerationSettings(settings: {
    requireApproval?: boolean
    allowAnonymous?: boolean
    allowReplies?: boolean
    maxLength?: number
    allowedDomains?: string[]
    blockedWords?: string[]
  }): Promise<ApiResponse<void>> {
    return httpService.put('/guestbookentries/settings', settings)
  }
}

export const commentService = new CommentService()
export default commentService
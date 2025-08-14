import httpService from './http'
import type { ApiResponse, CalendarEvent, EventType } from '@/types/api'

class CalendarService {
  async getCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>('/calendarevents')
  }

  async getPublicCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>('/calendarevents/public')
  }

  async getCalendarEventById(id: number): Promise<ApiResponse<CalendarEvent>> {
    return httpService.get<CalendarEvent>(`/calendarevents/${id}`)
  }

  async getCalendarEventsByUserId(userId: number): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>(`/calendarevents/user/${userId}`)
  }

  async getCalendarEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>('/calendarevents/daterange', {
      startDate,
      endDate
    })
  }

  async getCalendarEventsByDate(date: string): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>(`/calendarevents/date/${date}`)
  }

  async getCalendarEventsByType(eventType: EventType): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>(`/calendarevents/type/${eventType}`)
  }

  async getUpcomingEvents(limit: number = 5): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>('/calendarevents/upcoming', { limit })
  }

  async getTodayEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    const today = new Date().toISOString().split('T')[0]
    return this.getCalendarEventsByDate(today)
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    return httpService.post<CalendarEvent>('/calendarevents', event)
  }

  async updateCalendarEvent(id: number, event: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    return httpService.put<CalendarEvent>(`/calendarevents/${id}`, event)
  }

  async deleteCalendarEvent(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/calendarevents/${id}`)
  }

  // Google Calendar integration methods
  async syncWithGoogleCalendar(): Promise<ApiResponse<void>> {
    return httpService.post<void>('/calendarevents/google/sync')
  }

  async importFromGoogleCalendar(calendarId: string): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.post<CalendarEvent[]>('/calendarevents/google/import', { calendarId })
  }

  async exportToGoogleCalendar(eventId: number): Promise<ApiResponse<void>> {
    return httpService.post<void>(`/calendarevents/${eventId}/google/export`)
  }

  // Utility methods
  async duplicateEvent(id: number, newDate?: string): Promise<ApiResponse<CalendarEvent>> {
    return httpService.post<CalendarEvent>(`/calendarevents/${id}/duplicate`, { newDate })
  }

  async bulkUpdateEvents(events: { id: number; data: Partial<CalendarEvent> }[]): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.put<CalendarEvent[]>('/calendarevents/bulk', { events })
  }

  async bulkDeleteEvents(eventIds: number[]): Promise<ApiResponse<void>> {
    return httpService.post<void>('/calendarevents/bulk/delete', { eventIds })
  }

  // Search methods
  async searchEvents(keyword: string): Promise<ApiResponse<CalendarEvent[]>> {
    return httpService.get<CalendarEvent[]>('/calendarevents/search', { keyword })
  }

  async getEventStatistics(): Promise<ApiResponse<{
    totalEvents: number
    eventsByType: Record<EventType, number>
    upcomingEventsCount: number
    pastEventsCount: number
  }>> {
    return httpService.get('/calendarevents/statistics')
  }
}

export const calendarService = new CalendarService()
export default calendarService
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarEvent } from '@/types/api'

export const useCalendarStore = defineStore('calendar', () => {
  // State
  const events = ref<CalendarEvent[]>([])
  const currentEvent = ref<CalendarEvent | null>(null)
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
  const calendarView = ref<'month' | 'week' | 'day'>('month')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publicEvents = computed(() => 
    events.value.filter(event => event.isPublic)
  )

  const eventsByDate = computed(() => {
    const eventMap: Record<string, CalendarEvent[]> = {}
    events.value.forEach(event => {
      const date = event.startTime.split('T')[0]
      if (!eventMap[date]) {
        eventMap[date] = []
      }
      eventMap[date].push(event)
    })
    return eventMap
  })

  const todayEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return eventsByDate.value[today] || []
  })

  const upcomingEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.value
      .filter(event => event.startTime.split('T')[0] >= today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5)
  })

  const allDayEvents = computed(() =>
    events.value.filter(event => event.isAllDay)
  )

  // Actions
  async function fetchEvents() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      events.value = []
    } catch (err) {
      error.value = 'Failed to fetch events'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEventById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentEvent.value = null
    } catch (err) {
      error.value = 'Failed to fetch event'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEventsByDateRange(startDate: string, endDate: string) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch events by date range'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPublicEvents() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch public events'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createEvent(eventData: Partial<CalendarEvent>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create event'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(id: number, eventData: Partial<CalendarEvent>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update event'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEvent(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete event'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date
  }

  function setCalendarView(view: 'month' | 'week' | 'day') {
    calendarView.value = view
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentEvent() {
    currentEvent.value = null
  }

  return {
    // State
    events,
    currentEvent,
    selectedDate,
    calendarView,
    isLoading,
    error,
    // Getters
    publicEvents,
    eventsByDate,
    todayEvents,
    upcomingEvents,
    allDayEvents,
    // Actions
    fetchEvents,
    fetchEventById,
    fetchEventsByDateRange,
    fetchPublicEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setSelectedDate,
    setCalendarView,
    clearError,
    clearCurrentEvent,
  }
})
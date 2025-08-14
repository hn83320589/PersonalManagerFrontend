import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GuestBookEntry } from '@/types/api'

export const useCommentStore = defineStore('comment', () => {
  // State
  const entries = ref<GuestBookEntry[]>([])
  const currentEntry = ref<GuestBookEntry | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publicEntries = computed(() => 
    entries.value.filter(entry => entry.isPublic && entry.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  const pendingEntries = computed(() => 
    entries.value.filter(entry => !entry.isApproved)
  )

  const approvedEntries = computed(() => 
    entries.value.filter(entry => entry.isApproved)
  )

  const topLevelEntries = computed(() => 
    publicEntries.value.filter(entry => !entry.parentId)
  )

  const recentEntries = computed(() => 
    publicEntries.value.slice(0, 10)
  )

  // Helper function to get replies for a specific entry
  const getRepliesForEntry = (entryId: number) => {
    return publicEntries.value.filter(entry => entry.parentId === entryId)
  }

  // Actions
  async function fetchEntries() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      entries.value = []
    } catch (err) {
      error.value = 'Failed to fetch guestbook entries'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPublicEntries() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch public entries'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEntryById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentEntry.value = null
    } catch (err) {
      error.value = 'Failed to fetch entry'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createEntry(entryData: Partial<GuestBookEntry>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create entry'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createReply(parentId: number, entryData: Partial<GuestBookEntry>) {
    const replyData = { ...entryData, parentId }
    return await createEntry(replyData)
  }

  async function updateEntry(id: number, entryData: Partial<GuestBookEntry>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update entry'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function approveEntry(id: number) {
    return await updateEntry(id, { isApproved: true })
  }

  async function rejectEntry(id: number) {
    return await updateEntry(id, { isApproved: false })
  }

  async function toggleEntryVisibility(id: number) {
    const entry = entries.value.find(e => e.id === id)
    if (entry) {
      return await updateEntry(id, { isPublic: !entry.isPublic })
    }
    return null
  }

  async function deleteEntry(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete entry'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function moderateEntry(id: number, action: 'approve' | 'reject' | 'delete') {
    switch (action) {
      case 'approve':
        return await approveEntry(id)
      case 'reject':
        return await rejectEntry(id)
      case 'delete':
        return await deleteEntry(id)
      default:
        return false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentEntry() {
    currentEntry.value = null
  }

  return {
    // State
    entries,
    currentEntry,
    isLoading,
    error,
    // Getters
    publicEntries,
    pendingEntries,
    approvedEntries,
    topLevelEntries,
    recentEntries,
    // Helper functions
    getRepliesForEntry,
    // Actions
    fetchEntries,
    fetchPublicEntries,
    fetchEntryById,
    createEntry,
    createReply,
    updateEntry,
    approveEntry,
    rejectEntry,
    toggleEntryVisibility,
    deleteEntry,
    moderateEntry,
    clearError,
    clearCurrentEntry,
  }
})
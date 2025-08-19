<template>
  <div class="calendar-grid">
    <div class="text-center py-8">
      <CalendarDaysIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">月曆檢視</h3>
      <p class="mt-1 text-sm text-gray-500">月曆檢視元件開發中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import type { CalendarEvent } from '@/types/api'

// Props
interface Props {
  events: CalendarEvent[]
  currentDate: Date
}

defineProps<Props>()

// Emits
defineEmits<{
  eventClick: [event: CalendarEvent]
  dateClick: [date: Date]
}>()
</script>
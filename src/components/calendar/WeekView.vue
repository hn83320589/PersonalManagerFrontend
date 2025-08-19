<template>
  <div class="week-view">
    <div class="text-center py-8">
      <TableCellsIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">週曆檢視</h3>
      <p class="mt-1 text-sm text-gray-500">週曆檢視元件開發中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TableCellsIcon } from '@heroicons/vue/24/outline'
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
  timeSlotClick: [date: Date, time: string]
}>()
</script>
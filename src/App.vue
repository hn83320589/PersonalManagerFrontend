<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main content -->
    <main class="flex-1">
      <RouterView />
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Global loading indicator -->
    <LoadingSpinner v-if="isGlobalLoading" full-screen text="載入中..." />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isGlobalLoading = ref(false)

onMounted(() => {
  // Initialize auth state when app starts
  authStore.initializeAuth()
})

// You can use this for global loading states
// For example, during API calls that should show a full-screen loader
function setGlobalLoading(loading: boolean) {
  isGlobalLoading.value = loading
}

// Expose to window for debugging in development
if (import.meta.env.DEV) {
  (window as any).setGlobalLoading = setGlobalLoading
}
</script>

<style>
/* Global styles are handled by Tailwind CSS */
/* Any additional global styles can be added here */
</style>
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <h1 class="text-3xl font-bold text-gray-900">權限管理</h1>
          <p class="mt-2 text-sm text-gray-600">
            管理系統角色與權限設定
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              @click="activeTab = 'roles'"
              :class="[
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              角色管理
            </button>
            <button
              @click="activeTab = 'permissions'"
              :class="[
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              權限管理
            </button>
            <button
              @click="activeTab = 'assign'"
              :class="[
                activeTab === 'assign'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              權限分配
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Roles Tab -->
          <div v-if="activeTab === 'roles'">
            <RolesTab />
          </div>

          <!-- Permissions Tab -->
          <div v-else-if="activeTab === 'permissions'">
            <PermissionsTab />
          </div>

          <!-- Assign Tab -->
          <div v-else-if="activeTab === 'assign'">
            <AssignPermissionsTab />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRbacStore } from '@/stores/rbac'
import RolesTab from '@/components/rbac/RolesTab.vue'
import PermissionsTab from '@/components/rbac/PermissionsTab.vue'
import AssignPermissionsTab from '@/components/rbac/AssignPermissionsTab.vue'

const rbacStore = useRbacStore()
const activeTab = ref<'roles' | 'permissions' | 'assign'>('roles')

onMounted(async () => {
  // Load initial data
  await Promise.all([
    rbacStore.fetchRoles(),
    rbacStore.fetchPermissions()
  ])
})
</script>

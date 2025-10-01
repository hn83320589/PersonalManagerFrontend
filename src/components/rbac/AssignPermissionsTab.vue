<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900">權限分配</h2>
      <p class="mt-1 text-sm text-gray-500">為角色分配與管理權限</p>
    </div>

    <!-- Role Selection -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">選擇角色</label>
      <select
        v-model="selectedRoleId"
        @change="loadRolePermissions"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">請選擇角色...</option>
        <option v-for="role in rbacStore.activeRoles" :key="role.id" :value="role.id">
          {{ role.displayName }} ({{ role.name }})
        </option>
      </select>
    </div>

    <!-- Permission Assignment -->
    <div v-if="selectedRoleId" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Available Permissions -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">可用權限</h3>
          <p class="mt-1 text-sm text-gray-500">選擇要分配的權限</p>
        </div>
        <div class="p-6">
          <input
            v-model="searchAvailable"
            type="text"
            placeholder="搜尋權限..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="permission in availablePermissions"
              :key="permission.id"
              class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              @click="toggleAvailable(permission)"
            >
              <input
                type="checkbox"
                :checked="selectedAvailable.has(permission.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ permission.displayName }}</p>
                <p class="text-xs text-gray-500">{{ permission.name }} - {{ permission.category }}</p>
              </div>
            </div>
            <div v-if="availablePermissions.length === 0" class="text-center py-8 text-gray-500">
              沒有可用的權限
            </div>
          </div>
          <button
            v-if="selectedAvailable.size > 0"
            @click="assignSelected"
            :disabled="isAssigning"
            class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isAssigning ? '處理中...' : `分配選中的權限 (${selectedAvailable.size})` }}
          </button>
        </div>
      </div>

      <!-- Assigned Permissions -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">已分配權限</h3>
          <p class="mt-1 text-sm text-gray-500">角色當前擁有的權限</p>
        </div>
        <div class="p-6">
          <input
            v-model="searchAssigned"
            type="text"
            placeholder="搜尋權限..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="permission in filteredAssigned"
              :key="permission.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ permission.displayName }}</p>
                <p class="text-xs text-gray-500">{{ permission.name }} - {{ permission.category }}</p>
              </div>
              <button
                @click="removePermission(permission)"
                class="text-red-600 hover:text-red-900"
                title="移除權限"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="filteredAssigned.length === 0" class="text-center py-8 text-gray-500">
              尚未分配任何權限
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">請選擇角色</h3>
      <p class="mt-1 text-sm text-gray-500">選擇一個角色以開始管理其權限</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRbacStore } from '@/stores/rbac'
import type { Permission } from '@/services/rbacService'

const rbacStore = useRbacStore()

const selectedRoleId = ref<number | ''>('')
const assignedPermissions = ref<Permission[]>([])
const selectedAvailable = ref<Set<number>>(new Set())
const searchAvailable = ref('')
const searchAssigned = ref('')
const isAssigning = ref(false)

const availablePermissions = computed(() => {
  const assignedIds = new Set(assignedPermissions.value.map(p => p.id))
  let permissions = rbacStore.activePermissions.filter(p => !assignedIds.has(p.id))

  if (searchAvailable.value) {
    const query = searchAvailable.value.toLowerCase()
    permissions = permissions.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.displayName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  return permissions
})

const filteredAssigned = computed(() => {
  let permissions = assignedPermissions.value

  if (searchAssigned.value) {
    const query = searchAssigned.value.toLowerCase()
    permissions = permissions.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.displayName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  return permissions
})

async function loadRolePermissions() {
  if (!selectedRoleId.value) return

  assignedPermissions.value = await rbacStore.fetchRolePermissions(Number(selectedRoleId.value))
  selectedAvailable.value.clear()
}

function toggleAvailable(permission: Permission) {
  if (selectedAvailable.value.has(permission.id)) {
    selectedAvailable.value.delete(permission.id)
  } else {
    selectedAvailable.value.add(permission.id)
  }
}

async function assignSelected() {
  if (!selectedRoleId.value || selectedAvailable.value.size === 0) return

  isAssigning.value = true
  const permissionIds = Array.from(selectedAvailable.value)
  const success = await rbacStore.assignPermissionsToRole(Number(selectedRoleId.value), permissionIds)

  if (success) {
    await loadRolePermissions()
    selectedAvailable.value.clear()
  }

  isAssigning.value = false
}

async function removePermission(permission: Permission) {
  if (!selectedRoleId.value) return

  const confirmed = confirm(`確定要從此角色移除權限「${permission.displayName}」嗎？`)
  if (!confirmed) return

  const success = await rbacStore.removePermissionFromRole(Number(selectedRoleId.value), permission.id)
  if (success) {
    await loadRolePermissions()
  }
}
</script>

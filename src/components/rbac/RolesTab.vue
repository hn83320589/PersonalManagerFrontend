<template>
  <div>
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">角色管理</h2>
        <p class="mt-1 text-sm text-gray-500">管理系統角色與權限設定</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增角色
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋角色名稱..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select
        v-model="filterType"
        class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">所有角色</option>
        <option value="active">啟用中</option>
        <option value="inactive">已停用</option>
        <option value="system">系統角色</option>
        <option value="custom">自訂角色</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="rbacStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="rbacStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ rbacStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Roles Table -->
    <div v-else class="bg-white shadow overflow-hidden rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              角色名稱
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              顯示名稱
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              優先級
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              權限數量
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              使用者數量
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              狀態
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              類型
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ role.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ role.displayName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ role.priority }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ role.permissionCount }} 個權限
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ role.userCount }} 位使用者
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="toggleStatus(role)"
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  role.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                ]"
              >
                {{ role.isActive ? '啟用中' : '已停用' }}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  role.isSystemRole
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ role.isSystemRole ? '系統角色' : '自訂角色' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewPermissions(role)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="查看權限"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                @click="openEditModal(role)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
                title="編輯"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                v-if="!role.isSystemRole"
                @click="confirmDelete(role)"
                class="text-red-600 hover:text-red-900"
                title="刪除"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredRoles.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到角色</h3>
        <p class="mt-1 text-sm text-gray-500">請調整搜尋條件或新增新的角色</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ editingRole ? '編輯角色' : '新增角色' }}
            </h3>

            <form @submit.prevent="saveRole" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">角色名稱 *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="例如：editor"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">顯示名稱 *</label>
                <input
                  v-model="formData.displayName"
                  type="text"
                  required
                  placeholder="例如：編輯者"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  placeholder="角色的詳細描述..."
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">優先級</label>
                <input
                  v-model.number="formData.priority"
                  type="number"
                  min="1"
                  placeholder="數字越小優先級越高"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div v-if="editingRole" class="flex items-center">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  id="isActive"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="isActive" class="ml-2 block text-sm text-gray-900">
                  啟用此角色
                </label>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="rbacStore.isLoading"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ rbacStore.isLoading ? '處理中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteConfirm = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  確認刪除角色
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    確定要刪除角色「{{ roleToDelete?.displayName }}」嗎？此操作無法復原。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deleteRole"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              確認刪除
            </button>
            <button
              @click="showDeleteConfirm = false"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Permissions Modal -->
    <div v-if="showPermissionsModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showPermissionsModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ viewingRole?.displayName }} - 權限列表
            </h3>

            <div v-if="rolePermissions.length === 0" class="text-center py-8 text-gray-500">
              此角色尚未分配任何權限
            </div>

            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="permission in rolePermissions"
                :key="permission.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ permission.displayName }}</p>
                  <p class="text-xs text-gray-500">{{ permission.name }}</p>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ permission.category }}
                </span>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="showPermissionsModal = false"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRbacStore } from '@/stores/rbac'
import type { Role, CreateRoleDto, UpdateRoleDto, Permission } from '@/services/rbacService'

const rbacStore = useRbacStore()

const searchQuery = ref('')
const filterType = ref<'all' | 'active' | 'inactive' | 'system' | 'custom'>('all')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const showPermissionsModal = ref(false)
const editingRole = ref<Role | null>(null)
const roleToDelete = ref<Role | null>(null)
const viewingRole = ref<Role | null>(null)
const rolePermissions = ref<Permission[]>([])

const formData = ref<CreateRoleDto & { isActive?: boolean }>({
  name: '',
  displayName: '',
  description: '',
  priority: 100,
  isActive: true
})

const filteredRoles = computed(() => {
  let roles = rbacStore.roles

  // Filter by type
  if (filterType.value === 'active') {
    roles = roles.filter(r => r.isActive)
  } else if (filterType.value === 'inactive') {
    roles = roles.filter(r => !r.isActive)
  } else if (filterType.value === 'system') {
    roles = roles.filter(r => r.isSystemRole)
  } else if (filterType.value === 'custom') {
    roles = roles.filter(r => !r.isSystemRole)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    roles = roles.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.displayName.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query))
    )
  }

  return roles.sort((a, b) => a.priority - b.priority)
})

function openCreateModal() {
  editingRole.value = null
  formData.value = {
    name: '',
    displayName: '',
    description: '',
    priority: 100,
    isActive: true
  }
  showModal.value = true
}

function openEditModal(role: Role) {
  editingRole.value = role
  formData.value = {
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    priority: role.priority,
    isActive: role.isActive
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingRole.value = null
  rbacStore.clearError()
}

async function saveRole() {
  if (editingRole.value) {
    // Update existing role
    const dto: UpdateRoleDto = {
      name: formData.value.name,
      displayName: formData.value.displayName,
      description: formData.value.description,
      priority: formData.value.priority,
      isActive: formData.value.isActive
    }
    const success = await rbacStore.updateRole(editingRole.value.id, dto)
    if (success) {
      closeModal()
    }
  } else {
    // Create new role
    const dto: CreateRoleDto = {
      name: formData.value.name,
      displayName: formData.value.displayName,
      description: formData.value.description,
      priority: formData.value.priority
    }
    const success = await rbacStore.createRole(dto)
    if (success) {
      closeModal()
    }
  }
}

function confirmDelete(role: Role) {
  roleToDelete.value = role
  showDeleteConfirm.value = true
}

async function deleteRole() {
  if (roleToDelete.value) {
    const success = await rbacStore.deleteRole(roleToDelete.value.id)
    if (success) {
      showDeleteConfirm.value = false
      roleToDelete.value = null
    }
  }
}

async function toggleStatus(role: Role) {
  await rbacStore.toggleRoleStatus(role.id, !role.isActive)
}

async function viewPermissions(role: Role) {
  viewingRole.value = role
  rolePermissions.value = await rbacStore.fetchRolePermissions(role.id)
  showPermissionsModal.value = true
}
</script>

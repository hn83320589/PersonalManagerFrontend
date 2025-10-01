<template>
  <div>
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">權限管理</h2>
        <p class="mt-1 text-sm text-gray-500">管理系統權限與存取控制</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增權限
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋權限名稱..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select
        v-model="filterCategory"
        class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">所有分類</option>
        <option v-for="category in rbacStore.categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">所有狀態</option>
        <option value="active">啟用中</option>
        <option value="inactive">已停用</option>
      </select>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500">總權限數</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900">{{ rbacStore.permissions.length }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500">啟用中</div>
        <div class="mt-1 text-2xl font-semibold text-green-600">{{ rbacStore.activePermissions.length }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500">分類數量</div>
        <div class="mt-1 text-2xl font-semibold text-blue-600">{{ rbacStore.categories.length }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500">資源數量</div>
        <div class="mt-1 text-2xl font-semibold text-purple-600">{{ rbacStore.resources.length }}</div>
      </div>
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

    <!-- Permissions Table -->
    <div v-else class="bg-white shadow overflow-hidden rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              權限名稱
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              顯示名稱
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              分類
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              資源
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              動作
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
          <tr v-for="permission in filteredPermissions" :key="permission.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ permission.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ permission.displayName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ permission.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ permission.resource }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {{ permission.actionName }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="toggleStatus(permission)"
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  permission.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                ]"
              >
                {{ permission.isActive ? '啟用中' : '已停用' }}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  permission.isSystemPermission
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ permission.isSystemPermission ? '系統權限' : '自訂權限' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="openEditModal(permission)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
                title="編輯"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                v-if="!permission.isSystemPermission"
                @click="confirmDelete(permission)"
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
      <div v-if="filteredPermissions.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到權限</h3>
        <p class="mt-1 text-sm text-gray-500">請調整搜尋條件或新增新的權限</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ editingPermission ? '編輯權限' : '新增權限' }}
            </h3>

            <form @submit.prevent="savePermission" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">權限名稱 *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="例如：users.create"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">格式：resource.action（例如：users.create）</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">顯示名稱 *</label>
                <input
                  v-model="formData.displayName"
                  type="text"
                  required
                  placeholder="例如：建立使用者"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  v-model="formData.description"
                  rows="2"
                  placeholder="權限的詳細描述..."
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">分類 *</label>
                  <input
                    v-model="formData.category"
                    type="text"
                    required
                    placeholder="例如：使用者管理"
                    list="categories"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <datalist id="categories">
                    <option v-for="cat in rbacStore.categories" :key="cat" :value="cat" />
                  </datalist>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">資源 *</label>
                  <input
                    v-model="formData.resource"
                    type="text"
                    required
                    placeholder="例如：Users"
                    list="resources"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <datalist id="resources">
                    <option v-for="res in rbacStore.resources" :key="res" :value="res" />
                  </datalist>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">動作類型 *</label>
                <select
                  v-model.number="formData.action"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option :value="1">Create (建立)</option>
                  <option :value="2">Read (讀取)</option>
                  <option :value="3">Update (更新)</option>
                  <option :value="4">Delete (刪除)</option>
                  <option :value="5">Manage (管理)</option>
                  <option :value="6">Execute (執行)</option>
                  <option :value="7">Export (匯出)</option>
                  <option :value="8">Import (匯入)</option>
                  <option :value="9">Publish (發布)</option>
                  <option :value="10">Approve (審核)</option>
                </select>
              </div>

              <div v-if="editingPermission" class="flex items-center">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  id="permIsActive"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="permIsActive" class="ml-2 block text-sm text-gray-900">
                  啟用此權限
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
                  確認刪除權限
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    確定要刪除權限「{{ permissionToDelete?.displayName }}」嗎？此操作無法復原。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deletePermission"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              確認刪除
            </button>
            <button
              @click="showDeleteConfirm = false"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              取消
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
import type { Permission, CreatePermissionDto, UpdatePermissionDto } from '@/services/rbacService'

const rbacStore = useRbacStore()

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingPermission = ref<Permission | null>(null)
const permissionToDelete = ref<Permission | null>(null)

const formData = ref<CreatePermissionDto & { isActive?: boolean }>({
  name: '',
  displayName: '',
  description: '',
  category: '',
  action: 2,
  resource: '',
  isActive: true
})

const filteredPermissions = computed(() => {
  let permissions = rbacStore.permissions

  // Filter by status
  if (filterStatus.value === 'active') {
    permissions = permissions.filter(p => p.isActive)
  } else if (filterStatus.value === 'inactive') {
    permissions = permissions.filter(p => !p.isActive)
  }

  // Filter by category
  if (filterCategory.value) {
    permissions = permissions.filter(p => p.category === filterCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    permissions = permissions.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.displayName.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      p.resource.toLowerCase().includes(query)
    )
  }

  return permissions
})

function openCreateModal() {
  editingPermission.value = null
  formData.value = {
    name: '',
    displayName: '',
    description: '',
    category: '',
    action: 2,
    resource: '',
    isActive: true
  }
  showModal.value = true
}

function openEditModal(permission: Permission) {
  editingPermission.value = permission
  formData.value = {
    name: permission.name,
    displayName: permission.displayName,
    description: permission.description,
    category: permission.category,
    action: permission.action,
    resource: permission.resource,
    isActive: permission.isActive
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPermission.value = null
  rbacStore.clearError()
}

async function savePermission() {
  if (editingPermission.value) {
    // Update existing permission
    const dto: UpdatePermissionDto = {
      name: formData.value.name,
      displayName: formData.value.displayName,
      description: formData.value.description,
      category: formData.value.category,
      action: formData.value.action,
      resource: formData.value.resource,
      isActive: formData.value.isActive
    }
    const success = await rbacStore.updatePermission(editingPermission.value.id, dto)
    if (success) {
      closeModal()
    }
  } else {
    // Create new permission
    const dto: CreatePermissionDto = {
      name: formData.value.name,
      displayName: formData.value.displayName,
      description: formData.value.description,
      category: formData.value.category,
      action: formData.value.action,
      resource: formData.value.resource
    }
    const success = await rbacStore.createPermission(dto)
    if (success) {
      closeModal()
    }
  }
}

function confirmDelete(permission: Permission) {
  permissionToDelete.value = permission
  showDeleteConfirm.value = true
}

async function deletePermission() {
  if (permissionToDelete.value) {
    const success = await rbacStore.deletePermission(permissionToDelete.value.id)
    if (success) {
      showDeleteConfirm.value = false
      permissionToDelete.value = null
    }
  }
}

async function toggleStatus(permission: Permission) {
  await rbacStore.togglePermissionStatus(permission.id, !permission.isActive)
}
</script>

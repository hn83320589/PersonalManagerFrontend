import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import rbacService, { type Role, type Permission, type CreateRoleDto, type UpdateRoleDto, type CreatePermissionDto, type UpdatePermissionDto, type AssignPermissionsDto } from '@/services/rbacService'

export const useRbacStore = defineStore('rbac', () => {
  // State
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const selectedRole = ref<Role | null>(null)
  const selectedPermission = ref<Permission | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeRoles = computed(() => roles.value.filter(role => role.isActive))
  const inactiveRoles = computed(() => roles.value.filter(role => !role.isActive))
  const systemRoles = computed(() => roles.value.filter(role => role.isSystemRole))
  const customRoles = computed(() => roles.value.filter(role => !role.isSystemRole))

  const activePermissions = computed(() => permissions.value.filter(perm => perm.isActive))
  const inactivePermissions = computed(() => permissions.value.filter(perm => !perm.isActive))

  const permissionsByCategory = computed(() => {
    const categoryMap = new Map<string, Permission[]>()
    permissions.value.forEach(permission => {
      const category = permission.category || '未分類'
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category)!.push(permission)
    })
    return categoryMap
  })

  const permissionsByResource = computed(() => {
    const resourceMap = new Map<string, Permission[]>()
    permissions.value.forEach(permission => {
      const resource = permission.resource || '未分類'
      if (!resourceMap.has(resource)) {
        resourceMap.set(resource, [])
      }
      resourceMap.get(resource)!.push(permission)
    })
    return resourceMap
  })

  const categories = computed(() => {
    return Array.from(new Set(permissions.value.map(p => p.category))).sort()
  })

  const resources = computed(() => {
    return Array.from(new Set(permissions.value.map(p => p.resource))).sort()
  })

  // Role Actions
  async function fetchRoles() {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.getAllRoles()
      if (response.success && response.data) {
        roles.value = response.data
      } else {
        error.value = response.message || '取得角色列表失敗'
      }
    } catch (err) {
      console.error('Fetch roles error:', err)
      error.value = '網路錯誤，無法取得角色列表'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRoleById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.getRoleById(id)
      if (response.success && response.data) {
        selectedRole.value = response.data
        return response.data
      } else {
        error.value = response.message || '取得角色失敗'
        return null
      }
    } catch (err) {
      console.error('Fetch role error:', err)
      error.value = '網路錯誤，無法取得角色'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createRole(dto: CreateRoleDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.createRole(dto)
      if (response.success && response.data) {
        roles.value.push(response.data)
        return true
      } else {
        error.value = response.message || '建立角色失敗'
        return false
      }
    } catch (err) {
      console.error('Create role error:', err)
      error.value = '網路錯誤，無法建立角色'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateRole(id: number, dto: UpdateRoleDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.updateRole(id, dto)
      if (response.success && response.data) {
        const index = roles.value.findIndex(r => r.id === id)
        if (index !== -1) {
          roles.value[index] = response.data
        }
        if (selectedRole.value?.id === id) {
          selectedRole.value = response.data
        }
        return true
      } else {
        error.value = response.message || '更新角色失敗'
        return false
      }
    } catch (err) {
      console.error('Update role error:', err)
      error.value = '網路錯誤，無法更新角色'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRole(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.deleteRole(id)
      if (response.success) {
        roles.value = roles.value.filter(r => r.id !== id)
        if (selectedRole.value?.id === id) {
          selectedRole.value = null
        }
        return true
      } else {
        error.value = response.message || '刪除角色失敗'
        return false
      }
    } catch (err) {
      console.error('Delete role error:', err)
      error.value = '網路錯誤，無法刪除角色'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRolePermissions(roleId: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.getRolePermissions(roleId)
      if (response.success && response.data) {
        return response.data
      } else {
        error.value = response.message || '取得角色權限失敗'
        return []
      }
    } catch (err) {
      console.error('Fetch role permissions error:', err)
      error.value = '網路錯誤，無法取得角色權限'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    isLoading.value = true
    error.value = null
    try {
      const dto: AssignPermissionsDto = { permissionIds }
      const response = await rbacService.assignPermissionsToRole(roleId, dto)
      if (response.success) {
        // Refresh role to get updated permission count
        await fetchRoleById(roleId)
        return true
      } else {
        error.value = response.message || '分配權限失敗'
        return false
      }
    } catch (err) {
      console.error('Assign permissions error:', err)
      error.value = '網路錯誤，無法分配權限'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function removePermissionFromRole(roleId: number, permissionId: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.removePermissionFromRole(roleId, permissionId)
      if (response.success) {
        // Refresh role to get updated permission count
        await fetchRoleById(roleId)
        return true
      } else {
        error.value = response.message || '移除權限失敗'
        return false
      }
    } catch (err) {
      console.error('Remove permission error:', err)
      error.value = '網路錯誤，無法移除權限'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function toggleRoleStatus(id: number, isActive: boolean) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.toggleRoleStatus(id, isActive)
      if (response.success && response.data) {
        const index = roles.value.findIndex(r => r.id === id)
        if (index !== -1) {
          roles.value[index] = response.data
        }
        return true
      } else {
        error.value = response.message || '切換角色狀態失敗'
        return false
      }
    } catch (err) {
      console.error('Toggle role status error:', err)
      error.value = '網路錯誤，無法切換角色狀態'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Permission Actions
  async function fetchPermissions() {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.getAllPermissions()
      if (response.success && response.data) {
        permissions.value = response.data
      } else {
        error.value = response.message || '取得權限列表失敗'
      }
    } catch (err) {
      console.error('Fetch permissions error:', err)
      error.value = '網路錯誤，無法取得權限列表'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPermissionById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.getPermissionById(id)
      if (response.success && response.data) {
        selectedPermission.value = response.data
        return response.data
      } else {
        error.value = response.message || '取得權限失敗'
        return null
      }
    } catch (err) {
      console.error('Fetch permission error:', err)
      error.value = '網路錯誤，無法取得權限'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createPermission(dto: CreatePermissionDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.createPermission(dto)
      if (response.success && response.data) {
        permissions.value.push(response.data)
        return true
      } else {
        error.value = response.message || '建立權限失敗'
        return false
      }
    } catch (err) {
      console.error('Create permission error:', err)
      error.value = '網路錯誤，無法建立權限'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updatePermission(id: number, dto: UpdatePermissionDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.updatePermission(id, dto)
      if (response.success && response.data) {
        const index = permissions.value.findIndex(p => p.id === id)
        if (index !== -1) {
          permissions.value[index] = response.data
        }
        if (selectedPermission.value?.id === id) {
          selectedPermission.value = response.data
        }
        return true
      } else {
        error.value = response.message || '更新權限失敗'
        return false
      }
    } catch (err) {
      console.error('Update permission error:', err)
      error.value = '網路錯誤，無法更新權限'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deletePermission(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.deletePermission(id)
      if (response.success) {
        permissions.value = permissions.value.filter(p => p.id !== id)
        if (selectedPermission.value?.id === id) {
          selectedPermission.value = null
        }
        return true
      } else {
        error.value = response.message || '刪除權限失敗'
        return false
      }
    } catch (err) {
      console.error('Delete permission error:', err)
      error.value = '網路錯誤，無法刪除權限'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function togglePermissionStatus(id: number, isActive: boolean) {
    isLoading.value = true
    error.value = null
    try {
      const response = await rbacService.togglePermissionStatus(id, isActive)
      if (response.success && response.data) {
        const index = permissions.value.findIndex(p => p.id === id)
        if (index !== -1) {
          permissions.value[index] = response.data
        }
        return true
      } else {
        error.value = response.message || '切換權限狀態失敗'
        return false
      }
    } catch (err) {
      console.error('Toggle permission status error:', err)
      error.value = '網路錯誤，無法切換權限狀態'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearSelection() {
    selectedRole.value = null
    selectedPermission.value = null
  }

  return {
    // State
    roles,
    permissions,
    selectedRole,
    selectedPermission,
    isLoading,
    error,
    // Computed
    activeRoles,
    inactiveRoles,
    systemRoles,
    customRoles,
    activePermissions,
    inactivePermissions,
    permissionsByCategory,
    permissionsByResource,
    categories,
    resources,
    // Actions
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    fetchRolePermissions,
    assignPermissionsToRole,
    removePermissionFromRole,
    toggleRoleStatus,
    fetchPermissions,
    fetchPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    togglePermissionStatus,
    clearError,
    clearSelection,
  }
})

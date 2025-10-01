import httpService from './http'
import type { ApiResponse } from '@/types/api'

// Role Types
export interface Role {
  id: number
  name: string
  displayName: string
  description?: string
  isSystemRole: boolean
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdById?: number
  updatedById?: number
  permissionCount: number
  userCount: number
}

export interface CreateRoleDto {
  name: string
  displayName: string
  description?: string
  priority?: number
}

export interface UpdateRoleDto {
  name?: string
  displayName?: string
  description?: string
  priority?: number
  isActive?: boolean
}

export interface AssignPermissionsDto {
  permissionIds: number[]
}

// Permission Types
export interface Permission {
  id: number
  name: string
  displayName: string
  description?: string
  category: string
  action: number
  actionName: string
  resource: string
  isSystemPermission: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePermissionDto {
  name: string
  displayName: string
  description?: string
  category: string
  action: number
  resource: string
}

export interface UpdatePermissionDto {
  name?: string
  displayName?: string
  description?: string
  category?: string
  action?: number
  resource?: string
  isActive?: boolean
}

class RbacService {
  // Role API Methods
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return await httpService.get<Role[]>('/roles')
  }

  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    return await httpService.get<Role>(`/roles/${id}`)
  }

  async getRoleByName(name: string): Promise<ApiResponse<Role>> {
    return await httpService.get<Role>(`/roles/by-name/${name}`)
  }

  async createRole(dto: CreateRoleDto, createdById?: number): Promise<ApiResponse<Role>> {
    return await httpService.post<Role>('/roles', dto)
  }

  async updateRole(id: number, dto: UpdateRoleDto, updatedById?: number): Promise<ApiResponse<Role>> {
    return await httpService.put<Role>(`/roles/${id}`, dto)
  }

  async deleteRole(id: number): Promise<ApiResponse<void>> {
    return await httpService.delete<void>(`/roles/${id}`)
  }

  async getRolePermissions(roleId: number): Promise<ApiResponse<Permission[]>> {
    return await httpService.get<Permission[]>(`/roles/${roleId}/permissions`)
  }

  async assignPermissionsToRole(roleId: number, dto: AssignPermissionsDto): Promise<ApiResponse<void>> {
    return await httpService.post<void>(`/roles/${roleId}/permissions`, dto)
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<ApiResponse<void>> {
    return await httpService.delete<void>(`/roles/${roleId}/permissions/${permissionId}`)
  }

  async getRoleUsers(roleId: number): Promise<ApiResponse<any[]>> {
    return await httpService.get<any[]>(`/roles/${roleId}/users`)
  }

  async checkRoleName(name: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    const query = excludeId ? `?excludeId=${excludeId}` : ''
    return await httpService.get<{ exists: boolean }>(`/roles/check-name/${name}${query}`)
  }

  async toggleRoleStatus(id: number, isActive: boolean): Promise<ApiResponse<Role>> {
    return await httpService.patch<Role>(`/roles/${id}/toggle-status`, isActive)
  }

  // Permission API Methods
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return await httpService.get<Permission[]>('/permissions')
  }

  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return await httpService.get<Permission>(`/permissions/${id}`)
  }

  async getPermissionByName(name: string): Promise<ApiResponse<Permission>> {
    return await httpService.get<Permission>(`/permissions/by-name/${name}`)
  }

  async getPermissionsByCategory(category: string): Promise<ApiResponse<Permission[]>> {
    return await httpService.get<Permission[]>(`/permissions/by-category/${category}`)
  }

  async getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>> {
    return await httpService.get<Permission[]>(`/permissions/by-resource/${resource}`)
  }

  async createPermission(dto: CreatePermissionDto): Promise<ApiResponse<Permission>> {
    return await httpService.post<Permission>('/permissions', dto)
  }

  async updatePermission(id: number, dto: UpdatePermissionDto): Promise<ApiResponse<Permission>> {
    return await httpService.put<Permission>(`/permissions/${id}`, dto)
  }

  async deletePermission(id: number): Promise<ApiResponse<void>> {
    return await httpService.delete<void>(`/permissions/${id}`)
  }

  async checkPermissionName(name: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    const query = excludeId ? `?excludeId=${excludeId}` : ''
    return await httpService.get<{ exists: boolean }>(`/permissions/check-name/${name}${query}`)
  }

  async getAllCategories(): Promise<ApiResponse<string[]>> {
    return await httpService.get<string[]>('/permissions/categories')
  }

  async getAllResources(): Promise<ApiResponse<string[]>> {
    return await httpService.get<string[]>('/permissions/resources')
  }

  async togglePermissionStatus(id: number, isActive: boolean): Promise<ApiResponse<Permission>> {
    return await httpService.patch<Permission>(`/permissions/${id}/toggle-status`, isActive)
  }
}

export const rbacService = new RbacService()
export default rbacService

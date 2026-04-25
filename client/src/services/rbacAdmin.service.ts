import axiosBase from '@/services/axios/AxiosBase'

export type ModuleDto = {
  id: string
  code: string | null
  name: string
  sortOrder: number
  isShow: boolean
  icon: string | null
  classCss: string | null
  styleCss: string | null
  link: string | null
  allowFilterScope: boolean | null
  isMobile: boolean | null
  createdAt: string
}

export type OperationDto = {
  id: string
  moduleId: string
  moduleName: string | null
  name: string
  url: string
  code: string
  css: string | null
  isShow: boolean
  sortOrder: number
  icon: string | null
  createdAt: string
}

export type RoleDto = {
  id: string
  name: string
  code: string
  type: string | null
  isActive: boolean
  createdAt: string
}

export type RoleOperationDto = {
  id: string
  roleId: string
  roleName: string | null
  operationId: string
  operationName: string | null
  isAccess: number
  createdAt: string
}

export type UserRoleDto = {
  id: string
  userId: string
  userEmail: string | null
  roleId: string
  roleName: string | null
  createdAt: string
}

export type CreateModuleRequest = {
  code?: string | null
  name: string
  sortOrder?: number
  isShow?: boolean
  icon?: string | null
  classCss?: string | null
  styleCss?: string | null
  link?: string | null
  allowFilterScope?: boolean | null
  isMobile?: boolean | null
}

export type UpdateModuleRequest = CreateModuleRequest

export type CreateOperationRequest = {
  moduleId: string
  name: string
  url: string
  code: string
  css?: string | null
  isShow?: boolean
  sortOrder?: number
  icon?: string | null
}

export type UpdateOperationRequest = CreateOperationRequest

export type CreateRoleRequest = {
  name: string
  code: string
  type?: string | null
  isActive?: boolean
}

export type UpdateRoleRequest = CreateRoleRequest

export const rbacAdminApi = {
  modules: {
    async list(): Promise<ModuleDto[]> {
      const response = await axiosBase.get<ModuleDto[]>('/api/admin/modules')
      return response.data
    },
    async create(body: CreateModuleRequest): Promise<ModuleDto> {
      const response = await axiosBase.post<ModuleDto>('/api/admin/modules', body)
      return response.data
    },
    async update(id: string, body: UpdateModuleRequest): Promise<ModuleDto> {
      const response = await axiosBase.post<ModuleDto>(`/api/admin/modules/${id}/update`, body)
      return response.data
    },
    async remove(id: string): Promise<void> {
      const response = await axiosBase.post<void>(`/api/admin/modules/${id}/delete`)
      return response.data
    },
  },
  operations: {
    async list(moduleId: string): Promise<OperationDto[]> {
      const response = await axiosBase.get<OperationDto[]>(
        `/api/admin/operations?moduleId=${encodeURIComponent(moduleId)}`
      )
      return response.data
    },
    async create(body: CreateOperationRequest): Promise<OperationDto> {
      const response = await axiosBase.post<OperationDto>('/api/admin/operations', body)
      return response.data
    },
    async update(id: string, body: UpdateOperationRequest): Promise<OperationDto> {
      const response = await axiosBase.post<OperationDto>(`/api/admin/operations/${id}/update`, body)
      return response.data
    },
    async remove(id: string): Promise<void> {
      const response = await axiosBase.post<void>(`/api/admin/operations/${id}/delete`)
      return response.data
    },
  },
  roles: {
    async list(): Promise<RoleDto[]> {
      const response = await axiosBase.get<RoleDto[]>('/api/admin/roles')
      return response.data
    },
    async create(body: CreateRoleRequest): Promise<RoleDto> {
      const response = await axiosBase.post<RoleDto>('/api/admin/roles', body)
      return response.data
    },
    async update(id: string, body: UpdateRoleRequest): Promise<RoleDto> {
      const response = await axiosBase.post<RoleDto>(`/api/admin/roles/${id}/update`, body)
      return response.data
    },
    async remove(id: string): Promise<void> {
      const response = await axiosBase.post<void>(`/api/admin/roles/${id}/delete`)
      return response.data
    },
  },
  roleOperations: {
    async list(): Promise<RoleOperationDto[]> {
      const response = await axiosBase.get<RoleOperationDto[]>('/api/admin/role-operations')
      return response.data
    },
    async listByRoleId(roleId: string): Promise<RoleOperationDto[]> {
      const response = await axiosBase.get<RoleOperationDto[]>(`/api/admin/role-operations/role/${roleId}`)
      return response.data
    },
    async setRolePermissions(roleId: string, operationIds: string[]): Promise<void> {
      await axiosBase.post(`/api/admin/role-operations/role/${roleId}/set-permissions`, operationIds)
    },
    async create(body: Record<string, unknown>): Promise<RoleOperationDto> {
      const response = await axiosBase.post<RoleOperationDto>('/api/admin/role-operations', body)
      return response.data
    },
    async update(id: string, body: Record<string, unknown>): Promise<RoleOperationDto> {
      const response = await axiosBase.post<RoleOperationDto>(`/api/admin/role-operations/${id}/update`, body)
      return response.data
    },
    async remove(id: string): Promise<void> {
      const response = await axiosBase.post<void>(`/api/admin/role-operations/${id}/delete`)
      return response.data
    },
  },
  userRoles: {
    async list(): Promise<UserRoleDto[]> {
      const response = await axiosBase.get<UserRoleDto[]>('/api/admin/user-roles')
      return response.data
    },
    async listByUserId(userId: string): Promise<UserRoleDto[]> {
      const response = await axiosBase.get<UserRoleDto[]>(`/api/admin/user-roles/user/${userId}`)
      return response.data
    },
    async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
      await axiosBase.post(`/api/admin/user-roles/user/${userId}/set-roles`, roleIds)
    },
    async create(body: Record<string, unknown>): Promise<UserRoleDto> {
      const response = await axiosBase.post<UserRoleDto>('/api/admin/user-roles', body)
      return response.data
    },
    async remove(id: string): Promise<void> {
      const response = await axiosBase.post<void>(`/api/admin/user-roles/${id}/delete`)
      return response.data
    },
  },
}

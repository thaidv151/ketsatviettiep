import { http } from '@/services/http'

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
    list: () => http.get<ModuleDto[]>('/api/admin/modules'),
    create: (body: CreateModuleRequest) =>
      http.post<ModuleDto>('/api/admin/modules', body),
    update: (id: string, body: UpdateModuleRequest) =>
      http.post<ModuleDto>(`/api/admin/modules/${id}/update`, body),
    remove: (id: string) => http.post<void>(`/api/admin/modules/${id}/delete`),
  },
  operations: {
    list: (moduleId: string) =>
      http.get<OperationDto[]>(
        `/api/admin/operations?moduleId=${encodeURIComponent(moduleId)}`,
      ),
    create: (body: CreateOperationRequest) =>
      http.post<OperationDto>('/api/admin/operations', body),
    update: (id: string, body: UpdateOperationRequest) =>
      http.post<OperationDto>(`/api/admin/operations/${id}/update`, body),
    remove: (id: string) => http.post<void>(`/api/admin/operations/${id}/delete`),
  },
  roles: {
    list: () => http.get<RoleDto[]>('/api/admin/roles'),
    create: (body: CreateRoleRequest) =>
      http.post<RoleDto>('/api/admin/roles', body),
    update: (id: string, body: UpdateRoleRequest) =>
      http.post<RoleDto>(`/api/admin/roles/${id}/update`, body),
    remove: (id: string) => http.post<void>(`/api/admin/roles/${id}/delete`),
  },
  roleOperations: {
    list: () => http.get<RoleOperationDto[]>('/api/admin/role-operations'),
    create: (body: Record<string, unknown>) =>
      http.post<RoleOperationDto>('/api/admin/role-operations', body),
    update: (id: string, body: Record<string, unknown>) =>
      http.post<RoleOperationDto>(`/api/admin/role-operations/${id}/update`, body),
    remove: (id: string) => http.post<void>(`/api/admin/role-operations/${id}/delete`),
  },
  userRoles: {
    list: () => http.get<UserRoleDto[]>('/api/admin/user-roles'),
    create: (body: Record<string, unknown>) =>
      http.post<UserRoleDto>('/api/admin/user-roles', body),
    remove: (id: string) => http.post<void>(`/api/admin/user-roles/${id}/delete`),
  },
}

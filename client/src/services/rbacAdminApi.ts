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

export const rbacAdminApi = {
  modules: {
    list: () => http.get<ModuleDto[]>('/api/admin/modules'),
    create: (body: Record<string, unknown>) =>
      http.post<ModuleDto>('/api/admin/modules', body),
    update: (id: string, body: Record<string, unknown>) =>
      http.put<ModuleDto>(`/api/admin/modules/${id}`, body),
    remove: (id: string) => http.delete(`/api/admin/modules/${id}`),
  },
  operations: {
    list: () => http.get<OperationDto[]>('/api/admin/operations').then(json),
    create: (body: Record<string, unknown>) =>
      http.post<OperationDto>('/api/admin/operations', body).then(json),
    update: (id: string, body: Record<string, unknown>) =>
      http.put<OperationDto>(`/api/admin/operations/${id}`, body).then(json),
    remove: (id: string) => http.delete(`/api/admin/operations/${id}`),
  },
  roles: {
    list: () => http.get<RoleDto[]>('/api/admin/roles'),
    create: (body: Record<string, unknown>) =>
      http.post<RoleDto>('/api/admin/roles', body),
    update: (id: string, body: Record<string, unknown>) =>
      http.put<RoleDto>(`/api/admin/roles/${id}`, body),
    remove: (id: string) => http.delete(`/api/admin/roles/${id}`),
  },
  roleOperations: {
    list: () => http.get<RoleOperationDto[]>('/api/admin/role-operations'),
    create: (body: Record<string, unknown>) =>
      http.post<RoleOperationDto>('/api/admin/role-operations', body),
    update: (id: string, body: Record<string, unknown>) =>
      http.put<RoleOperationDto>(`/api/admin/role-operations/${id}`, body),
    remove: (id: string) => http.delete(`/api/admin/role-operations/${id}`),
  },
  userRoles: {
    list: () => http.get<UserRoleDto[]>('/api/admin/user-roles'),
    create: (body: Record<string, unknown>) =>
      http.post<UserRoleDto>('/api/admin/user-roles', body),
    remove: (id: string) => http.delete(`/api/admin/user-roles/${id}`),
  },
}

import { http } from './http'

export type AppUserDto = {
  id: string
  email: string
  username: string | null
  fullName: string | null
  phoneNumber: string | null
  gender: number | null
  isLocked: boolean
  emailConfirmed: boolean
  isFirstLogin: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string | null
}

export type AppUserDetailDto = {
  id: string
  email: string
  username: string | null
  fullName: string | null
  phoneNumber: string | null
  ngaySinh: string | null
  gender: number | null
  avatar: string | null
  province: string | null
  district: string | null
  ward: string | null
  addressDetail: string | null
  emailConfirmed: boolean
  accessFailedCount: number
  lockoutEnd: string | null
  isLocked: boolean
  isFirstLogin: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string | null
}

export type CreateAppUserRequest = {
  email: string
  username: string
  fullName?: string | null
  ngaySinh?: string | null
  gender?: number | null
  avatar?: string | null
  phoneNumber?: string | null
  province?: string | null
  district?: string | null
  ward?: string | null
  addressDetail?: string | null
  password: string
}

export type UpdateAppUserRequest = {
  email: string
  username: string
  fullName?: string | null
  ngaySinh?: string | null
  gender?: number | null
  avatar?: string | null
  phoneNumber?: string | null
  province?: string | null
  district?: string | null
  ward?: string | null
  addressDetail?: string | null
  newPassword?: string | null
  emailConfirmed: boolean
  isLocked: boolean
  isFirstLogin: boolean
}

export const appUserApi = {
  list: () => http.get<AppUserDto[]>('/api/AppUsers'),
  getById: (id: string) => http.get<AppUserDto>(`/api/AppUsers/${id}`),
  getDetail: (id: string) =>
    http.get<AppUserDetailDto>(`/api/AppUsers/${id}/detail`),
  create: (body: CreateAppUserRequest) =>
    http.post<AppUserDto>('/api/AppUsers', body),
  update: (id: string, body: UpdateAppUserRequest) =>
    http.post<AppUserDetailDto>(`/api/AppUsers/${id}/update`, body),
  remove: (id: string) => http.post<void>(`/api/AppUsers/${id}/delete`),
}

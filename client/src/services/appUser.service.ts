import axiosBase from './axios/AxiosBase'

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
  async list(): Promise<AppUserDto[]> {
    const response = await axiosBase.get<AppUserDto[]>('/api/AppUsers')
    return response.data
  },
  async getById(id: string): Promise<AppUserDto> {
    const response = await axiosBase.get<AppUserDto>(`/api/AppUsers/${id}`)
    return response.data
  },
  async getDetail(id: string): Promise<AppUserDetailDto> {
    const response = await axiosBase.get<AppUserDetailDto>(`/api/AppUsers/${id}/detail`)
    return response.data
  },
  async create(body: CreateAppUserRequest): Promise<AppUserDto> {
    const response = await axiosBase.post<AppUserDto>('/api/AppUsers', body)
    return response.data
  },
  async update(id: string, body: UpdateAppUserRequest): Promise<AppUserDetailDto> {
    const response = await axiosBase.post<AppUserDetailDto>(`/api/AppUsers/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/AppUsers/${id}/delete`)
    return response.data
  },
}

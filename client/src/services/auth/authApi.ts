import { http } from '@/services/http'
import type { AppUserDetailDto, AppUserDto } from '@/services/appUser.service'
import type { AdminNavItem } from '@/app/(Managers)/config/adminNav.types'

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  /** Cùng cấu trúc `AppUserDto` — thông tin user sau đăng nhập. */
  user: AppUserDto
  menuItems: AdminNavItem[]
  /** Mã vai trò (Code) gán cho user — dùng để chuyển hướng sau đăng nhập. */
  roleCodes: string[]
}

/** `/api/auth/me` — thông tin user và menu động. */
export type MeResponse = {
  user: AppUserDto
  menuItems: AdminNavItem[]
  roleCodes: string[]
}

export type RegisterResponse = {
  id: string
  email: string
  username: string | null
}

/** Đăng nhập — gửi `email` hoặc `username` (ưu tiên username nếu cả hai có). */
export async function loginRequest(payload: {
  email?: string
  username?: string
  password: string
}) {
  return http.post<LoginResponse>('/api/auth/login', payload)
}

/** Đăng ký tài khoản công khai. */
export async function registerRequest(body: {
  email: string
  username: string
  password: string
  confirmPassword: string
  fullName: string
  phoneNumber?: string | null
}) {
  return http.post<RegisterResponse>('/api/auth/register', body)
}

export async function meRequest() {
  return http.get<MeResponse>('/api/auth/me')
}

/** Chi tiết hồ sơ (Portals) — cần đăng nhập. */
export async function getProfileRequest() {
  return http.get<AppUserDetailDto>('/api/auth/profile')
}

export type UpdateProfilePayload = {
  email: string
  fullName?: string | null
  phoneNumber?: string | null
  ngaySinh?: string | null
  gender?: number | null
  avatar?: string | null
  province?: string | null
  ward?: string | null
  addressDetail?: string | null
  /** Bắt buộc khi đặt mật khẩu mới. */
  currentPassword?: string | null
  newPassword?: string | null
  confirmNewPassword?: string | null
}

/** Cập nhật hồ sơ bản thân (Portals). */
export async function updateProfileRequest(body: UpdateProfilePayload) {
  return http.put<AppUserDetailDto>('/api/auth/profile', body)
}

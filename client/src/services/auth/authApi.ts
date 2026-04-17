import { http } from '@/services/http'
import type { AppUserDto } from '@/services/appUserApi'

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  /** Cùng cấu trúc `AppUserDto` — thông tin user sau đăng nhập. */
  user: AppUserDto
}

/** `/api/auth/me` — cùng payload với `user` trong login. */
export type MeResponse = AppUserDto

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

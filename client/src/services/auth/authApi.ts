import { http } from '@/services/http'

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export type MeResponse = {
  sub: string | null
  email: string | null
}

/** Đăng nhập demo — lưu token bằng `setAccessToken` sau khi gọi. */
export async function loginRequest(email: string, password: string) {
  return http.post<LoginResponse>('/api/auth/login', { email, password })
}

export async function meRequest() {
  return http.get<MeResponse>('/api/auth/me')
}

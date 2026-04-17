import type { AxiosRequestConfig } from 'axios'
import axiosBase from './axios/AxiosBase'

/**
 * Gọi API qua cùng baseURL / interceptors với `api`, nhưng trả về `data` (không cần `.then(r => r.data)`).
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosBase.get<T>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosBase.post<T>(url, data, config).then((r) => r.data),
}
